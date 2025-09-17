import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import BIP32Factory from 'bip32';
import CryptoJS from 'crypto-js';

// Initialize BIP32 with elliptic curve
const bip32 = BIP32Factory(ecc);

export interface GeneratedWallets {
  ethereum: {
    address: string;
    privateKey: string;
  };
  bitcoin: {
    legacy_address: string;
    segwit_address: string;
    privateKey: string;
  };
  solana: {
    address: string;
    privateKey: string;
  };
  starknet: {
    address: string;
    privateKey: string;
  };
}

export interface EncryptedWalletData {
  encryptedMnemonic: string;
  encryptedWallets: {
    ethereum: string;
    bitcoin: string;
    solana: string;
    starknet: string;
  };
  publicAddresses: {
    ethereum: string;
    bitcoin: string;
    solana: string;
    starknet: string;
  };
}

/**
 * Generate wallets from a mnemonic based on network configuration
 */
export const generateWalletsFromMnemonic = async (mnemonic: string, network: 'testnet' | 'mainnet'): Promise<GeneratedWallets> => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  
  // Ethereum wallet (unchanged)
  const ethNode = ethers.HDNodeWallet.fromSeed(seed);
  const ethWallet = ethNode.derivePath("m/44'/60'/0'/0/0");

  // Bitcoin wallet
  const btcNetwork = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
  const btcCoinType = network === 'testnet' ? "1'" : "0'";
  const btcRoot = bip32.fromSeed(seed, btcNetwork);
  
  const btcLegacy = btcRoot.derivePath(`m/44'/${btcCoinType}/0'/0/0`);
  const btcLegacyAddress = bitcoin.payments.p2pkh({
    pubkey: Buffer.from(btcLegacy.publicKey),
    network: btcNetwork,
  }).address || '';

  const btcSegwit = btcRoot.derivePath(`m/84'/${btcCoinType}/0'/0/0`);
  const btcSegwitAddress = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(btcSegwit.publicKey),
    network: btcNetwork,
  }).address || '';

  // Solana wallet (unchanged)
  const solPath = "m/44'/501'/0'/0'";
  const solKey = ed25519.derivePath(solPath, seed.toString("hex")).key;
  const solWallet = Keypair.fromSeed(solKey);

  // Starknet wallet (unchanged)
  const starkPrivKey = ethWallet.privateKey.slice(2);
  const starkAddress = ethWallet.address;

  return {
    ethereum: { address: ethWallet.address, privateKey: ethWallet.privateKey },
    bitcoin: {
      legacy_address: btcLegacyAddress,
      segwit_address: btcSegwitAddress,
      privateKey: btcLegacy.toWIF(),
    },
    solana: { address: solWallet.publicKey.toBase58(), privateKey: Buffer.from(solWallet.secretKey).toString('hex') },
    starknet: { address: starkAddress, privateKey: starkPrivKey },
  };
};

/**
 * Generate a new mnemonic and wallets
 */
export const generateNewWallets = async (network: 'testnet' | 'mainnet'): Promise<{ mnemonic: string; wallets: GeneratedWallets }> => {
  const mnemonic = bip39.generateMnemonic();
  const wallets = await generateWalletsFromMnemonic(mnemonic, network);
  return { mnemonic, wallets };
};

/**
 * Encrypt wallet data with user's password
 */
export const encryptWalletData = (
  mnemonic: string, 
  wallets: GeneratedWallets, 
  password: string
): EncryptedWalletData => {
  // Derive a key from the password
  const salt = CryptoJS.lib.WordArray.random(128/8);
  const key = CryptoJS.PBKDF2(password, salt, { 
    keySize: 256/32, 
    iterations: 1000 
  });
  
  // Encrypt the mnemonic
  const encryptedMnemonic = CryptoJS.AES.encrypt(mnemonic, key, { 
    iv: salt 
  }).toString();
  
  // Encrypt each private key
  const encryptedWallets = {
    ethereum: CryptoJS.AES.encrypt(wallets.ethereum.privateKey, key, { iv: salt }).toString(),
    bitcoin: CryptoJS.AES.encrypt(wallets.bitcoin.privateKey, key, { iv: salt }).toString(),
    solana: CryptoJS.AES.encrypt(wallets.solana.privateKey, key, { iv: salt }).toString(),
    starknet: CryptoJS.AES.encrypt(wallets.starknet.privateKey, key, { iv: salt }).toString(),
  };
  
  return {
    encryptedMnemonic: salt.toString() + ':' + encryptedMnemonic,
    encryptedWallets,
    publicAddresses: {
      ethereum: wallets.ethereum.address,
      bitcoin: wallets.bitcoin.segwit_address, // Using segwit as primary
      solana: wallets.solana.address,
      starknet: wallets.starknet.address,
    }
  };
};

/**
 * Decrypt wallet data with user's password
 */
export const decryptWalletData = (
  encryptedData: EncryptedWalletData, 
  password: string
): { mnemonic: string; wallets: GeneratedWallets } => {
  const [saltHex, encryptedMnemonic] = encryptedData.encryptedMnemonic.split(':');
  const salt = CryptoJS.enc.Hex.parse(saltHex);
  
  // Derive the key
  const key = CryptoJS.PBKDF2(password, salt, { 
    keySize: 256/32, 
    iterations: 1000 
  });
  
  // Decrypt the mnemonic
  const mnemonic = CryptoJS.AES.decrypt(encryptedMnemonic, key, { iv: salt })
    .toString(CryptoJS.enc.Utf8);
  
  // Decrypt each private key
  const ethereumPK = CryptoJS.AES.decrypt(encryptedData.encryptedWallets.ethereum, key, { iv: salt })
    .toString(CryptoJS.enc.Utf8);
  const bitcoinPK = CryptoJS.AES.decrypt(encryptedData.encryptedWallets.bitcoin, key, { iv: salt })
    .toString(CryptoJS.enc.Utf8);
  const solanaPK = CryptoJS.AES.decrypt(encryptedData.encryptedWallets.solana, key, { iv: salt })
    .toString(CryptoJS.enc.Utf8);
  const starknetPK = CryptoJS.AES.decrypt(encryptedData.encryptedWallets.starknet, key, { iv: salt })
    .toString(CryptoJS.enc.Utf8);
  
  return {
    mnemonic,
    wallets: {
      ethereum: {
        address: encryptedData.publicAddresses.ethereum,
        privateKey: ethereumPK,
      },
      bitcoin: {
        legacy_address: '', // Would need to be reconstructed
        segwit_address: encryptedData.publicAddresses.bitcoin,
        privateKey: bitcoinPK,
      },
      solana: {
        address: encryptedData.publicAddresses.solana,
        privateKey: solanaPK,
      },
      starknet: {
        address: encryptedData.publicAddresses.starknet,
        privateKey: starknetPK,
      },
    }
  };
};