import { toast } from "sonner";
import { kit } from "./stellar-wallets-kit";
import { Horizon, TransactionBuilder, Networks, Operation, Asset } from "@stellar/stellar-sdk";

// Constants
const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

// Types
export interface StellarWallet {
  publicKey: string;
  isConnected: boolean;
}

// Check if wallet is installed
export const isWalletInstalled = async (): Promise<boolean> => {
  return true;
};

// Connect wallet via Kit
export const connectWallet = async (): Promise<string | null> => {
  try {
    await kit.openModal({
      modalTitle: "Connect to MicroGig",
      onWalletSelected: async (option) => {
        kit.setWallet(option.id);
      }
    });

    // @ts-ignore
    const { address } = await kit.getAddress();

    if (address) {
      localStorage.setItem("microgig_wallet_addr", address); // Persist address
      toast.success("Wallet connected!", {
        description: `${address.slice(0, 6)}...${address.slice(-4)}`,
      });
      return address;
    }
    return null;
  } catch (error) {
    console.error("Connection error:", error);
    toast.error("Failed to connect wallet");
    return null;
  }
};

// Auto-connect helper (Silent)
export const getPersistedAddress = (): string | null => {
  return localStorage.getItem("microgig_wallet_addr");
};

// Fetch XLM Balance
export const fetchBalance = async (publicKey: string): Promise<string> => {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (b: any) => b.asset_type === "native"
    );
    return nativeBalance ? parseFloat(nativeBalance.balance).toFixed(7) : "0";
  } catch (error) {
    console.error("Balance fetch error:", error);
    return "0";
  }
};

// Sign Transaction (Wrapper for Kit)
export const signTransaction = async (xdr: string): Promise<string> => {
  try {
    // @ts-ignore
    const result: any = await kit.signTransaction(xdr);
    console.log("Sign result raw:", result);

    // Attempt to extract XDR string
    if (typeof result === 'string') return result;

    if (result.signedTxXdr) return result.signedTxXdr; // <-- Added this
    if (result.signedXDR) return result.signedXDR;
    if (result.signedTx) return result.signedTx;
    if (result.xdr) return result.xdr;
    if (result.transaction) return result.transaction; // Some wallets return this

    // If we can't find it, throw error to avoid cryptic sdk errors
    throw new Error(`Could not find signed XDR in wallet response: ${JSON.stringify(result)}`);

  } catch (error) {
    console.error("Signing error:", error);
    throw error;
  }
};

// Disconnect Wallet
export const disconnectWallet = async () => {
  localStorage.removeItem("microgig_wallet_addr");
  // @ts-ignore
  if (kit.disconnect) {
    // @ts-ignore
    await kit.disconnect();
  } else {
    // Fallback if disconnect method varies
    // @ts-ignore
    kit.setWallet(null);
  }
};

// Fund with Friendbot
export const fundWithFriendbot = async (publicKey: string) => {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${publicKey}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    // Friendbot returns 400 if account exists, which is fine
    console.warn("Friendbot info:", error);
    return { status: "already_funded" };
  }
};

// Truncate Address
export const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Send Payment
export const sendPayment = async (
  to: string,
  amount: string
) => {
  try {
    // @ts-ignore
    const { address: from } = await kit.getAddress();
    if (!from) throw new Error("Wallet not connected");

    const account = await server.loadAccount(from);

    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: to,
          asset: Asset.native(),
          amount: amount,
        })
      )
      .setTimeout(30)
      .build();

    const signedXDR = await signTransaction(tx.toXDR());

    // @ts-ignore
    const result = await server.submitTransaction(TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET));

    return { success: true, hash: result.hash };
  } catch (error) {
    console.error("Payment Error:", error);
    return { success: false, error };
  }
};
