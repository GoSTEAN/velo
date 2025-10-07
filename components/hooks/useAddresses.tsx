import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
      setAddresses(walletAddresses || []);
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