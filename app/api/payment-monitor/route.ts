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
  confirmations?: number;
}

// Config
const NETWORK = process.env.NEXT_PUBLIC_STARKNET_NETWORK || "sepolia";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const NODE_URL =
  process.env.STARKNET_NODE_URL ||
  (ALCHEMY_API_KEY
    ? `https://starknet-${NETWORK}.g.alchemy.io/v2/${ALCHEMY_API_KEY}`
    : "");

const API_KEYS = process.env.API_KEYS?.split(",") || [];
const REQUIRED_CONFIRMATIONS = parseInt(
  process.env.REQUIRED_CONFIRMATIONS || "6"
);
const SCAN_BLOCK_RANGE = parseInt(process.env.SCAN_BLOCK_RANGE || "1000");
const CACHE_TTL = parseInt(process.env.CACHE_TTL || "30000"); // 30s

// ERC20 Transfer event signature
const ERC20_TRANSFER_EVENT = hash.starknetKeccak("Transfer");

// In-memory caches (replace with Redis in prod)
const eventCache = new Map<string, { events: any[]; timestamp: number }>();
const rateLimitMap = new Map<
  string,
  { count: number; lastRequest: number }
>();

// Rate limit
const RATE_LIMIT = {
  WINDOW_MS: 60000,
  MAX_REQUESTS: 8,
  MAX_REQUESTS_PER_KEY: 100,
};

// Provider (singleton)
let providerInstance: Provider | null = null;
const getProvider = (): Provider => {
  if (!NODE_URL) throw new Error("Starknet node URL not configured");

  if (!providerInstance) {
    providerInstance = new Provider({
      chainId: NETWORK as constants.StarknetChainId,
      nodeUrl: NODE_URL,
    });
  }
  return providerInstance;
};

// Middleware utils
function authenticateRequest(request: NextRequest): boolean {
  if (API_KEYS.length === 0) return true;

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

  const apiKey = authHeader.slice(7);
  return API_KEYS.includes(apiKey);
}

function checkRateLimit(
  request: NextRequest
): { allowed: boolean; message?: string } {
  const apiKey = request.headers.get("authorization")?.replace("Bearer ", "");
  const clientIp = request.headers.get("x-forwarded-for") || "unknown";
  const identifier = apiKey || clientIp;
  const now = Date.now();

  const clientData = rateLimitMap.get(identifier);
  const maxRequests = apiKey
    ? RATE_LIMIT.MAX_REQUESTS_PER_KEY
    : RATE_LIMIT.MAX_REQUESTS;

  if (clientData) {
    if (now - clientData.lastRequest < RATE_LIMIT.WINDOW_MS) {
      if (clientData.count >= maxRequests) {
        return { allowed: false, message: "Rate limit exceeded" };
      }
      rateLimitMap.set(identifier, {
        count: clientData.count + 1,
        lastRequest: now,
      });
    } else {
      rateLimitMap.set(identifier, { count: 1, lastRequest: now });
    }
  } else {
    rateLimitMap.set(identifier, { count: 1, lastRequest: now });
  }

  return { allowed: true };
}

// API: POST → verify payment
export async function POST(request: NextRequest) {
  if (!authenticateRequest(request)) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rateLimitCheck = checkRateLimit(request);
  if (!rateLimitCheck.allowed) {
    return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
  }

  try {
    const body: Partial<PaymentVerificationRequest> = await request.json();
    const { expectedAmount, receiverAddress, tokenAddress } = body;

    if (!expectedAmount || !receiverAddress || !tokenAddress) {
      return NextResponse.json(
        { error: "Missing required parameters: expectedAmount, receiverAddress, tokenAddress" },
        { status: 400 }
      );
    }

    let expectedAmountBigInt: bigint;
    try {
      expectedAmountBigInt = BigInt(expectedAmount);
      if (expectedAmountBigInt <= BigInt(0)) {
        return NextResponse.json({ error: "Expected amount must be positive" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid expected amount format" }, { status: 400 });
    }

    const provider = getProvider();
    const result = await verifyPayment(provider, expectedAmountBigInt, receiverAddress, tokenAddress);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const currentBlock = await provider.getBlock("latest");
    const currentBlockNumber = currentBlock.block_number;

    const fromBlock = currentBlockNumber - SCAN_BLOCK_RANGE;
    const cacheKey = `${tokenAddress}:${receiverAddress}:${expectedAmount}:${fromBlock}:${currentBlockNumber}`;
    let events: any[];

    if (eventCache.has(cacheKey)) {
      events = eventCache.get(cacheKey)!.events;
    } else {
      events = (
        await provider.getEvents({
          address: tokenAddress,
          keys: [[ERC20_TRANSFER_EVENT]],
          from_block: { block_number: fromBlock },
          to_block: "latest",
          chunk_size: 100,
        })
      ).events;

      eventCache.set(cacheKey, { events, timestamp: Date.now() });
    }

    const normalizedReceiver = receiverAddress.toLowerCase();

    const match = events.find((event: any) => {
      if (!event.data || event.data.length < 4) return false;

      const [, to, amountLow, amountHigh] = event.data;
      const amount = BigInt(amountLow) + (BigInt(amountHigh) << BigInt(128));

      return to.toLowerCase() === normalizedReceiver && amount === expectedAmount;
    });

    if (match) {
      const confirmations = currentBlockNumber - match.block_number;

      if (confirmations >= REQUIRED_CONFIRMATIONS) {
        return {
          status: "confirmed",
          transaction: {
            hash: match.transaction_hash,
            block: match.block_number,
            timestamp: match.block_timestamp,
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
            timestamp: match.block_timestamp,
            confirmations,
          },
          confirmations,
        };
      }
    }

    return { status: "pending" };
  } catch (error) {
    console.error("Payment verification error:", error);
    return { status: "invalid", error: "Failed to verify payment" };
  }
}

// GET → for external status checks
export async function GET(request: NextRequest) {
  if (!authenticateRequest(request)) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
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

  const provider = getProvider();
  const result = await verifyPayment(provider, BigInt(expectedAmount), receiverAddress, tokenAddress);

  return NextResponse.json(result);
}
