import {
    Contract,
    TransactionBuilder,
    rpc,
    xdr,
    Networks,
    Address,
    Account,
    scValToNative,
    Keypair,
    Operation,
    Asset,
} from "@stellar/stellar-sdk";
import { signTransaction } from "./stellar";

// Upgraded Contract ID with Categorization Support (v2.0)
const CONTRACT_ID = "CA2MV2V7TK6SNHFWLEWQZ67ILO2AMQ3AC7DYE75KAOI3W7VYT3WLNSZE";
const SERVER_URL = "https://soroban-testnet.stellar.org";
const server = new rpc.Server(SERVER_URL);

const BASE_FEE = "100";

// Advanced Error Tracking for Production Readiness
export const parseSorobanError = (error: any): string => {
    const msg = error?.message || "";
    if (msg.includes("pending")) return "Transaction is still pending on-chain.";
    if (msg.includes("rejected")) return "Transaction was rejected by your wallet.";
    if (msg.includes("insufficient")) return "Insufficient XLM balance for transaction or fees.";
    if (msg.includes("HostError: Error(Contract, #")) return `Smart Contract Logic Error: ${msg.split('#')[1].trim()}`;
    return msg || "An unknown blockchain error occurred.";
};

// Helper wrappers
const strVal = (s: string) => xdr.ScVal.scvString(s);
const u64Val = (n: number) => xdr.ScVal.scvU64(xdr.Uint64.fromString(n.toString()));
const addrVal = (addr: string) => new Address(addr).toScVal();

// Helper to submit via JSON-RPC directly if SDK fails
const submitRawXdr = async (signedXDR: string) => {
    const body = JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sendTransaction",
        params: {
            transaction: signedXDR,
        },
    });

    const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "RPC Error");
    return data.result;
};

// Helper to get transaction status via JSON-RPC directly
const getRawTransaction = async (hash: string) => {
    const body = JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: {
            hash: hash,
        },
    });

    const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "RPC Error");
    return data.result;
};

export const postGigOnChain = async (
    title: string,
    description: string,
    category: string, // REQUIRED IN V2
    reward: number,
    poster: string
) => {
    try {
        const contract = new Contract(CONTRACT_ID!);
        const account = await server.getAccount(poster);

        const operation = contract.call(
            "post_gig",
            strVal(title),
            strVal(description),
            strVal(category), // PASSED TO V2
            u64Val(reward * 10_000_000), // Stroops
            addrVal(poster)
        );

        const txBuilder = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        });

        // Add operation and build
        const tx = txBuilder.addOperation(operation).setTimeout(30).build();

        // Prepare
        const prepared = await server.prepareTransaction(tx);

        // Rebuild from prepared XDR
        const preparedTx = TransactionBuilder.fromXDR(prepared.toXDR(), Networks.TESTNET);

        // Sign
        const signedXDR = await signTransaction(preparedTx.toXDR());

        // Submit
        console.log("Submitting Raw XDR via RPC...");
        const result = await submitRawXdr(signedXDR);

        if (result.status === "ERROR") {
            const errorDetail = result.errorResultXdr || JSON.stringify(result);
            throw new Error(`Transaction failed: ${errorDetail}`);
        }

        const hash = result.hash;
        if (!hash) throw new Error("No transaction hash returned");

        let attempts = 0;
        while (attempts < 20) {
            const txStatus = await getRawTransaction(hash);

            if (txStatus.status === "SUCCESS") {
                return txStatus;
            }
            if (txStatus.status === "FAILED") {
                console.error("Tx Failed:", txStatus);
                throw new Error("Transaction Failed on-chain");
            }
            await new Promise((r) => setTimeout(r, 2000));
            attempts++;
        }

        return result;

    } catch (error: any) {
        console.error("Contract Error:", error);
        throw error;
    }
};

// ... other functions (submitWorkOnChain, pickWinnerOnChain etc. same signature)

