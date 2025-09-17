// contexts/NetworkContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type NetworkType = 'testnet' | 'mainnet';

interface NetworkContextType {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  config: any;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// Network configuration - just RPC endpoints, no derivation changes
const networkConfigs = {
  testnet: {
    name: 'Testnet',
    ethereum: {
      chainId: 11155111, // Sepolia
      rpcUrl: 'https://sepolia.infura.io/v3/',
      explorerUrl: 'https://sepolia.etherscan.io'
    },
    bitcoin: {
      network: 'testnet',
      explorerUrl: 'https://blockstream.info/testnet'
    },
    solana: {
      rpcUrl: 'https://api.testnet.solana.com',
      explorerUrl: 'https://explorer.solana.com/?cluster=testnet'
    },
    starknet: {
      rpcUrl: 'https://sepolia.starknet.io',
      explorerUrl: 'https://sepolia.voyager.online'
    }
  },
  mainnet: {
    name: 'Mainnet',
    ethereum: {
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/',
      explorerUrl: 'https://etherscan.io'
    },
    bitcoin: {
      network: 'mainnet',
      explorerUrl: 'https://blockstream.info'
    },
    solana: {
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      explorerUrl: 'https://explorer.solana.com'
    },
    starknet: {
      rpcUrl: 'https://api.starknet.io',
      explorerUrl: 'https://voyager.online'
    }
  }
};

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [network, setNetwork] = useState<NetworkType>('testnet');

  useEffect(() => {
    const savedNetwork = localStorage.getItem('networkPreference') as NetworkType;
    if (savedNetwork) {
      setNetwork(savedNetwork);
    }
  }, []);

  const handleSetNetwork = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
    localStorage.setItem('networkPreference', newNetwork);
  };

  return (
    <NetworkContext.Provider value={{ 
      network, 
      setNetwork: handleSetNetwork, 
      config: networkConfigs[network] 
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};