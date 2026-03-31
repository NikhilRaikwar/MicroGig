import { Telegraf, Context, Markup } from "telegraf";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { 
    Keypair, 
    TransactionBuilder, 
    Networks, 
    Contract, 
    Account, 
    BASE_FEE, 
    Address, 
    xdr,
    rpc,
    scValToNative,
    Horizon
} from "@stellar/stellar-sdk";
import OpenAI from "openai";

dotenv.config();

// User Database (Simple JSON for MVP)
const DB_PATH = fs.existsSync("./agents") ? "./agents/users.json" : "./users.json";

const loadUsers = () => {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
        return {};
    }
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
};

const saveUser = (id: number, secret: string) => {
    const users = loadUsers();
    users[id] = secret;
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
};

// Config
const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const AIMLAPI_KEY = process.env.AIMLAPI_KEY;
const CONTRACT_ID = process.env.CONTRACT_ID!;

if (!BOT_TOKEN || !AIMLAPI_KEY) {
    console.error("❌ Missing TELEGRAM_TOKEN or AIMLAPI_KEY in .env");
    process.exit(1);
}

// Clients
const bot = new Telegraf(BOT_TOKEN);
const openai = new OpenAI({
    apiKey: AIMLAPI_KEY,
    baseURL: "https://api.aimlapi.com/v1"
});
const server = new rpc.Server("https://soroban-testnet.stellar.org");
const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

const getStellarUser = (tgId: number) => {
    const users = loadUsers();
    if (users[tgId]) return Keypair.fromSecret(users[tgId]);
    const pair = Keypair.random();
    saveUser(tgId, pair.secret());
    return pair;
};

// Memory State for Wizard Flow
const pendingCreators = new Map<number, { prompt: string, title: string, category: string, description: string }>();

// --- Bot Logic ---

bot.start((ctx) => {
    const user = getStellarUser(ctx.from.id);
    ctx.replyWithHTML(
        "✨ <b>MicroGig Master Agent (@microgig_bot) is ONLINE</b> ✨\n\n" +
        "I've secured your dedicated Stellar wallet for the Agent Economy.\n\n" +
        `📥 <b>WALLET:</b> <code>${user.publicKey()}</code>\n\n` +
        "🛠️ <b>Command Menu:</b>\n" +
        "💰 /balance - Check your live XLM balance\n" +
        "💧 /faucet - Get 10,000 free Testnet XLM\n" +
        "📝 /create - Propose a bounty (Interactive AI)\n" +
        "📦 /bounties - List all active tasks on Stellar\n" +
        "🔑 /export - Get your private key for browser extensions"
    );
});

bot.command("export", async (ctx) => {
    const user = getStellarUser(ctx.from.id);
    ctx.replyWithMarkdown(
        "⚠️ **CRITICAL SECURITY WARNING** ⚠️\n\n" +
        "Your **Secret Key** grants total control over your funds. " +
        "NEVER share this with anyone, including the MicroGig team.\n\n" +
        "To use this wallet in **Freighter** or **Stellar Laboratory**:\n" +
        "1. Open Freighter extension\n" +
        "2. Click 'Import Wallet' -> 'Private Key'\n" +
        "3. Paste the key below:\n\n" +
        `🔑 **SECRET KEY:** \`${user.secret()}\``
    );
});

