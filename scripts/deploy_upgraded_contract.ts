import * as StellarSdk from "@stellar/stellar-sdk";
const {
    Address,
    Account,
    Keypair,
    Networks,
    TransactionBuilder,
    Operation,
    rpc,
    StrKey,
    xdr,
    hash
} = StellarSdk;
import fs from "fs";
import path from "path";

// Stellar Config
const SERVER_URL = "https://soroban-testnet.stellar.org";
const server = new rpc.Server(SERVER_URL);
const BASE_FEE = "100";

// Helpers
const fundWithFriendbot = async (publicKey: string) => {
    try {
        const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
        const data = await response.json();
        return data;
    } catch (e) {
        console.warn("Friendbot:", e.message);
    }
};

const deploy = async () => {
    // 1. Setup Deployer Account
    console.log("Creating new Deployer Account...");
    const keypair = Keypair.random();
    console.log(`Public Key: ${keypair.publicKey()}`);
    console.log(`Secret Key: ${keypair.secret()}`);

    console.log("Funding via Friendbot...");
    await fundWithFriendbot(keypair.publicKey());

    // Wait for funding confirmation lightly
    await new Promise(r => setTimeout(r, 5000));
    const account = await server.getAccount(keypair.publicKey());
    console.log("Account funded!");

    // 2. Read WASM
    const wasmPath = path.resolve(process.cwd(), "../gig-contract/target/wasm32-unknown-unknown/release/hello_world.wasm");
    console.log(`Reading WASM from: ${wasmPath}`);
    const wasmBuffer = fs.readFileSync(wasmPath);

    // 3. Upload Contract Code (Install)
    console.log("Uploading WASM...");
    const uploadTx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeUploadContractWasm(
                new xdr.UploadContractWasmArgs({
                    code: wasmBuffer,
                })
            ),
            auth: [],
        }))
        .setTimeout(30)
        .build();

    uploadTx.sign(keypair);
    const uploadRes = await server.sendTransaction(uploadTx);

    if (uploadRes.status !== "PENDING") {
        console.error("Upload failed immediately:", uploadRes);
        // Sometimes it returns error if simulation failed?
        // But for sendTransaction, it returns hash or error.
        // Let's assume hash.
    }

    console.log(`Upload Tx Hash: ${uploadRes.hash}`);
    // Poll for status
    let wasmHash = "";
    while (true) {
        const status = await server.getTransaction(uploadRes.hash);
        if (status.status === "SUCCESS") {
            // Extract WASM Hash from result
            // resultMetaXdr -> return value
            // But checking return value of upload is tricky via RPC helper directly.
            // Actually, the WASM hash is usually just the sha256 of the buffer.
            console.log("Code Installed!");
            break;
        }
        if (status.status === "FAILED") {
            console.error("Upload Failed!", status);
            return;
        }
        await new Promise(r => setTimeout(r, 2000));
    }

    // WASM Hash is deterministic locally too
    // In node, we can calculate it:
    // const crypto = require('crypto');
    // const hash = crypto.createHash('sha256').update(wasmBuffer).digest('hex');
    // But let's assume it worked.
    // For creating contract, we usually need the wasmHash.
    // Let's create it from buffer.
    const wasmHashBuffer = hash(wasmBuffer);
    const wasmHashHex = wasmHashBuffer.toString('hex');
    console.log(`WASM Hash: ${wasmHashHex}`);

    // 4. Instantiate Contract (Create)
    console.log("Instantiating Contract...");
    // We need a fresh nonce/salt
    const salt = Buffer.alloc(32); // Use all zeros or random
    // Actually, createContract uses salt.

    const createTx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeCreateContract(
                new xdr.CreateContractArgs({
                    contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAddress(
                        new xdr.ContractIdPreimageFromAddress({
                            address: Address.fromString(keypair.publicKey()).toScAddress(),
                            salt: salt,
                        })
                    ),
                    executable: xdr.ContractExecutable.contractExecutableWasm(wasmHashBuffer),
                })
            ),
            auth: [],
        }))
        .setTimeout(30)
        .build();

    createTx.sign(keypair);
    const createRes = await server.sendTransaction(createTx);
    console.log(`Create Tx Hash: ${createRes.hash}`);

    // Poll for Contract ID
    while (true) {
        const status = await server.getTransaction(createRes.hash);
        if (status.status === "SUCCESS") {
            // How to get the ID?
            // The return value contains the new Contract Address.
            // We can calculate it deterministically too using StrKey.encodeContract(hash(preimage)).

            // But simpler: just get resultMeta XDR and parse? 
            // Or calculate deterministic ID:
            // The ID is SHA256(preimage)

            const preimage = xdr.ContractIdPreimage.contractIdPreimageFromAddress(
                new xdr.ContractIdPreimageFromAddress({
                    address: Address.fromString(keypair.publicKey()).toScAddress(),
                    salt: salt,
                })
            );
            const contractIdBuf = hash(preimage.toXDR());
            const contractId = StrKey.encodeContract(contractIdBuf);

            console.log("✅ Contract Deployed Successfully!");
            console.log(`CORE CONTRACT ID: ${contractId}`);

            // Helpful message
            console.log("\nPlease update src/lib/contract.ts with this ID!");
            break;
        }
        if (status.status === "FAILED") {
            console.error("Create Failed!", status);
            return;
        }
        await new Promise(r => setTimeout(r, 2000));
    }
};

deploy();
