import { useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { Contract, RpcProvider } from "starknet";
import { SWIFT_ABI as BALANCE_ABI } from "./useSwiftContract";
import { TOKEN_ADDRESSES as tokenAddress } from "autoswap-sdk";
//  token addresses
const TOKEN_ADDRESSES = {
  STRK: tokenAddress.STRK,
  USDC: tokenAddress.USDC,
  USDT: tokenAddress.USDT,
};

// Token decimals for formatting
const TOKEN_DECIMALS = {
  [TOKEN_ADDRESSES.STRK]: 18,
  [TOKEN_ADDRESSES.USDC]: 6,
  [TOKEN_ADDRESSES.USDT]: 6,
};

// Central contract address for get_balance
const BALANCE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

type Balances = {
  STRK: string;
  USDC: string;
  USDT: string;
};

type UseGetBalanceReturn = {
  balances: Balances;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export default function useGetBalance(): UseGetBalanceReturn {
  const { address } = useAccount();
  const [balances, setBalances] = useState<Balances>({
    STRK: "0",
    USDC: "0",
    USDT: "0",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const provider = new RpcProvider({
    nodeUrl: "https://starknet-sepolia.public.blastapi.io",
  });

  const fetchBalances = async () => {
    if (!address) {
      setBalances({
        STRK: "0",
        USDC: "0",
        USDT: "0",
      });
      setError("No wallet connected");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!BALANCE_CONTRACT_ADDRESS) {
        throw new Error("Balance contract address is not defined");
      }

      const contract = new Contract(
        BALANCE_ABI,
        BALANCE_CONTRACT_ADDRESS,
        provider
      );

      const balancePromises = Object.keys(TOKEN_ADDRESSES).map((token) =>
        contract
          .call("get_balance", [
            address,
            TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES],
          ])
          .catch((err: any) => {
            console.error(`Error fetching balance for ${token}:`, err);
            throw new Error(`Failed to fetch ${token} balance: ${err.message}`);
          })
      );

      const results = await Promise.allSettled(balancePromises);

      const newBalances: Balances = {
        STRK: "0",
        USDC: "0",
        USDT: "0",
      };

      results.forEach((result, index) => {
        const token = Object.keys(TOKEN_ADDRESSES)[index] as keyof Balances;
        const decimals = TOKEN_DECIMALS[TOKEN_ADDRESSES[token]];

        if (result.status === "fulfilled") {
          const balanceValue =
            typeof result.value === "object" && "balance" in result.value
              ? result.value.balance
              : Array.isArray(result.value)
              ? result.value[0]
              : result.value;

          newBalances[token] = (Number(balanceValue) / 10 ** decimals).toFixed(
            2
          );
        } else {
          console.error(`Failed to fetch ${token} balance:`, result.reason);
          setError((prev) =>
            prev ? `${prev}; ${result.reason.message}` : result.reason.message
          );
          newBalances[token] = "0";
        }
      });

      setBalances(newBalances);
    } catch (err: any) {
      console.error("Error fetching balances:", err);
      setError(`Failed to fetch balances: ${err.message || "Unknown error"}`);
      setBalances({
        STRK: "0",
        USDC: "0",
        USDT: "0",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [address]);

  return {
    balances,
    loading,
    error,
    refetch: fetchBalances,
  };
}