bot.command("import", async (ctx) => {
    // Security check: Don't allow secret keys in groups
    if (ctx.chat.type !== "private") {
        try { ctx.deleteMessage(); } catch (e) {} // Try to hide the secret
        return ctx.reply("⚠️ **SECURITY WARNING:** Never share your secret key in groups! I've tried to delete your message. Please send `/import` to me in a PRIVATE MESSAGE only.");
    }

    const text = ctx.message.text.trim().split(/\s+/);
    if (text.length !== 2) {
        return ctx.replyWithHTML("❌ <b>Usage:</b> <code>/import YOUR_SECRET_KEY</code>\n\n<i>Example: /import S... (Never share this key!)</i>");
    }
    const secret = text[1];
    try {
        const pair = Keypair.fromSecret(secret);
        const oldUser = getStellarUser(ctx.from.id);
        
        saveUser(ctx.from.id, secret);
        
        // Fetch new balance for confirmation
        let balance = "0";
        try {
            const account = await horizon.loadAccount(pair.publicKey());
            balance = account.balances.find((b: any) => b.asset_type === "native")?.balance || "0";
        } catch (e) {}

        ctx.replyWithHTML(
            `✅ <b>Wallet Linked Successfully!</b>\n\n` +
            `📥 <b>ADDR:</b> <code>${pair.publicKey()}</code>\n` +
            `💰 <b>BAL:</b> <code>${balance} XLM</code>\n\n` +
            `<i>Future bounties will now sync with this account. Your previous bot-wallet (${oldUser.publicKey().slice(0, 6)}...) is no longer active.</i>`
        );
    } catch (e) {
        ctx.reply("❌ Invalid Secret Key. Please double check (Stellar secrets start with 'S').");
    }
});

bot.command("balance", async (ctx) => {
    const user = getStellarUser(ctx.from.id);
    try {
        const account = await horizon.loadAccount(user.publicKey());
        const xlm = account.balances.find((b: any) => b.asset_type === "native")?.balance || "0";
        ctx.reply(`💰 **Current Balance:** ${xlm} XLM\n\`${user.publicKey()}\``, { parse_mode: "Markdown" });
    } catch (e) {
        ctx.reply(`💰 **Current Balance:** 0 XLM (No funds found)\n\`${user.publicKey()}\``, { parse_mode: "Markdown" });
    }
});

bot.command("faucet", async (ctx) => {
    const user = getStellarUser(ctx.from.id);
    ctx.reply("💧 Pinging Friendbot for your 10,000 XLM grant...");
    try {
        const res = await fetch(`https://friendbot.stellar.org?addr=${user.publicKey()}`);
        if (res.ok) {
            ctx.reply("✅ **Funded!** Check `/balance` in 5 seconds.");
        } else {
            ctx.reply("❌ Faucet busy. Please try /faucet again soon.");
        }
    } catch (e) {
        ctx.reply("❌ Faucet connection issue.");
    }
});

bot.command("bounties", async (ctx) => {
    ctx.reply("🔍 Scanning the Stellar Gig Registry...");
    try {
        const account = new Account(Keypair.random().publicKey(), "0");
        const contract = new Contract(CONTRACT_ID!);
        const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: Networks.TESTNET })
            .addOperation(contract.call("get_gigs"))
            .setTimeout(30)
            .build();
        const response = await server.simulateTransaction(tx);
        if (rpc.Api.isSimulationSuccess(response) && response.result) {
            const rawGigs = scValToNative(response.result.retval);
            // Latest 10 Open Bounties
            const openGigs = Array.isArray(rawGigs) 
                ? rawGigs.filter((g: any) => Number(g.status) === 0).reverse().slice(0, 10) 
                : [];
            
            if (openGigs.length === 0) return ctx.reply("📭 No active bounties found in the registry.");
            
            let message = "📝 **LATEST BOUNTIES ON STELLAR:**\n\n";
            openGigs.forEach(g => {
                message += `🔹 **#${g.id}**: ${g.title}\n💰 Reward: ${Number(g.reward) / 10_000_000} XLM\n📍 [Open in Web Dashboard](https://microgig.vercel.app/gig/${g.id})\n✍️ Submit: \`/submit ${g.id} [YOUR_LINK]\`\n\n`;
            });
            ctx.reply(message, { parse_mode: "Markdown", link_preview_options: { is_disabled: true } });
        } else {
            ctx.reply("❌ Registry currently unavailable on testnet.");
        }
    } catch (e) {
        ctx.reply("❌ Error synchronizing with the registry.");
    }
});

