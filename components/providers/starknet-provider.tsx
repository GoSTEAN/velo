"use client";
import React from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  jsonRpcProvider,
  argent,
  braavos,
  voyager,
} from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  // Manual connector setup - more reliable for detection
  const connectors = [
    argent(),
    braavos(),
  ];

  const rpc = (chain: any) => {
    if (chain.id === sepolia.id) {
      return { 
        nodeUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://starknet-sepolia.public.blastapi.io" 
      };
    }
    return { 
      nodeUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://starknet-mainnet.public.blastapi.io" 
    };
  };

  return (
    <StarknetConfig
      chains={[sepolia]}
      connectors={connectors}
      explorer={voyager}
      autoConnect={true}
      provider={jsonRpcProvider({ rpc })}
    >
      {children}
    </StarknetConfig>
  );
}