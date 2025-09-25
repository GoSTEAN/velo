// hooks/useWalletAddresses.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fixStarknetAddress } from '@/components/lib/utils';

export const useWalletAddresses = () => {
  const { getWalletAddresses, token } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const walletAddresses = await getWalletAddresses();
      // Filter and fix Starknet addresses
      const fixedAddresses = walletAddresses ? walletAddresses.map(addr => {
        if (addr.chain?.toLowerCase() === 'starknet' && addr.address) {
          return {
            ...addr,
            address: fixStarknetAddress(addr.address)
          };
        }
        return addr;
      }) : walletAddresses;
      
      setAddresses(fixedAddresses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  return { addresses, loading, error, refetch: fetchAddresses };
};