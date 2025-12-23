import QRCodeLib from "qrcode";

export interface QRCodeOptions {
  amount?: string | null;
  label?: string | null;
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export interface QRCodeResult {
  dataUrl: string;
  rawData: string;
  format: string;
}

export interface ExplorerUrls {
  testnet: string;
  mainnet: string;
}

/**
 * Generate QR code URI data for different blockchain networks
 */
export const generateQRData = (
  chain: string,
  address: string,
  amount?: string,
  label?: string
): string => {
  const normalizedChain = chain.toLowerCase();
  const normalizedAddress = address.trim();

  switch (normalizedChain) {
    case "bitcoin":
    case "btc": {
      let bitcoinUri = `bitcoin:${normalizedAddress}`;
      const bitcoinParams = [];
      if (amount) bitcoinParams.push(`amount=${amount}`);
      if (label) bitcoinParams.push(`label=${encodeURIComponent(label)}`);
      if (bitcoinParams.length > 0) {
        bitcoinUri += `?${bitcoinParams.join("&")}`;
      }
      return bitcoinUri;
    }

    case "ethereum":
    case "eth": {
      let ethereumUri = `ethereum:${normalizedAddress}`;
      const ethereumParams = [];
      if (amount) {
        const weiAmount = (parseFloat(amount) * Math.pow(10, 18)).toString();
        ethereumParams.push(`value=${weiAmount}`);
      }
      if (label) ethereumParams.push(`label=${encodeURIComponent(label)}`);
      if (ethereumParams.length > 0) {
        ethereumUri += `?${ethereumParams.join("&")}`;
      }
      return ethereumUri;
    }

    case "solana":
    case "sol": {
      let solanaUri = `solana:${normalizedAddress}`;
      const solanaParams = [];
      if (amount) solanaParams.push(`amount=${amount}`);
      if (label) solanaParams.push(`label=${encodeURIComponent(label)}`);
      if (solanaParams.length > 0) {
        solanaUri += `?${solanaParams.join("&")}`;
      }
      return solanaUri;
    }

    case "starknet":
    case "strk": {
      let starknetUri = `starknet:${normalizedAddress}`;
      const starknetParams = [];
      if (amount) {
        const weiAmount = (parseFloat(amount) * Math.pow(10, 18)).toString();
        starknetParams.push(`value=${weiAmount}`);
      }
      if (label) starknetParams.push(`label=${encodeURIComponent(label)}`);
      if (starknetParams.length > 0) {
        starknetUri += `?${starknetParams.join("&")}`;
      }
      return starknetUri;
    }

    case "stellar":
    case "xlm": {
      let stellarUri = `web+stellar:pay?destination=${normalizedAddress}`;
      const stellarParams = [];
      if (amount) {
        stellarParams.push(`amount=${amount}`);
      }
      if (label) stellarParams.push(`memo=${encodeURIComponent(label)}`);
      if (stellarParams.length > 0) {
        stellarUri += `&${stellarParams.join("&")}`;
      }
      return stellarUri;
    }

    case "polkadot":
    case "dot": {
      let polkadotUri = `substrate:${normalizedAddress}`;
      const polkadotParams = [];
      if (amount) {
        polkadotParams.push(`amount=${amount}`);
      }
      if (label) polkadotParams.push(`label=${encodeURIComponent(label)}`);
      if (polkadotParams.length > 0) {
        polkadotUri += `?${polkadotParams.join("&")}`;
      }
      return polkadotUri;
    }

    case "usdt_erc20":
    case "usdt_erc": {
      return `ethereum:${normalizedAddress}`;
    }

    case "usdt_trc20":
    case "usdt_trc": {
      return `tron:${normalizedAddress}`;
    }

    case "erc20": {
      let erc20Uri = `ethereum:${normalizedAddress}`;
      const erc20Params = [];
      if (amount) {
        const weiAmount = (parseFloat(amount) * Math.pow(10, 18)).toString();
        erc20Params.push(`value=${weiAmount}`);
      }
      if (label) erc20Params.push(`label=${encodeURIComponent(label)}`);
      if (erc20Params.length > 0) {
        erc20Uri += `?${erc20Params.join("&")}`;
      }
      return erc20Uri;
    }

    case "trc20": {
      let trc20Uri = `tron:${normalizedAddress}`;
      const trc20Params = [];
      if (amount) {
        const sunAmount = (parseFloat(amount) * Math.pow(10, 6)).toString();
        trc20Params.push(`amount=${sunAmount}`);
      }
      if (label) trc20Params.push(`label=${encodeURIComponent(label)}`);
      if (trc20Params.length > 0) {
        trc20Uri += `?${trc20Params.join("&")}`;
      }
      return trc20Uri;
    }

    default: {
      // Return plain address for unsupported chains
      if (amount || label) {
        console.warn(`Chain "${chain}" doesn't support URI schemes with amount/label. Using plain address.`);
      }
      return normalizedAddress;
    }
  }
};

/**
 * Generate a compatible QR code image data URL
 */
export const generateCompatibleQRCode = async (
  chain: string,
  address: string,
  options: QRCodeOptions = {}
): Promise<QRCodeResult> => {
  const {
    amount = null,
    label = null,
    width = 200,
    margin = 2,
    darkColor = "#000000",
    lightColor = "#FFFFFF",
    errorCorrectionLevel = "M",
  } = options;

  try {
    const qrData = generateQRData(chain, address, amount || undefined, label || undefined);
    
    const qrCodeDataUrl = await QRCodeLib.toDataURL(qrData, {
      width,
      margin,
      errorCorrectionLevel,
      type: "image/png" as const,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    });

    return {
      dataUrl: qrCodeDataUrl,
      rawData: qrData,
      format: getQRFormat(chain),
    };
  } catch (error) {
    console.error("Error generating compatible QR code:", error);
    throw new Error(`Failed to generate QR code for ${chain}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get the format description for a QR code
 */
export const getQRFormat = (chain: string): string => {
  const normalizedChain = chain.toLowerCase();

  const formatMap: Record<string, string> = {
    bitcoin: "BIP21 Bitcoin URI",
    btc: "BIP21 Bitcoin URI",
    ethereum: "EIP681 Ethereum URI",
    eth: "EIP681 Ethereum URI",
    solana: "Solana URI Scheme",
    sol: "Solana URI Scheme",
    starknet: "Ethereum-compatible URI",
    strk: "Ethereum-compatible URI",
    stellar: "Stellar URI Scheme",
    xlm: "Stellar URI Scheme",
    polkadot: "Polkadot URI Scheme",
    dot: "Polkadot URI Scheme",
    usdt_erc20: "ERC-20 Token URI",
    usdt_erc: "ERC-20 Token URI",
    usdt_trc20: "TRC-20 Token URI",
    usdt_trc: "TRC-20 Token URI",
    erc20: "ERC-20 Token URI",
    trc20: "TRC-20 Token URI",
  };

  return formatMap[normalizedChain] || "Plain Address";
};

/**
 * Get block explorer URL for a transaction
 */
export const getBlockExplorerUrl = (
  chain: string,
  txHash: string,
  network: string = "testnet"
): string => {
  const normalizedChain = chain.toLowerCase();
  const normalizedNetwork = network.toLowerCase();
  const trimmedTxHash = txHash.trim();

  const explorerUrls: Record<string, ExplorerUrls> = {
    ethereum: {
      testnet: `https://sepolia.etherscan.io/tx/${trimmedTxHash}`,
      mainnet: `https://etherscan.io/tx/${trimmedTxHash}`,
    },
    usdt_erc20: {
      testnet: `https://sepolia.etherscan.io/tx/${trimmedTxHash}`,
      mainnet: `https://etherscan.io/tx/${trimmedTxHash}`,
    },
    bitcoin: {
      testnet: `https://blockstream.info/testnet/tx/${trimmedTxHash}`,
      mainnet: `https://blockstream.info/tx/${trimmedTxHash}`,
    },
    solana: {
      testnet: `https://explorer.solana.com/tx/${trimmedTxHash}?cluster=devnet`,
      mainnet: `https://explorer.solana.com/tx/${trimmedTxHash}`,
    },
    starknet: {
      testnet: `https://sepolia.voyager.online/tx/${trimmedTxHash}`,
      mainnet: `https://voyager.online/tx/${trimmedTxHash}`,
    },
    stellar: {
      testnet: `https://testnet.steexp.com/tx/${trimmedTxHash}`,
      mainnet: `https://steexp.com/tx/${trimmedTxHash}`,
    },
    polkadot: {
      testnet: `https://polkadot.subscan.io/extrinsic/${trimmedTxHash}?network=westend`,
      mainnet: `https://polkadot.subscan.io/extrinsic/${trimmedTxHash}`,
    },
    usdt_trc20: {
      testnet: `https://shasta.tronscan.org/#/transaction/${trimmedTxHash}`,
      mainnet: `https://tronscan.org/#/transaction/${trimmedTxHash}`,
    },
  };

  const explorer = explorerUrls[normalizedChain];
  
  if (!explorer) {
    console.warn(`No explorer URL configured for chain: ${chain}`);
    return "#";
  }

  const url = normalizedNetwork === "testnet" 
    ? explorer.testnet 
    : explorer.mainnet;

  return url || "#";
};

/**
 * Generate a simple QR code for any text/URL
 */
export const generateSimpleQRCode = async (
  text: string,
  options: Omit<QRCodeOptions, 'amount' | 'label'> = {}
): Promise<string> => {
  const {
    width = 200,
    margin = 2,
    darkColor = "#000000",
    lightColor = "#FFFFFF",
    errorCorrectionLevel = "M",
  } = options;

  try {
    return await QRCodeLib.toDataURL(text, {
      width,
      margin,
      errorCorrectionLevel,
      type: "image/png" as const,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    });
  } catch (error) {
    console.error("Error generating simple QR code:", error);
    throw error;
  }
};

/**
 * Validate if a chain supports QR URI schemes with amount
 */
export const supportsAmountInQR = (chain: string): boolean => {
  const supportedChains = [
    "bitcoin", "btc",
    "ethereum", "eth",
    "solana", "sol",
    "starknet", "strk",
    "stellar", "xlm",
    "polkadot", "dot",
    "usdt_erc20", "usdt_erc",
    "usdt_trc20", "usdt_trc",
    "erc20", "trc20",
  ];
  
  return supportedChains.includes(chain.toLowerCase());
};

/**
 * Get appropriate currency symbol for amount display
 */
export const getCurrencySymbol = (chain: string): string => {
  const symbolMap: Record<string, string> = {
    bitcoin: "BTC",
    btc: "BTC",
    ethereum: "ETH",
    eth: "ETH",
    solana: "SOL",
    sol: "SOL",
    starknet: "STRK",
    strk: "STRK",
    stellar: "XLM",
    xlm: "XLM",
    polkadot: "DOT",
    dot: "DOT",
    usdt_erc20: "USDT",
    usdt_erc: "USDT",
    usdt_trc20: "USDT",
    usdt_trc: "USDT",
  };

  return symbolMap[chain.toLowerCase()] || chain.toUpperCase();
};