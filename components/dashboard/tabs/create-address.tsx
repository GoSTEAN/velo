// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useNetwork } from "@/components/context/NetworkContext";
import NetworkDropdown from "@/components/modals/NetworkDropdown";
import { Copy, Check } from "lucide-react";
import { GeneratedWallets } from "@/components/lib/utils/walletGenerator"; // Import the correct type

export default function Dashboard() {
  const { network, config } = useNetwork();
  const [wallets, setWallets] = useState<GeneratedWallets | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Optionally notify the user (e.g., with a toast)
    }
  };

  useEffect(() => {
    const walletsStr = sessionStorage.getItem("decryptedWallets");
    if (walletsStr) {
      try {
        const parsedWallets = JSON.parse(walletsStr);
        // Adjust based on whether decryptedWallets is EncryptedWalletData or GeneratedWallets
        // Assuming decryption in LoginForm.tsx returns GeneratedWallets
        setWallets(parsedWallets.wallets || parsedWallets); // Handle both cases
      } catch (error) {
        console.error("Failed to parse decrypted wallets:", error);
      }
    }
  }, []);

  const getExplorerLink = (chain: string, address: string) => {
    const baseUrl = config[chain]?.explorerUrl;
    if (!baseUrl) return "#";

    switch (chain) {
      case "ethereum":
        return `${baseUrl}/address/${address}`;
      case "bitcoin":
        return `${baseUrl}/address/${address}`;
      case "solana":
        return `${baseUrl}/address/${address}`;
      case "starknet":
        return `${baseUrl}/contract/${address}`;
      default:
        return "#";
    }
  };

  return (
    <div>
      {/* Header with network dropdown */}
      <div className="">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold"></h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Network:</span>
            <NetworkDropdown />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            <strong>Note:</strong> Your wallet addresses work on both testnet
            and mainnet. Switching networks only changes which blockchain you're
            viewing.
          </p>
        </div> */}

        {wallets ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ethereum */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Ethereum Wallet</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {config.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono bg-gray-100 p-3 rounded flex-1">
                  {wallets.ethereum.address}
                </p>
                <button
                  onClick={() => copyToClipboard(wallets.ethereum.address, "eth")}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  {copied === "eth" ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <a
                href={getExplorerLink("ethereum", wallets.ethereum.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-500 text-sm hover:underline mt-2"
              >
                View on Explorer →
              </a>
            </div>

            {/* Bitcoin */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Bitcoin Wallet</h2>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  {config.name}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Segwit Address</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono bg-gray-100 p-3 rounded flex-1 text-sm">
                      {wallets.bitcoin.segwit_address}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(wallets.bitcoin.segwit_address, "btc-segwit")
                      }
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      {copied === "btc-segwit" ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Legacy Address</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono bg-gray-100 p-3 rounded flex-1 text-sm">
                      {wallets.bitcoin.legacy_address}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(wallets.bitcoin.legacy_address, "btc-legacy")
                      }
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      {copied === "btc-legacy" ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <a
                href={getExplorerLink("bitcoin", wallets.bitcoin.segwit_address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-500 text-sm hover:underline mt-2"
              >
                View on Explorer →
              </a>
            </div>

            {/* Solana */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Solana Wallet</h2>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {config.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono bg-gray-100 p-3 rounded flex-1">
                  {wallets.solana.address}
                </p>
                <button
                  onClick={() => copyToClipboard(wallets.solana.address, "sol")}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  {copied === "sol" ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <a
                href={getExplorerLink("solana", wallets.solana.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-500 text-sm hover:underline mt-2"
              >
                View on Explorer →
              </a>
            </div>

            {/* Starknet */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Starknet Wallet</h2>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  {config.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono bg-gray-100 p-3 rounded flex-1">
                  {wallets.starknet.address}
                </p>
                <button
                  onClick={() => copyToClipboard(wallets.starknet.address, "stark")}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  {copied === "stark" ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <a
                href={getExplorerLink("starknet", wallets.starknet.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-500 text-sm hover:underline mt-2"
              >
                View on Explorer →
              </a>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No wallets loaded. Please log in.</p>
        )}
      </div>
    </div>
  );
}