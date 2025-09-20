import { useEffect, useState } from "react";
import { useAccount, useContract } from "@starknet-react/core";
import { VELO_ABI as STARKPAY_ABI } from "./useSwiftContract";
import { useCallback } from "react";

export function useUserRole() {
  const { address } = useAccount();
  const [role, setRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const { contract } = useContract({
    abi: STARKPAY_ABI,
    address: contractAddress as `0x${string}`,
  });

  const checkUserRole = useCallback(async () => {
    if (!address || !contractAddress) {
      setRole(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!contract) return;
      const roleNumber = await contract.get_user_role(address);
      setRole(Number(roleNumber));
    } catch (err) {
      console.error("Error fetching user role:", err);
      setError("Failed to fetch user role");
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [address, contractAddress, contract]);

  useEffect(() => {
    checkUserRole();
    const interval = setInterval(checkUserRole, 300000);
    return () => clearInterval(interval);
  }, [address, checkUserRole]);

  // ✅ Always return the same object shape
  return {
    role,
    isMerchant: role === 1,
    isUser: role === 0,
    loading,
    error,
    refresh: checkUserRole,
  };
}
