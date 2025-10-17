import { useState, useEffect, useCallback } from 'react';

interface BalanceHistory {
  timestamp: number;
  balance: number;
}

interface BalanceTrend {
  currentBalance: number;
  previousBalance: number;
  change: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'same';
}

const STORAGE_KEY = 'balance_history';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const useBalanceTrend = (currentBalance: number, loading: boolean) => {
  const [trend, setTrend] = useState<BalanceTrend>({
    currentBalance: 0,
    previousBalance: 0,
    change: 0,
    percentageChange: 0,
    trend: 'same'
  });

  // Get balance history from localStorage
  const getBalanceHistory = useCallback((): BalanceHistory[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading balance history:', error);
      return [];
    }
  }, []);

  // Save balance history to localStorage
  const saveBalanceHistory = useCallback((history: BalanceHistory[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving balance history:', error);
    }
  }, []);

  // Clean up old entries (older than 24 hours)
  const cleanupOldEntries = useCallback((history: BalanceHistory[]): BalanceHistory[] => {
    const now = Date.now();
    return history.filter(entry => now - entry.timestamp <= TWENTY_FOUR_HOURS);
  }, []);

  // Calculate trend based on history
  const calculateTrend = useCallback((history: BalanceHistory[], currentBalance: number): BalanceTrend => {
    if (history.length === 0) {
      return {
        currentBalance,
        previousBalance: currentBalance,
        change: 0,
        percentageChange: 0,
        trend: 'same'
      };
    }

    // Get the oldest entry within 24 hours as previous balance
    const previousEntry = history[0];
    const previousBalance = previousEntry.balance;
    const change = currentBalance - previousBalance;
    
    let percentageChange = 0;
    if (previousBalance !== 0) {
      percentageChange = (change / previousBalance) * 100;
    }

    let trend: 'up' | 'down' | 'same' = 'same';
    if (change > 0) trend = 'up';
    else if (change < 0) trend = 'down';

    return {
      currentBalance,
      previousBalance,
      change,
      percentageChange,
      trend
    };
  }, []);

  // Update balance history and calculate trend
  const updateBalanceTrend = useCallback(() => {
    if (loading || currentBalance === 0) return;

    const now = Date.now();
    let history = getBalanceHistory();
    
    // Clean up old entries
    history = cleanupOldEntries(history);
    
    // Check if we need to add a new entry
    const shouldAddEntry = history.length === 0 || 
      (now - history[history.length - 1].timestamp) >= TWENTY_FOUR_HOURS;

    if (shouldAddEntry) {
      // Add new entry
      history.push({
        timestamp: now,
        balance: currentBalance
      });
      
      // Clean up again after adding
      history = cleanupOldEntries(history);
      saveBalanceHistory(history);
    }

    // Calculate trend
    const newTrend = calculateTrend(history, currentBalance);
    setTrend(newTrend);
  }, [currentBalance, loading, getBalanceHistory, saveBalanceHistory, cleanupOldEntries, calculateTrend]);

  useEffect(() => {
    updateBalanceTrend();
  }, [updateBalanceTrend]);

  return trend;
};