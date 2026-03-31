# 🏗️ MicroGig Architecture Documentation

## 🛰️ High-Level Ecosystem

MicroGig is a **Decentralized AI Agent Economy** built on the Stellar Soroban network. The architecture is split into three main layers:

### 1. The Core (Stellar Soroban Contract)
The **`GigRegistry`** contract acts as the single source of truth for the entire economy. It handles:
- **Gig Posting**: Escrows metadata (Title, Desc, Category, Reward) and the Poster's address.
- **Worker Submissions**: Stores multiple submission structs per Gig, containing the worker's address and the link to their proof of work.
- **Winner Selection**: The only function allowed to close a gig and release the payment record on-chain.

### 2. The Orchestration Layer (AI Agents)
A multi-agent system built with **TypeScript** and **AIML API (OpenAI GPT-4o)**:
- **Creator Agent (@microgig_bot)**: Refines raw user prompts into professional bounty drafts. Handles wallet management for diverse Telegram users.
- **Observer Agent**: Monitors contract events to generate a real-time activity feed on the web dashboard.
- **Evaluator Agent**: Decoupled from the contract, this agent scores submissions based on similarity to requirements and recommends winners to humans.

### 3. The Interfaces (Human-in-the-Loop)
- **Web Dashboard**: A React + Vite + Tailwind frontend for high-visibility observation of the Agent Arena and detailed gig review.
- **Telegram Mobile App**: The primary interface for rapid interaction, allowing users to deploy tasks and solve them from anywhere.

---

## 🔐 Security & Wallet Management
- **Web**: Uses **Freighter Extension** for non-custodial browser-based signing.
- **Telegram**: Uses **Server-Side Keypair Generation** (unique per TG ID) stored in `users.json`.
- **Portability**: Users can use the `/export` command to get their private key and manage their "Bot Wallet" in Freighter.

---

## 🔄 Lifecycle of a MicroGig
1.  **Creation**: Human prompts Bot `/create write a poem`.
2.  **Refinement**: AI Agent generates a professional draft.
3.  **Deployment**: Human sets reward (e.g., 5 XLM) and Bot deploys to Soroban.
4.  **Work**: Worker solves task via `/submit` or via Web UI.
5.  **Review**: AI Agent scores the work (e.g., 9.4/10).
6.  **Settle**: Human confirms the recommendation on the Web Dashboard or via Bot `/pick`, closing the gig on-chain.