// Submit Work for a Gig
export const submitWorkOnChain = async (gigId: string, workerAddress: string, link: string) => {
    try {
        const contract = new Contract(CONTRACT_ID!);
        const account = await server.getAccount(workerAddress);

        const operation = contract.call(
            "submit_work",
            u64Val(Number(gigId)),
            addrVal(workerAddress),
            strVal(link)
        );

        const txBuilder = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        });

        const tx = txBuilder.addOperation(operation).setTimeout(30).build();
        const prepared = await server.prepareTransaction(tx);
        const preparedTx = TransactionBuilder.fromXDR(prepared.toXDR(), Networks.TESTNET);
        const signedXDR = await signTransaction(preparedTx.toXDR());

        console.log("Submitting Work...");
        const result = await submitRawXdr(signedXDR);

        if (result.status === "ERROR") throw new Error("Correction failed: " + JSON.stringify(result));

        // Wait for confirmation
        await new Promise(r => setTimeout(r, 4000));
        return result;
    } catch (e: any) {
        console.error("Submit Work Error:", e);
        throw e;
    }
};

// Pick Winner & Record Payment Hash
export const pickWinnerOnChain = async (gigId: string, winnerAddress: string, posterAddress: string, paymentHash: string) => {
    try {
        const contract = new Contract(CONTRACT_ID!);
        const account = await server.getAccount(posterAddress);

        const operation = contract.call(
            "pick_winner",
            u64Val(Number(gigId)),
            addrVal(winnerAddress),
            strVal(paymentHash)
        );

        const txBuilder = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        });

        const tx = txBuilder.addOperation(operation).setTimeout(30).build();
        const prepared = await server.prepareTransaction(tx);
        const preparedTx = TransactionBuilder.fromXDR(prepared.toXDR(), Networks.TESTNET);
        const signedXDR = await signTransaction(preparedTx.toXDR());

        console.log("Picking Winner (Contract)...");
        const result = await submitRawXdr(signedXDR);

        if (result.status === "ERROR") throw new Error("Reference failed");

        await new Promise(r => setTimeout(r, 4000));
        return result;
    } catch (e: any) {
        console.error("Pick Winner Error:", e);
        throw e;
    }
};

// Fetch Gigs from Chain (Read-Only Simulation with Caching)
export const getChainGigs = async (forceRefresh = false) => {
    const CACHE_KEY = "microgig_chain_gigs";
    const cache = sessionStorage.getItem(CACHE_KEY);

    if (cache && !forceRefresh) {
        console.log("Returning cached gigs from session storage");
        return JSON.parse(cache);
    }

    try {
        console.log("Fetching fresh gigs from chain...");
        const contract = new Contract(CONTRACT_ID!);
        const key = Keypair.random();
        const simAccount = key.publicKey();
        const account = new Account(simAccount, "0");

        const tx = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(contract.call("get_gigs"))
            .setTimeout(30)
            .build();

        const response = await server.simulateTransaction(tx);

        if (rpc.Api.isSimulationSuccess(response)) {
            const retval = response.result.retval;
            const rawGigs = scValToNative(retval);

            const mappedResults = rawGigs.map((g: any) => ({
                id: g.id.toString(),
                title: g.title.toString(),
                description: g.description.toString(),
                category: g.category?.toString() || "other", // EXTRACT FROM V2
                reward: Number(g.reward) / 10_000_000,
                posterAddress: g.poster,
                workerAddress: g.worker || undefined,
                status: g.status === 0 ? "open" : "completed",
                createdAt: new Date().toISOString(),
                submissions: g.submissions ? g.submissions.map((s: any) => ({
                    worker: s.worker,
                    link: s.link.toString()
                })) : [],
                transactionHash: g.payment_hash ? g.payment_hash.toString() : undefined
            }));

            sessionStorage.setItem(CACHE_KEY, JSON.stringify(mappedResults));
            return mappedResults;
        }

        return [];
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
};

// Fetch Recent Contract Events for Activity Feed
export const getContractEvents = async () => {
    try {
        const latestLedger = await server.getLatestLedger();
        const startLedger = latestLedger.sequence - 10000; 

        const response = await server.getEvents({
            startLedger: startLedger,
            filters: [
                {
                    type: "contract",
                    contractIds: [CONTRACT_ID],
                },
            ],
        });

        return response.events.map((e) => {
            const topics = e.topic.map((t) => scValToNative(t));
            return {
                id: e.id,
                ledger: e.ledger,
                ledgerClosedAt: e.ledgerClosedAt,
                topic: topics[0], 
                data: scValToNative(e.value),
            };
        });
    } catch (error) {
        console.error("Events Fetch Error:", error);
        return [];
    }
};