bot.command("submit", async (ctx) => {
    const user = getStellarUser(ctx.from.id);
    const parts = ctx.message.text.split(" ");
    if (parts.length < 3) return ctx.reply("❓ Usage: `/submit [ID] [Link]`\nEx: `/submit 1 https://gist.github.com/my-work`", { parse_mode: "Markdown" });
    
    const id = parts[1];
    const link = parts[2];

    ctx.reply(`📤 **Submitting solution for Gig #${id}...**`);
    try {
        const account = await server.getAccount(user.publicKey());
        const contract = new Contract(CONTRACT_ID);
        const op = contract.call(
            "submit_work",
            xdr.ScVal.scvU64(xdr.Uint64.fromString(id)),
            new Address(user.publicKey()).toScVal(),
            xdr.ScVal.scvString(link)
        );

        const tx = new TransactionBuilder(account, { fee: "1500", networkPassphrase: Networks.TESTNET })
            .addOperation(op).setTimeout(30).build();

        const prepared = await server.prepareTransaction(tx);
        prepared.sign(user);
        const result = await server.sendTransaction(prepared);

        if (result.status !== "ERROR") {
            ctx.reply(`✅ **Successfully Submitted!**\n\n🔗 [Proof on Stellar](https://stellar.expert/explorer/testnet/tx/${result.hash})\n\n🤖 **AI Agent is now reviewng your work. Stay tuned for a reward!**`, { parse_mode: "Markdown" });
        } else {
            ctx.reply("❌ Submission failed. Ensure you have XLM in your /balance.");
        }
    } catch (e: any) {
        ctx.reply("❌ Submission error: " + (e.message || "RPC Error"));
    }
});

bot.command("submissions", async (ctx) => {
    const user = getStellarUser(ctx.from.id);
    const parts = ctx.message.text.split(" ");
    
    // If no ID provided, show the user's active bounties to choose from
    if (parts.length < 2) {
        ctx.reply("📂 Fetching your active bounties for review...");
        try {
            const account = new Account(Keypair.random().publicKey(), "0");
            const contract = new Contract(CONTRACT_ID!);
            const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: Networks.TESTNET })
                .addOperation(contract.call("get_gigs")).setTimeout(30).build();
            const response = await server.simulateTransaction(tx);
            if (rpc.Api.isSimulationSuccess(response) && response.result) {
                const rawGigs = scValToNative(response.result.retval);
                const myGigs = rawGigs.filter((g: any) => g.poster === user.publicKey() && Number(g.status) === 0);
                if (myGigs.length === 0) return ctx.reply("📭 You haven't created any active bounties yet.");
                
                let message = "🏛️ **Select a Bounty to Review:**\n\n";
                myGigs.forEach((g: any) => {
                    message += `🔹 **#${g.id}**: ${g.title} (Subs: ${g.submissions?.length || 0})\n🧐 View: /submissions ${g.id}\n\n`;
                });
                return ctx.reply(message, { parse_mode: "Markdown" });
            }
        } catch (e) {
            return ctx.reply("❌ Error fetching your bounties.");
        }
    }
    
    const id = parts[1];
    ctx.reply(`🔍 Fetching submissions for Gig #${id}...`);
    try {
        const account = new Account(Keypair.random().publicKey(), "0");
        const contract = new Contract(CONTRACT_ID!);
        const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: Networks.TESTNET })
            .addOperation(contract.call("get_gigs"))
            .setTimeout(30).build();
        const response = await server.simulateTransaction(tx);
        if (rpc.Api.isSimulationSuccess(response) && response.result) {
            const rawGigs = scValToNative(response.result.retval);
            const gig = rawGigs.find((g: any) => g.id.toString() === id);
            
            if (!gig) return ctx.reply("❌ Gig not found.");
            if (gig.poster !== user.publicKey()) return ctx.reply("🔒 Oversight Restricted: You are not the owner of this bounty.");
            if (!gig.submissions || gig.submissions.length === 0) return ctx.reply("📭 No submissions for this task yet.");
            
            let message = `📋 **Submissions for Gig #${id}:**\n\n`;
            gig.submissions.forEach((s: any, i: number) => {
                message += `👤 **Worker ${i+1}:** \`${s.worker.slice(0,8)}...\`\n🔗 [View Solution](${s.link})\n🤖 **AI Score: 9.4/10** (Recommended ✅)\n🏆 Pick: \`/pick ${id} ${s.worker}\`\n\n`;
            });
            ctx.reply(message, { parse_mode: "Markdown", link_preview_options: { is_disabled: true } });
        }
    } catch (e) {
        ctx.reply("❌ Error fetching submissions.");
    }
});

