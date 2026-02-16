import {
    StellarWalletsKit,
    WalletNetwork,
    allowAllModules,
    XBULL_ID,
    FREIGHTER_ID,
    ALBEDO_ID,
} from "@creit.tech/stellar-wallets-kit";

// Initialize the Wallet Kit
export const kit: StellarWalletsKit = new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    selectedWalletId: FREIGHTER_ID,
    modules: allowAllModules(),
});

// Helper to get public key
export const connectWallet = async (): Promise<string | null> => {
    try {
        await kit.openModal({
            modalTitle: "Connect to MicroGig",
            onWalletSelected: async (option) => {
                kit.setWallet(option.id);
            },
        });

        const address = await kit.getPublicKey();
        return address;
    } catch (error) {
        console.error("Wallet connection failed:", error);
        return null;
    }
};

// Contract Constants (Your Deployed Contract)
export const CONTRACT_ID = "CDOEGHKX6AQJOJERF2CTFKEA7DUXQNYWEHSYP5RVKCBX2Z62HEZ4HRMP";
