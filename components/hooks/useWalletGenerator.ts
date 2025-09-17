import { useNetwork } from '@/components/context/NetworkContext';
import { generateWalletsFromMnemonic as generateRawWalletsFromMnemonic, encryptWalletData, EncryptedWalletData, GeneratedWallets } from '@/components/lib/utils/walletGenerator';

export function useWalletGenerator() {
  const { network } = useNetwork();

  const generateWalletsFromMnemonic = async (mnemonic: string, password: string): Promise<EncryptedWalletData> => {
    // Generate wallets using the network context
    const wallets: GeneratedWallets = await generateRawWalletsFromMnemonic(mnemonic, network);
    // Encrypt the wallets and return EncryptedWalletData
    return encryptWalletData(mnemonic, wallets, password);
  };

  return { generateWalletsFromMnemonic };
}