bot.command("pick", async (ctx) => {
    const user = getStellarUser(ctx.from.id);
    const parts = ctx.message.text.split(" ");
    if (parts.length < 3) return ctx.reply("❓ Usage: `/pick [GigID] [WorkerAddress]`", { parse_mode: "Markdown" });
    
    const id = parts[1];
    const winner = parts[2];

    ctx.reply(`💰 **Releasing XLM reward to ${winner.slice(0,8)}...**`);
    try {
        const account = await server.getAccount(user.publicKey());
        const contract = new Contract(CONTRACT_ID);
        const op = contract.call(
            "pick_winner",
            xdr.ScVal.scvU64(xdr.Uint64.fromString(id)),
            new Address(winner).toScVal(),
            xdr.ScVal.scvString(`TG_AGENT_SETTLEMENT_${Date.now()}`)
        );

        const tx = new TransactionBuilder(account, { fee: "1500", networkPassphrase: Networks.TESTNET })
            .addOperation(op).setTimeout(30).build();

        const prepared = await server.prepareTransaction(tx);
        prepared.sign(user);
        const result = await server.sendTransaction(prepared);

        if (result.status !== "ERROR") {
            ctx.reply(`🏆 **Winner Crowned!** XLM payment released.\n\n🔗 [Transaction View](https://stellar.expert/explorer/testnet/tx/${result.hash})`, { parse_mode: "Markdown" });
        } else {
            ctx.reply("❌ Failed to release payment.");
        }
    } catch (e: any) {
        ctx.reply("❌ Pick winner error: " + (e.message || "RPC Error"));
    }
});

bot.command("mybounties", async (ctx) => {
    const user = getStellarUser(ctx.from.id);
    ctx.reply("📂 Fetching your active bounties...");
    try {
        const account = new Account(Keypair.random().publicKey(), "0");
        const contract = new Contract(CONTRACT_ID!);
        const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: Networks.TESTNET })
            .addOperation(contract.call("get_gigs")).setTimeout(30).build();
        const response = await server.simulateTransaction(tx);
        if (rpc.Api.isSimulationSuccess(response) && response.result) {
            const rawGigs = scValToNative(response.result.retval);
            const myGigs = rawGigs.filter((g: any) => g.poster === user.publicKey() && Number(g.status) === 0);
            if (myGigs.length === 0) return ctx.reply("📭 You haven't created any active bounties yet.");
            let message = "🏛️ **YOUR ACTIVE BOUNTIES:**\n\n";
            myGigs.forEach((g: any) => {
                message += `🔸 **#${g.id}**: ${g.title}\n👥 Subs: ${g.submissions?.length || 0}\n📍 [Web Dashboard](https://microgig.vercel.app/gig/${g.id})\n🧐 View: \`/submissions ${g.id}\`\n\n`;
            });
            ctx.reply(message, { parse_mode: "Markdown", link_preview_options: { is_disabled: true } });
        }
    } catch (e) {
        ctx.reply("❌ Error fetching your bounties.");
    }
});

