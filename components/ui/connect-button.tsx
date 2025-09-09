"use client";
import { useAccount, useDisconnect, useConnect } from "@starknet-react/core";
import Image from "next/image";
import { useState } from "react";
import { shortenAddress } from "../lib/utils";
import { ChevronDown, LogOut, X } from "lucide-react";
import { Card } from "./Card";

function ConnectWalletButton() {
  const { address, connector } = useAccount();
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [showDisconnectModal, setShowDisconnectModal] =
    useState<boolean>(false);

  return (
    <>
      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <ConnectWalletModal onClose={() => setShowConnectModal(false)} />
      )}

      {/* Disconnect Wallet Modal */}
      {showDisconnectModal && (
        <WalletDisconnectModal onClose={() => setShowDisconnectModal(false)} />
      )}

      {address ? (
        <div className="flex items-center gap-x-2">
          <Card className="flex items-center  text-foreground  border-1 border-border ">
            {connector?.icon && (
              <Image
                src={connector.icon}
                alt={connector.name || "Wallet"}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
            <span className="hidden md:inline text-base">
              {shortenAddress(address, 4)}
            </span>
            <button
              className="text-foreground hover:bg-hover transition-colors"
              onClick={() => setShowDisconnectModal(true)}
            >
              <ChevronDown size={16} />
            </button>
          </Card>
        </div>
      ) : (
        <Card className="w-fit">
          <button
            className="flex h-full text-foreground"
            onClick={() => setShowConnectModal(true)}
          >
            Connect Wallet
          </button>
        </Card>
      )}
    </>
  );
}

// Connect Wallet Modal Component
function ConnectWalletModal({ onClose }: { onClose: () => void }) {
  const { connect, connectors } = useConnect();

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
      onClose();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  // Filter out unavailable connectors for better UX
  const availableConnectors = connectors.filter((connector) =>
    connector.available()
  );
  const unavailableConnectors = connectors.filter(
    (connector) => !connector.available()
  );

  return (
    <div className="fixed inset-0 bg-black/15 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-background flex flex-col justify-evenly bg-card relative w-[90%] max-w-[550px] h-[400px] ">
        <button
          onClick={onClose}
          className="text-muted-foreground cursor-pointer absolute top-4 right-4"
        >
          <X className=" hover:text-red-500  " />
        </button>
        <Image
          src={"/swiftLogo.svg"}
          alt="Swift logo"
          width={100}
          height={100}
        />
        <div>
          <h1 className="text-head text-[30px] font-black">Connect wallet</h1>
          <p className="text-muted-foreground">
            Choose a wallet to connect to...
          </p>
        </div>
        {/* ... modal header ... */}
        <div className="space-y-3">
          {/* Available Wallets */}
          {availableConnectors.map((connector) => (
            <button
              key={connector.id}
              className="w-full flex items-center justify-start p-4 bg-card hover:bg-hover rounded-md transition-colors text-foreground hover:text-hover"
              onClick={() => handleConnect(connector)}
            >
              <div className="flex items-center space-x-3">
                {connector.icon && (
                  <img
                    src={connector.icon}
                    alt={connector.name}
                    className="w-7 h-7 rounded-full"
                  />
                )}
                <div className="text-left">
                  <div className="font-medium text-base">{connector.name}</div>
                </div>
              </div>
            </button>
          ))}

          {/* Unavailable Wallets */}
          {unavailableConnectors.map((connector) => (
            <div
              key={connector.id}
              className="w-full flex items-center justify-start p-4 bg-[#1F2024] opacity-50 rounded-md text-white cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                {connector.icon && (
                  <img
                    src={"/swiftLogo.svg"}
                    alt={connector.name}
                    className="w-7 h-7 rounded-full"
                  />
                )}
                <div className="text-left">
                  <div className="font-medium text-base">{connector.name}</div>
                  <div className="text-sm text-red-400">
                    Not installed • Get extension
                  </div>
                </div>
              </div>
            </div>
          ))}

          {connectors.length === 0 && (
            <div className="text-center text-[#D9D9D9] py-4">
              No wallets configured. Please check your provider setup.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Disconnect Wallet Modal Component (simplified)
function WalletDisconnectModal({ onClose }: { onClose: () => void }) {
  const { disconnect } = useDisconnect();

  const handleDisconnect = async () => {
    await disconnect();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/15 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <Card
        className="bg-background flex flex-col justify-evenly  relative w-[90%] max-w-[550px] h-[400px] "
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 text-muted-foreground right-4 cursor-pointer hover:text-[red]"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-foreground text-center text-2xl font-normal mb-4">
          Disconnect Wallet
        </h2>

        <h3 className="text-muted-foreground text-center text-base mb-6 font-light">
          Are you sure you want to disconnect your wallet?
        </h3>

        <div className="space-y-3">
          <button
            className="w-full py-3 px-4 bg-card hover:bg-hover rounded-md transition-colors text-foreground hover:text-hover"
            onClick={handleDisconnect}
          >
            Disconnect Wallet
          </button>

          <button
            className="w-full py-3 px-4 bg-card hover:bg-hover rounded-md transition-colors text-foreground hover:text-hover"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </Card>
    </div>
  );
}

export default ConnectWalletButton;
