// app/api/wallet-monitor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BlockchainManager } from "@/service/blockchain-manager";
const blockchainManager = new BlockchainManager();

interface MultiChainWalletMonitorRequest {
  chain: string;
  walletAddress: string;
  fromBlock?: number;
}

export async function POST(request: NextRequest) {
  // ... authentication and rate limiting (same as before)

  try {
    const body: Partial<MultiChainWalletMonitorRequest> = await request.json();
    const { chain, walletAddress, fromBlock } = body;

    if (!chain || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required parameters: chain, walletAddress" },
        { status: 400 }
      );
    }

    const result = await blockchainManager.monitorWallet(
      chain, 
      walletAddress, 
      fromBlock
    );

    return NextResponse.json(result);
  } catch  {
    // Error handling
  }
}

// GET endpoint to list supported chains
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "chains") {
    const chains = blockchainManager.getSupportedChains();
    return NextResponse.json({ chains });
  }

  if (action === "status") {
    const status = await blockchainManager.testAllConnections();
    return NextResponse.json({ status });
  }

  // Existing monitoring functionality
  // const chain = url.searchParams.get("chain");
  // const walletAddress = url.searchParams.get("wallet");
  // const fromBlockParam = url.searchParams.get("fromBlock");

}