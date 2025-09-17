// components/NetworkDropdown.tsx
'use client';

import { useState } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { ChevronDown } from 'lucide-react';

export default function NetworkDropdown() {
  const { network, setNetwork, config } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);

  const networks = [
    { id: 'testnet', name: 'Testnet' },
    { id: 'mainnet', name: 'Mainnet' }
  ];

  const handleSelect = (selectedNetwork: 'testnet' | 'mainnet') => {
    setNetwork(selectedNetwork);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {config.name}
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {networks.map((net) => (
              <button
                key={net.id}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  network === net.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleSelect(net.id as 'testnet' | 'mainnet')}
              >
                {net.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}