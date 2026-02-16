# MicroGig 🌌 | Stellar Journey to Mastery - Level 1 & 2

**MicroGig** has evolved into a full-stack dApp! For Level 2, we moved the entire task registry to the Stellar Blockchain using a **Soroban Smart Contract**.

## 🚀 Levels

| Badge | Status | Documentation |
| :--- | :--- | :--- |
| **White Belt** ⚪ | Completed | [Level 1 Documentation](./docs/WHITE_BELT.md) |
| **Yellow Belt** 🟡 | Completed | [Level 2 Documentation](./docs/YELLOW_BELT.md) |

---

## ⚪ Level 1 (White Belt) Highlights

- [x] **Wallet Connection**: Integrated Freighter wallet for user authentication.
- [x] **Basic Payments**: Enabled sending peer-to-peer XLM payments on Testnet.
- [x] **Account Info**: Real-time display of user's XLM balance and address.
- [x] **Transaction Status**: Visual feedback for payment progress.

---

## 🟡 Level 2 (Yellow Belt) Highlights

- [x] **Registry Contract**: Custom Rust contract (`GigRegistry`) deployed to Testnet.
- [x] **Storage**: Tasks are permanently stored on-chain (contract state), not local storage.
- [x] **New Features**: 
    - **Multi-Submission**: Multiple workers can submit work regarding a single gig.
    - **Winner Selection**: Creator picks the winner on-chain.
    - **Receipt Storage**: Payment transaction hash is stored permanently on-chain.
- [x] **Contract ID**: `CCIMNZ2TTDBRAONQE56XAQUGCNM7IBKNWKDTK42DYRMQUABJ45IOOSQV`

## 🛠️ Project Structure
- `src/lib/contract.ts`: Contract logic and typing.
- `src/pages/GigDetail.tsx`: UI for viewing tasks and selecting winners.
- `contract-source/lib.rs`: Rust Source Code for the Smart Contract.
- `docs/`: Detailed documentation for each level.

## ⚙️ Setup & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Freighter Wallet](https://www.freighter.app/) extension installed in your browser.
- Set Freighter to **Testnet** (Settings -> Network -> Testnet).

### 2. Run Locally
```bash
# Clone the repository and enter the directory
cd microgig-stellar-pay-main

# Install dependencies
npm install

# Start the development server
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---
Built for the **Stellar Journey to Mastery** • 2026
