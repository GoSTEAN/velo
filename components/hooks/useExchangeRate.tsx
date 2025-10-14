import { useEffect, useState, useCallback, useRef } from "react";


type Rates = {
  USDT: number | null;
  USDC: number | null;
  STRK: number | null;
  ETH: number | null;
  BTC: number | null;
  SOL: number | null;
  DOT: number | null;
  XML: number | null;
  [key: string]: number | null;
};

const API_ENDPOINT = '/api/exchange-rates';
const REFETCH_INTERVAL = 60000;
const MAX_RETRIES = 3;

export default function useExchangeRates() {
  const [rates, setRates] = useState<Rates>({
    USDT: 1, USDC: 1, STRK: 1, SOL: 1, ETH: 1, BTC: 1, DOT: 1, XML: 1,
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isFetching = useRef(false); 

  const fetchRates = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetching.current) return;
    
    if (retryCount >= MAX_RETRIES) {
      setError("Maximum retry attempts reached");
      setIsLoading(false);
      return;
    }

    isFetching.current = true;
    setIsLoading(true);

    try {
      console.log('Fetching exchange rates...'); 
      
      const response = await fetch(API_ENDPOINT, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data)
      if (data.error) {
        throw new Error(data.error);
      }

      const newRates = {
        USDT: data.tether?.ngn ?? 1,
        USDC: data["usd-coin"]?.ngn ?? 1,
        STRK: data.starknet?.ngn ?? 1,
        BTC: data.bitcoin?.ngn ?? 1,
        ETH: data.ethereum?.ngn ?? 1,
        SOL: data.solana?.ngn ?? 1,
        DOT: data.polkadot?.ngn ?? 1,
        XML: data.stellar?.ngn ?? 1,
      };

      setRates(newRates);
      setLastUpdated(new Date());
      setRetryCount(0);
      setError(null);
      console.log('Rates fetched successfully');
    } catch (err) {
      console.error("Rate fetch error:", err);
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      setError(`Failed to fetch rates (attempt ${newRetryCount}/${MAX_RETRIES})`);
      
      
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [retryCount]); 

  useEffect(() => {
   
    fetchRates();

    // Set up interval - use fixed interval, not dynamic based on retryCount
    const intervalId = setInterval(() => {
      fetchRates();
    }, REFETCH_INTERVAL);

    return () => {
      clearInterval(intervalId);
      isFetching.current = false; 
    };
  }, [fetchRates]); 

  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    fetchRates();
  }, [fetchRates]);

  return {
    rates,
    lastUpdated,
    isLoading,
    error,
    retryCount,
    retry,
  };
}