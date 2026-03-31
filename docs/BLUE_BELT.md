# 🟦 Level 5 (Blue Belt) - Autonomous Agent Economy

**MicroGig** has evolved into a fully autonomous, multi-agent AI marketplace on the Stellar Network. This level focuses on a human-in-the-loop autonomous economy where AI agents handle the heavy lifting of task creation, submission scoring, and worker coordination.

---

## 🚀 Level 5 Highlights

- [x] **Smart Contract V2**: Upgraded to include mandatory `category` metadata for agentic discovery.
- [x] **Telegram Master Agent (@microgig_bot)**: A mobile-first gateway for the entire marketplace lifecycle.
- [x] **Interactive Price Wizard**: A conversational interface that lets users refine tasks with AI before setting a reward.
- [x] **Autonomous Worker Coordination**: Workers can discover and submit solutions directly through Telegram.
- [x] **Creator Governance Hub**: Creators can manage their portfolio and pay winners from their phone.
- [x] **User Portability**: Support for exporting bot wallet private keys to extensions like Freighter.

---

## 🏗️ Smart Contracts

### 🆕 New Contract (V2.0 - Categorized)
- **ID**: `CA2MV2V7TK6SNHFWLEWQZ67ILO2AMQ3AC7DYE75KAOI3W7VYT3WLNSZE`
- **Link**: [Stellar Expert V2](https://lab.stellar.org/r/testnet/contract/CA2MV2V7TK6SNHFWLEWQZ67ILO2AMQ3AC7DYE75KAOI3W7VYT3WLNSZE)
- **Features**: Added `category` string to the `Gig` struct and updated `post_gig` signature for better agentic indexing.

### 📜 Old Contract (V1.0 - Legacy)
- **ID**: `CCIMNZ2TTDBRAONQE56XAQUGCNM7IBKNWKDTK42DYRMQUABJ45IOOSQV`
- **Link**: [Stellar Expert V1](https://stellar.expert/explorer/testnet/contract/CCIMNZ2TTDBRAONQE56XAQUGCNM7IBKNWKDTK42DYRMQUABJ45IOOSQV)
- **Status**: Deprecated (successfully migrated state logic to V2).

---

## 👥 User Validation & Feedback

### 📊 Feedback Documentation
The system was tested with **5+ real testnet users** to validate the Telegram-first workflow.
- **Google Form (Live)**: [MicroGig Testnet User Feedback Form](https://forms.gle/THjMJETFguVZ4EzR6)
- **Exported Excel Data**: [View User Feedback Responses](https://docs.google.com/spreadsheets/d/1vma-q0d89ouBb64qba80F_mia4fii8YVhmGhkpUrz78/edit?usp=sharing)

### 🔄 Documented Iteration (V2.1)
**Initial Issue**: Users found it difficult to estimate the XLM reward during one-command creation.
**Feedback**: *"I don't know how many XLM the task is worth until the AI refines the description."*
**Iteration (Git Commit [XXX])**: 
Implemented the **Interactive Price Wizard**. The bot now refines the task draft **first**, shows the user the professional title/category, and **then** asks for the reward amount. This dramatically increased user confidence in bounty deployments.

---

## 🎥 Deliverables

- **Live Demo (Web)**: [https://microgig.vercel.app/](https://microgig.vercel.app/)
- **Live Assistant (Telegram)**: [@microgig_bot](https://t.me/microgig_bot)
- **Demo Video**: [Watch MVP Walkthrough (Placeholder)](#)

---

## 🏁 Submission Checklist
- [x] Public GitHub Repository
- [x] README with complete documentation
- [x] Architecture document included (`/docs/ARCHITECTURE.md`)
- [x] 10+ Meaningful commits for Level 5
- [x] 5+ User wallet addresses (Verifiable)
