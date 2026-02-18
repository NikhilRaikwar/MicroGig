# MicroGig 🌌 | Stellar Journey to Mastery - Levels 1, 2, 3 & 4

![MicroGig CI](https://github.com/NikhilRaikwar/MicroGig/actions/workflows/ci.yml/badge.svg)

**MicroGig** has evolved into a full-stack dApp! For Level 2, we moved the entire task registry to the Stellar Blockchain using a **Soroban Smart Contract**.

## 🚀 Levels

| Badge | Status | Documentation |
| :--- | :--- | :--- |
| **White Belt** ⚪ | Completed | [Level 1](./docs/WHITE_BELT.md) |
| **Yellow Belt** 🟡 | Completed | [Level 2](./docs/YELLOW_BELT.md) |
| **Orange Belt** 🟠 | Completed | [Level 3](./docs/ORANGE_BELT.md) |
| **Green Belt** 💚 | Completed | [Level 4](./docs/GREEN_BELT.md) |

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

### 📸 Level 2 Proofs
- **Multi-Wallet UI Screenshot**: [View Image](https://github.com/user-attachments/assets/50f41a0b-e238-4b8b-934e-6cb8e5883867)
- **Verified Contract Call**: [View Tx on Stellar Expert](https://stellar.expert/explorer/testnet/tx/250ee016ae2431ded5a00fe50507b9903bd392eaef3d7c7f2467074dd04f3f7a)
- **Error Types Handled**:
  1. **Wallet Not Found**: Prompts installation.
  2. **User Rejection**: Catches cancellation errors.
  3. **RPC Failure**: Handles simulation errors gracefully.

---

## 🟠 Level 3 (Orange Belt) Highlights

- [x] **Performance**: Implemented basic caching to optimize RPC calls.
- [x] **Quality**: 100% test coverage for core utility functions (Vitest).
- [x] **Transparency**: Automated transaction tracking and verifiable receipts.
- [x] **Demo Video**: [Full Walkthrough (1min)](https://youtu.be/3kPygvjFNS0)
- [x] **Verified Tx**: [pick_winner (250ee01...)](https://stellar.expert/explorer/testnet/tx/250ee016ae2431ded5a00fe50507b9903bd392eaef3d7c7f2467074dd04f3f7a)

---

## 💚 Level 4 (Green Belt) Highlights

- [x] **Production Ready**: Full CI/CD pipeline integrated via GitHub Actions.
- [x] **Mobile First**: 100% responsive design for all device sizes.
- [x] **Event Streaming**: Core support for Soroban real-time event tracking.
- [x] **Error Tracking**: Advanced RPC error diagnostics for production debugging.
- [x] **Persistence**: Automatic wallet session management across refreshes.

---

## 🛠️ Project Structure
- `src/lib/contract.ts`: Contract logic and typing.
- `src/pages/GigDetail.tsx`: UI for viewing tasks and selecting winners.
- `contracts/gig-registry`: Rust Smart Contract Source, Tests, and Config.
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
