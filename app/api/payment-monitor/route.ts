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
  status: "success" | "pending" | "invalid" | "confirmed";
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

// Config
const NETWORK = "sepolia";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const NODE_URL = process.env.NODE_URL || `https://starknet-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// Production settings - Increased for broader coverage
const REQUIRED_CONFIRMATIONS = 5;
const SCAN_BLOCK_RANGE = 2000; // Increased to 2000 blocks (~16-32 hours)
const CACHE_TTL = 60000;
const CHUNK_SIZE = 500;
const AMOUNT_TOLERANCE = 0.01; // 1% tolerance for amount matching (e.g., fees/rounding)

// ERC20 Transfer event signature (convert to hex)
const ERC20_TRANSFER_EVENT = `0x${hash.starknetKeccak("Transfer").toString(16)}`;

// In-memory cache (consider Redis for production)
const eventCache = new Map<string, { events: any[]; timestamp: number }>();

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
  } catch (error: any) {
    console.error("❌ Provider connection failed:", error.message);
    console.error("Error details:", error);
    
    console.log("🔄 Trying Infura RPC as fallback...");
    try {
      const publicProvider = new Provider({
        chainId: constants.StarknetChainId.SN_SEPOLIA,
        nodeUrl: "https://starknet-sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // Infura Sepolia
      });
      const block = await publicProvider.getBlock("latest");
      console.log("✅ Infura provider connected. Latest block:", block.block_number);
      providerInstance = publicProvider;
      return true;
    } catch (fallbackError: any) {
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
  const auth = request.headers.get('Authorization');
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
const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip =
    (forwardedFor ? forwardedFor.split(',')[0].trim() : undefined) ||
    realIp ||
    'unknown';
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record || now > record.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, message: 'Rate limit exceeded' };
  }

  record.count++;
  return { allowed: true };
}

// Validate Starknet address
function isValidStarknetAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{63,64}$/.test(address);
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

// Payment verification
async function verifyPayment(
  provider: Provider,
  expectedAmount: bigint,
  receiverAddress: string,
  tokenAddress: string
): Promise<TransactionVerificationResult> {
  try {
    console.log("📊 Getting latest block...");
    const currentBlock = await provider.getBlock("latest");
    const currentBlockNumber = currentBlock.block_number;
    console.log("📦 Current block:", currentBlockNumber);

    const fromBlock = Math.max(0, currentBlockNumber - SCAN_BLOCK_RANGE);
    console.log("Scanning blocks:", fromBlock, "to", currentBlockNumber);
    const cacheKey = `${tokenAddress}:${receiverAddress}:${expectedAmount}:${fromBlock}:${currentBlockNumber}`;
    let events: any[] | undefined;

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
      console.log("Event filter:", {
        address: tokenAddress,
        keys: [[ERC20_TRANSFER_EVENT]],
        from_block: { block_number: fromBlock },
        to_block: "latest",
        chunk_size: CHUNK_SIZE
      });
      try {
        const eventsResponse = await provider.getEvents({
          address: tokenAddress,
          keys: [[ERC20_TRANSFER_EVENT]],
          from_block: { block_number: fromBlock },
          to_block: "latest",
          chunk_size: CHUNK_SIZE,
        });
        events = eventsResponse.events;
        console.log(`📊 Found ${events.length} events`);
        const receiverEvents = events.filter((e: any) => e.data?.[1]?.toLowerCase() === receiverAddress.toLowerCase());
        console.log(`Events to receiver (${receiverAddress}):`, receiverEvents.length, receiverEvents.map((e: any) => ({
          transaction_hash: e.transaction_hash,
          block_number: e.block_number,
          amount: e.data?.[2] && e.data?.[3] ? (BigInt(e.data[2]) + (BigInt(e.data[3]) << BigInt(128))).toString() : null
        })));
        eventCache.set(cacheKey, { events, timestamp: Date.now() });
      } catch (error) {
        console.error("❌ Error fetching events:", error);
        return { status: "invalid", error: "Failed to fetch events from blockchain", details: error instanceof Error ? error.message : "Unknown error" };
      }
    }

    const normalizedReceiver = receiverAddress.toLowerCase();
    console.log("🔍 Searching for matching transfer (with", AMOUNT_TOLERANCE * 100, "% tolerance)...");

    let match: any | null = null;
    let closestMatch: any | null = null;
    let minDiff = Infinity;

    events.forEach((event: any) => {
      if (!event.data || event.data.length < 4) {
        console.warn("⚠️ Invalid event data:", event);
        return;
      }

      try {
        const [, to, amountLow, amountHigh] = event.data;
        const amount = BigInt(amountLow) + (BigInt(amountHigh) << BigInt(128));

        if (to.toLowerCase() === normalizedReceiver) {
          const diff = Number(amount - expectedAmount) / Number(expectedAmount);
          const absDiff = Math.abs(diff);
          console.log(`Event to receiver: amount=${amount.toString()} (expected=${expectedAmount.toString()}), diff=${(absDiff * 100).toFixed(2)}%`);

          if (absDiff <= AMOUNT_TOLERANCE) {
            match = event;
            console.log("🎯 Exact/Close match found:", { to, amount: amount.toString(), diff: diff.toFixed(6) });
            return;
          }

          if (absDiff < minDiff) {
            minDiff = absDiff;
            closestMatch = { event, diff: absDiff };
          }
        }
      } catch (error) {
        console.warn("⚠️ Error parsing event data:", error);
      }
    });

    if (closestMatch && !match) {
      console.log("ℹ️ Closest match (not within tolerance):", {
        tx: closestMatch.event.transaction_hash,
        amount: closestMatch.event.data ? (BigInt(closestMatch.event.data[2]) + (BigInt(closestMatch.event.data[3]) << BigInt(128))).toString() : null,
        diff: (closestMatch.diff * 100).toFixed(2) + "%"
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

    console.log("⏳ No matching payment found yet");
    return { status: "pending", details: `Scanned ${events.length} events; ${receiverAddress.toLowerCase()} received ${events.filter((e: any) => e.data?.[1]?.toLowerCase() === normalizedReceiver).length} transfers` };
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return { status: "invalid", error: "Failed to verify payment", details: error instanceof Error ? error.message : "Unknown error" };
  }
}

// GET → for external status checks
export async function GET(request: NextRequest) {
  console.log("🔵 GET API called");
  
  if (!authenticateRequest(request)) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const rateLimitCheck = checkRateLimit(request);
  if (!rateLimitCheck.allowed) {
    return NextResponse.json(
      { error: rateLimitCheck.message },
      { status: 429 }
    );
  }

  const url = new URL(request.url);
  const expectedAmount = url.searchParams.get("amount");
  const receiverAddress = url.searchParams.get("receiver");
  const tokenAddress = url.searchParams.get("token");

  if (!expectedAmount || !receiverAddress || !tokenAddress) {
    return NextResponse.json(
      { error: "Missing query parameters: amount, receiver, token" },
      { status: 400 }
    );
  }

  if (!isValidStarknetAddress(receiverAddress) || !isValidStarknetAddress(tokenAddress)) {
    return NextResponse.json(
      { error: "Invalid receiverAddress or tokenAddress format" },
      { status: 400 }
    );
  }

  try {
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
        { error: "Invalid amount format" },
        { status: 400 }
      );
    }

    const provider = getProvider();
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