import { NextRequest, NextResponse } from "next/server";
import { Provider, constants, hash } from "starknet";

// Types
interface PaymentVerificationRequest {
  expectedAmount: string;
  receiverAddress: string;
  tokenAddress: string;
  description?: string;
}

interface TransactionVerificationResult {
  status: "success" | "pending" | "invalid" | "confirmed" | "failed";
  transaction?: {
    hash: string;
    block: number;
    timestamp: number;
    confirmations?: number;
  };
  error?: string;
  details?: string;
  confirmations?: number;
}

interface StarknetEvent {
  data: string[];
  transaction_hash: string;
  block_number: number;
  // Add other properties as needed
}

interface CachedEvents {
  events: StarknetEvent[];
  timestamp: number;
}


// Config
const NETWORK = "sepolia";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const NODE_URL = process.env.NODE_URL || `https://starknet-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// Production settings
const REQUIRED_CONFIRMATIONS = 3; 
const SCAN_BLOCK_RANGE = 5000;
const CACHE_TTL = 30000; 
const CHUNK_SIZE = 1000; 
const AMOUNT_TOLERANCE = 0.01;
const TIMEOUT_MS = 180000;
const RECENT_THRESHOLD_SECONDS = 60; 

const ERC20_TRANSFER_EVENT = hash.getSelectorFromName("Transfer");

// In-memory cache
const eventCache = new Map<string, CachedEvents>();

// Provider (singleton)
let providerInstance: Provider | null = null;
const getProvider = (): Provider => {
  if (!NODE_URL) throw new Error("Starknet node URL not configured");

  if (!providerInstance) {
    console.log("🔗 Creating new provider instance with URL:", NODE_URL);
    providerInstance = new Provider({
      chainId: constants.StarknetChainId.SN_SEPOLIA,
      nodeUrl: NODE_URL,
    });
  }
  return providerInstance;
};

// Test provider connection
async function testProviderConnection(): Promise<boolean> {
  try {
    const provider = getProvider();
    console.log("🔄 Testing provider connection...");
    const block = await provider.getBlock("latest");
    console.log("✅ Provider connected successfully. Latest block:", block.block_number);
    return true;
  } catch (error: string | any ) {
    console.error("❌ Provider connection failed:", error.message);
    console.error("Error details:", error);

    console.log("🔄 Trying Infura RPC as fallback...");
    try {
      const publicProvider = new Provider({
        chainId: constants.StarknetChainId.SN_SEPOLIA,
        nodeUrl: "https://starknet-sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      });
      const block = await publicProvider.getBlock("latest");
      console.log("✅ Infura provider connected. Latest block:", block.block_number);
      providerInstance = publicProvider;
      return true;
    } catch (fallbackError: string|any) {
      console.error("❌ Infura provider connection failed:", fallbackError.message);
      return false;
    }
  }
}

// Authentication
const API_KEY = process.env.PAYMENT_API_KEY;
function authenticateRequest(request: NextRequest): boolean {
  if (!API_KEY) {
    console.warn("⚠️ No PAYMENT_API_KEY set; bypassing authentication");
    return true;
  }
  const auth = request.headers.get("Authorization");
  return auth === `Bearer ${API_KEY}`;
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

function checkRateLimit(request: NextRequest): {
  allowed: boolean;
  message?: string;
} {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = (forwardedFor ? forwardedFor.split(",")[0].trim() : undefined) || realIp || "unknown";
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, message: "Rate limit exceeded" };
  }

  record.count++;
  return { allowed: true };
}

function normalizeStarknetAddress(address: string): string {
  // Remove 0x prefix and convert to lowercase
  let normalized = address.toLowerCase().replace("0x", "");

  // Pad to 64 characters (full felt252 length)
  normalized = normalized.padStart(64, "0");

  // Add back 0x prefix
  return "0x" + normalized;
}

// Validate Starknet address
function isValidStarknetAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{1,64}$/.test(address); // More flexible address validation
}

async function debugTokenTransfers(
  provider: Provider,
  tokenAddress: string,
  receiverAddress: string,
  blockRange = 1000,
) {
  try {
    const currentBlock = await provider.getBlock("latest");
    const fromBlock = Math.max(0, currentBlock.block_number - blockRange);

    console.log("🔍 Debug: Scanning for all token transfers...");
    console.log("🎯 Target receiver (normalized):", normalizeStarknetAddress(receiverAddress));

    const eventsResponse = await provider.getEvents({
      address: tokenAddress,
      keys: [[ERC20_TRANSFER_EVENT]],
      from_block: { block_number: fromBlock },
      to_block: "latest",
      chunk_size: 100,
    });

    console.log(`📊 Found ${eventsResponse.events.length} transfer events:`);

    const normalizedReceiver = normalizeStarknetAddress(receiverAddress);
    let transfersToReceiver = 0;

    eventsResponse.events.forEach((event: string|any, index: number) => {
      if (!event.data || event.data.length < 3) return;

      const toAddress = normalizeStarknetAddress(event.data[1]);
      const isToReceiver = toAddress === normalizedReceiver;

      if (isToReceiver) transfersToReceiver++;

      console.log(`--- Event ${index} ${isToReceiver ? "🎯 MATCH!" : ""} ---`);
      console.log(`Tx Hash: ${event.transaction_hash}`);
      console.log(`Block: ${event.block_number}`);
      console.log(`From: ${normalizeStarknetAddress(event.data[0])}`);
      console.log(`To: ${toAddress} ${isToReceiver ? "(TARGET RECEIVER)" : ""}`);

      if (event.data && event.data.length >= 3) {
        const low = BigInt(event.data[2]);
        const high = event.data[3] ? BigInt(event.data[3]) : BigInt(0);
        const amount = low + (high << BigInt(128));
        console.log(`Amount: ${amount.toString()}`);
      }
      console.log("-------------------");
    });

    console.log(`📈 Found ${transfersToReceiver} transfers to target receiver: ${receiverAddress}`);
    return eventsResponse.events;
  } catch (error) {
    console.error("Debug failed:", error);
    return [];
  }
}

// API: POST → verify payment
export async function POST(request: NextRequest) {
  console.log("🔵 API called - checking environment variables...");
  console.log("ALCHEMY_API_KEY exists:", !!ALCHEMY_API_KEY);
  console.log("NODE_URL:", NODE_URL);
  console.log("NETWORK:", NETWORK);

  // Test provider connection
  const isConnected = await testProviderConnection();
  if (!isConnected) {
    return NextResponse.json(
      { error: "Failed to connect to Starknet node", details: "Check your RPC URL" },
      { status: 500 }
    );
  }

  // Authentication
  if (!authenticateRequest(request)) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Rate limiting
  const rateLimitCheck = checkRateLimit(request);
  if (!rateLimitCheck.allowed) {
    return NextResponse.json(
      { error: rateLimitCheck.message },
      { status: 429 }
    );
  }

  try {
    const body: Partial<PaymentVerificationRequest> = await request.json();
    console.log("📦 Request body:", body);
    
    const { expectedAmount, receiverAddress, tokenAddress } = body;

    if (!expectedAmount || !receiverAddress || !tokenAddress) {
      console.log("❌ Missing parameters");
      return NextResponse.json(
        { error: "Missing required parameters: expectedAmount, receiverAddress, tokenAddress" },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!isValidStarknetAddress(receiverAddress) || !isValidStarknetAddress(tokenAddress)) {
      console.log("❌ Invalid address format");
      return NextResponse.json(
        { error: "Invalid receiverAddress or tokenAddress format" },
        { status: 400 }
      );
    }

    let expectedAmountBigInt: bigint;
    try {
      expectedAmountBigInt = BigInt(expectedAmount);
      if (expectedAmountBigInt <= BigInt(0)) {
        return NextResponse.json(
          { error: "Expected amount must be positive" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid expected amount format" },
        { status: 400 }
      );
    }

    console.log("🔍 Starting payment verification...");
    const provider = getProvider();

    // Run debug first to see what's happening
    await debugTokenTransfers(provider, tokenAddress, receiverAddress, 500);

    const result = await verifyPayment(
      provider,
      expectedAmountBigInt,
      receiverAddress,
      tokenAddress
    );

    console.log("✅ Verification result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function verifyPayment(
  provider: Provider,
  expectedAmount: bigint,
  receiverAddress: string,
  tokenAddress: string,
): Promise<TransactionVerificationResult> {
  const startTime = Date.now();
  const currentTime = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds

  try {
    console.log("📊 Getting latest block...");
    const currentBlock = await provider.getBlock("latest");
    const currentBlockNumber = currentBlock.block_number;
    console.log("📦 Current block:", currentBlockNumber);

    const fromBlock = Math.max(0, currentBlockNumber - SCAN_BLOCK_RANGE);
    console.log("Scanning blocks:", fromBlock, "to", currentBlockNumber);

    const normalizedReceiver = normalizeStarknetAddress(receiverAddress);
    const normalizedToken = normalizeStarknetAddress(tokenAddress);

    console.log("🎯 Normalized receiver:", normalizedReceiver);
    console.log("🪙 Normalized token:", normalizedToken);

    const cacheKey = `${normalizedToken}:${normalizedReceiver}:${expectedAmount}:${fromBlock}:${currentBlockNumber}`;
    let events: StarknetEvent[] | undefined;

    if (eventCache.has(cacheKey)) {
      const cached = eventCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log("♻️ Using cached events");
        events = cached.events;
      } else {
        eventCache.delete(cacheKey);
      }
    }

    if (!events) {
      console.log("🌐 Fetching events from blockchain...");
      let allEvents: any[] = [];
      let continuationToken: string | undefined = undefined;
      do {
        console.log(`Fetching chunk with token: ${continuationToken || 'none'}`);
        const eventsResponse = await provider.getEvents({
          address: normalizedToken,
          keys: [[ERC20_TRANSFER_EVENT]],
          from_block: { block_number: fromBlock },
          to_block: "latest",
          chunk_size: CHUNK_SIZE,
          continuation_token: continuationToken,
        });
        allEvents = allEvents.concat(eventsResponse.events);
        continuationToken = eventsResponse.continuation_token;
      } while (continuationToken);

      console.log(`📊 Found ${allEvents.length} Transfer events (all pages)`);
      events = allEvents;

      eventCache.set(cacheKey, { events, timestamp: Date.now() });
    }

    console.log(`🔍 Searching for transfers to: ${normalizedReceiver}`);
    console.log(`💰 Expected amount: ${expectedAmount.toString()}`);

    let match: any | null = null;
    let closestMatch: any | null = null;
    let minDiff = Number.POSITIVE_INFINITY;
    let receiverTransfers = 0;

    // Sort events by block_number descending to process latest first
    events.sort((a, b) => b.block_number - a.block_number);

    for (const event of events) {
      if (!event.data || event.data.length < 3) {
        console.warn(`⚠️ Event: Invalid data length`, event.data);
        continue;
      }

      try {
        const from = normalizeStarknetAddress(event.data[0]);
        const to = normalizeStarknetAddress(event.data[1]);
        const amountLow = event.data[2];
        const amountHigh = event.data[3] || "0x0";

        let low: bigint, high: bigint;
        try {
          low = BigInt(amountLow);
          high = BigInt(amountHigh);
        } catch {
          console.warn(`⚠️ Failed to parse amount`, { amountLow, amountHigh });
          continue;
        }

        const amount = low + (high << BigInt(128));

        if (to === normalizedReceiver) {
          receiverTransfers++;
          console.log(`🎯 Transfer to our receiver!`);
          console.log(`   Amount: ${amount.toString()}`);
          console.log(`   From: ${from}`);
          console.log(`   Tx: ${event.transaction_hash}`);
          console.log(`   Block: ${event.block_number}`);

          // Fetch block timestamp
          const block = await provider.getBlock(event.block_number);
          const timestamp = block.timestamp;
          console.log(`   Timestamp: ${timestamp}`);

          // Only consider recent transfers
          if (timestamp >= currentTime - RECENT_THRESHOLD_SECONDS) {
            const diff =
              Number(amount > expectedAmount ? amount - expectedAmount : expectedAmount - amount) / Number(expectedAmount);

            console.log(
              `   Expected: ${expectedAmount.toString()}, Actual: ${amount.toString()}, Diff: ${(diff * 100).toFixed(2)}%`,
            );

            if (diff <= AMOUNT_TOLERANCE) {
              match = event;
              match.block_timestamp = timestamp; // Add timestamp to match
              console.log("✅ Recent match found within tolerance!");
              break; // Exit loop since we found the latest match (due to sorting)
            }

            if (diff < minDiff) {
              minDiff = diff;
              closestMatch = { event, diff, amount: amount.toString() };
            }
          } else {
            console.log("🕒 Ignoring old transfer (outside recent threshold)");
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing event:`, error);
      }
    }

    console.log(`📊 Total transfers to receiver: ${receiverTransfers}`);

    if (closestMatch && !match) {
      console.log("ℹ️ Closest recent match (outside tolerance):", {
        tx: closestMatch.event.transaction_hash,
        amount: closestMatch.amount,
        diff: (closestMatch.diff * 100).toFixed(2) + "%",
      });
    }

    if (match) {
      const confirmations = currentBlockNumber - match.block_number;
      console.log("✅ Payment found with confirmations:", confirmations);

      if (confirmations >= REQUIRED_CONFIRMATIONS) {
        return {
          status: "confirmed",
          transaction: {
            hash: match.transaction_hash,
            block: match.block_number,
            timestamp: match.block_timestamp || Math.floor(Date.now() / 1000),
            confirmations,
          },
          confirmations,
        };
      } else {
        return {
          status: "success",
          transaction: {
            hash: match.transaction_hash,
            block: match.block_number,
            timestamp: match.block_timestamp || Math.floor(Date.now() / 1000),
            confirmations,
          },
          confirmations,
        };
      }
    }

    // Check if timeout has been reached
    if (Date.now() - startTime >= TIMEOUT_MS) {
      console.log("⏰ Timeout reached after 3 minutes, no payment detected");
      return {
        status: "failed",
        error: "Payment not detected within 3 minutes",
        details: `Scanned ${events.length} events in blocks ${fromBlock}-${currentBlockNumber}; found ${receiverTransfers} transfers to receiver`,
      };
    }

    console.log("⏳ No matching payment found yet");
    return {
      status: "pending",
      details: `Scanned ${events.length} events in blocks ${fromBlock}-${currentBlockNumber}; found ${receiverTransfers} transfers to receiver`,
    };
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return {
      status: "failed",
      error: "Failed to verify payment (provider error or timeout)",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// GET → for external status checks
export async function GET(request: NextRequest) {
  console.log("🔵 GET API called");

  if (!authenticateRequest(request)) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rateLimitCheck = checkRateLimit(request);
  if (!rateLimitCheck.allowed) {
    return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
  }

  const url = new URL(request.url);
  const expectedAmount = url.searchParams.get("amount");
  const receiverAddress = url.searchParams.get("receiver");
  const tokenAddress = url.searchParams.get("token");

  if (!expectedAmount || !receiverAddress || !tokenAddress) {
    return NextResponse.json({ error: "Missing query parameters: amount, receiver, token" }, { status: 400 });
  }

  if (!isValidStarknetAddress(receiverAddress) || !isValidStarknetAddress(tokenAddress)) {
    return NextResponse.json({ error: "Invalid receiverAddress or tokenAddress format" }, { status: 400 });
  }

  try {
    let expectedAmountBigInt: bigint;
    try {
      expectedAmountBigInt = BigInt(expectedAmount);
      if (expectedAmountBigInt <= BigInt(0)) {
        return NextResponse.json({ error: "Expected amount must be positive" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid amount format" }, { status: 400 });
    }

    const provider = getProvider();
    await debugTokenTransfers(provider, tokenAddress, receiverAddress, 500); // Run debug for GET too
    const result = await verifyPayment(provider, expectedAmountBigInt, receiverAddress, tokenAddress);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ GET endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}