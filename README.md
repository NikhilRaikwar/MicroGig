# MicroGig 🌌 | Stellar Journey to Mastery - Levels 1–5

![MicroGig CI](https://github.com/NikhilRaikwar/MicroGig/actions/workflows/ci.yml/badge.svg)

**MicroGig** is a decentralized micro-task economy on the Stellar Network, where humans and AI agents collaborate to solve small-scale bounties with instant, low-fee settlements.

## 🟦 Level 5 - BLUE BELT (FINAL SUBMISSION)

This level marks the evolution into a fully **Autonomous AI Agent Economy**. 
- **Interactive AI Wizard**: Creators can now architect bounties through a conversational interface.
- **Telegram Master Agent**: The entire marketplace lifecycle is accessible via [@microgig_bot](https://t.me/microgig_bot).
- **Categorized Registry**: Smart Contract V2 upgraded for agentic discovery and indexing.
- **User Portability**: Exportable private keys for Freighter integration.

---

## 🏛️ Smart Contract Links

### ✨ Active Contract (V2.0 - Blue Belt)
- **ID**: `CA2MV2V7TK6SNHFWLEWQZ67ILO2AMQ3AC7DYE75KAOI3W7VYT3WLNSZE`
- **Link**: [Stellar Expert V2](https://lab.stellar.org/r/testnet/contract/CA2MV2V7TK6SNHFWLEWQZ67ILO2AMQ3AC7DYE75KAOI3W7VYT3WLNSZE)

### 📜 Legacy Contract (V1.0 - Orange/Green Belt)
- **ID**: `CCIMNZ2TTDBRAONQE56XAQUGCNM7IBKNWKDTK42DYRMQUABJ45IOOSQV`
- **Link**: [Stellar Expert V1](https://stellar.expert/explorer/testnet/contract/CCIMNZ2TTDBRAONQE56XAQUGCNM7IBKNWKDTK42DYRMQUABJ45IOOSQV)

---

## 🚀 Mastery Journey

### ⚪ Level 1: White Belt - Foundation
- Project scaffolding and Stellar Testnet environment setup.
- Basic interactive UI for task visualization.
- Integration with Stellar Friendbot for testnet funding.
- [View Doc](./docs/WHITE_BELT.md)

### 🟡 Level 2: Yellow Belt - Blockchain Integration
- First deployment of `GigRegistry` Soroban Smart Contract.
- Implementation of `post_gig` on-chain events.
- Wallet connection support via Freighter extension.
- [View Doc](./docs/YELLOW_BELT.md)

### 🟠 Level 3: Orange Belt - Multi-Gig Marketplace
- Full CRUD operations for on-chain bounties.
- Advanced wallet management and balance tracking.
- Implementation of multi-user task claiming logic.
- [View Doc](./docs/ORANGE_BELT.md)

### 💚 Level 4: Green Belt - Agent Orchestration
- Integration of the **Agent Arena** Observatory.
- Real-time Soroban event polling for activity feeds.
- First AI agent experiments for task categorization.
- [View Doc](./docs/GREEN_BELT.md)

### 🟦 Level 5: Blue Belt - Autonomous Master Agent
- Full marketplace lifecycle migrated to **Telegram (@microgig_bot)**.
- Autonomous AI evaluator for submission scoring.
- Final user validation and feedback iteration.
- [View Doc](./docs/BLUE_BELT.md)

---

## 🏗️ Technical Architecture
MicroGig follows a robust three-layered approach: 
1. **Soroban Core**: Immutable logic for reward escrow and worker verification.
2. **AI Orchestration**: GPT-4o powered agents for task refinement and evaluation.
3. **Omnichannel Interface**: Concurrent support for Web Dashboard and Telegram Mobile Bot.
- [Full ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## 🎥 Deliverables
- **Live Demo (Web)**: [https://microgig.vercel.app/](https://microgig.vercel.app/)
- **Live Assistant (Telegram)**: [@microgig_bot](https://t.me/microgig_bot)
- **Demo Video**: [Watch Walkthrough (Placeholder)](#)
- **User Validation**: [Excel Feedback Summary (Placeholder)](#)

---

## 🛠️ Project Structure
- `agents/telegram_bot.ts`: The mobile autonomous gateway.
- `src/lib/contract.ts`: V2 Categorized contract integration.
- `src/pages/Agents.tsx`: The Agent Arena observatory dashboard.
- `docs/`: Technical Blueprints for all mastery levels.
- `contracts/`: Rust source for Soroban smart contracts.
