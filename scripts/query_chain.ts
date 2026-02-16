import {
    Contract,
    TransactionBuilder,
    rpc,
    xdr,
    Networks,
    Address,
    Account,
    scValToNative,
    Keypair
} from "@stellar/stellar-sdk";

const CONTRACT_ID = "CDOEGHKX6AQJOJERF2CTFKEA7DUXQNYWEHSYP5RVKCBX2Z62HEZ4HRMP";
const SERVER_URL = "https://soroban-testnet.stellar.org";
const server = new rpc.Server(SERVER_URL);

const checkGigs = async () => {
    console.log("Connecting to Soroban Testnet...");
    const contract = new Contract(CONTRACT_ID);

    // Use a random keypair just for simulation source
    const key = Keypair.random();
    const simAccount = key.publicKey();

    // We create a "virtual" account object for builder
    const account = new Account(simAccount, "0");

    const tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(contract.call("get_gigs"))
        .setTimeout(30)
        .build();

    console.log("Simulating transaction...");
    const response = await server.simulateTransaction(tx);

    if (rpc.Api.isSimulationSuccess(response)) {
        console.log("✅ Simulation Successful!");

        const retval = response.result.retval;
        // scValToNative is a handy helper in newer SDKs!
        // It converts ScVal to JS types (Strings, Numbers, Objects).
        const rawValues = scValToNative(retval);

        console.log("\n--- 📋 Gigs on Chain ---");
        console.log(JSON.stringify(rawValues, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
            , 2));
        console.log("------------------------\n");

    } else {
        console.error("Simulation Failed:", response);
    }
};

checkGigs();