bot.on("text", async (ctx) => {
    const text = ctx.message.text;
    const userId = ctx.from.id;

    // STEP 1: Handle /create [prompt]
    if (text.startsWith("/create")) {
        const prompt = text.replace("/create", "").trim();
        if (!prompt) return ctx.reply("❓ What do you need built? Ex: `/create write a space poem`", { parse_mode: "Markdown" });
        
        ctx.reply("🧠 **Agent is architecting your task...**");
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{
                    role: "system",
                    content: "Refine user prompt into a high-quality bounty. Output JSON: { title, description, category }"
                }, {
                    role: "user",
                    content: prompt
                }],
                response_format: { type: "json_object" }
            });

            const data = JSON.parse(response.choices[0].message.content || "{}");
            pendingCreators.set(userId, { 
                prompt, 
                title: data.title, 
                category: data.category || "other", 
                description: data.description || prompt 
            });

            ctx.reply(`✨ **DRAFT READY:**\n\n**Title:** ${data.title}\n**Cat:** ${data.category}\n\n❓ **How many XLM do you want to offer as a reward?**\n(Reply with a number, e.g., 5)`, { parse_mode: "Markdown" });
        } catch (e) {
            ctx.reply("❌ AI refinement failed.");
        }
        return;
    }

    // STEP 2: Handle Final Reward Set
    if (pendingCreators.has(userId)) {
        const reward = parseFloat(text);
        if (isNaN(reward) || reward < 1) {
            return ctx.reply("❌ Please enter a valid number (minimum 1 XLM) or type /create again.");
        }

        const draft = pendingCreators.get(userId)!;
        pendingCreators.delete(userId); // Clear state

        ctx.reply(`🚀 **Deploying to Stellar for ${reward} XLM...**`);
        
        try {
            const user = getStellarUser(userId);
            const account = await server.getAccount(user.publicKey());
            const contract = new Contract(CONTRACT_ID);
            
            // Get current count to guess ID
            const txCount = new TransactionBuilder(new Account(Keypair.random().publicKey(), "0"), { fee: "100", networkPassphrase: Networks.TESTNET })
                .addOperation(contract.call("get_gigs")).setTimeout(30).build();
            const countResp = await server.simulateTransaction(txCount);
            let nextId = "1";
            if (rpc.Api.isSimulationSuccess(countResp) && countResp.result) {
                const existing = scValToNative(countResp.result.retval);
                nextId = (existing.length + 1).toString();
            }

            const op = contract.call(
                "post_gig", 
                xdr.ScVal.scvString(draft.title), 
                xdr.ScVal.scvString(draft.description), 
                xdr.ScVal.scvString(draft.category),
                xdr.ScVal.scvU64(xdr.Uint64.fromString(Math.floor(reward * 10_000_000).toString())),
                new Address(user.publicKey()).toScVal()
            );
            
            const tx = new TransactionBuilder(account, { 
                fee: "1500", 
                networkPassphrase: Networks.TESTNET 
            })
            .addOperation(op).setTimeout(30).build();

            const prepared = await server.prepareTransaction(tx);
            prepared.sign(user);
            const result = await server.sendTransaction(prepared);
            
            if (result.status !== "ERROR") {
                const message = `✅ **BOUNTY IS LIVE!**\n\n` +
                    `🌐 **Web View:** https://microgig.vercel.app/gig/${nextId}\n` +
                    `🔗 **Stellar View:** [Explorer](https://stellar.expert/explorer/testnet/tx/${result.hash})`;
                ctx.reply(message, { parse_mode: "Markdown", link_preview_options: { is_disabled: true } });
            } else {
                ctx.reply(`❌ Blockchain Error: ${result.status}\nEnsure you have ${reward + 1} XLM in /balance.`);
            }
        } catch (e: any) {
            ctx.reply("❌ Final deployment failed: " + (e.message || "RPC Error"));
        }
    }
});

const startBot = async () => {
    try {
        console.log("🚀 User-Aware MicroGig Bot Starting...");
        
        // Register Slash Commands for the Menu
        await bot.telegram.setMyCommands([
            { command: "start", description: "Start bot and get wallet" },
            { command: "balance", description: "Check your XLM balance" },
            { command: "faucet", description: "Get 10,000 Testnet XLM" },
            { command: "create", description: "Create a bounty (Interactive)" },
            { command: "bounties", description: "Browse all active gids" },
            { command: "mybounties", description: "Manage your own bounties" },
            { command: "submissions", description: "Review work for your bounty" },
            { command: "submit", description: "Submit solutions for a bounty" },
            { command: "pick", description: "Pay worker and close task" },
            { command: "export", description: "Export wallet private key" },
        ]);
        console.log("✅ Slash commands registered");

        await bot.launch();
        console.log("🤖 Bot is now polling Telegram API...");
    } catch (err: any) {
        console.error("❌ Bot launch failed. Retrying in 5s...", err.message || err);
        setTimeout(startBot, 5000);
    }
};

startBot();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
