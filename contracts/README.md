# MicroGig Smart Contracts 🚀

This directory contains the Soroban smart contracts for the MicroGig platform, a decentralized nano-task marketplace.

## 📁 Project Structure

- `gig-registry/src/lib.rs`: **Core Logic**. Handles gig creation, work submissions, and payment tracking.
- `gig-registry/src/test.rs`: **Unit Tests**. Comprehensive test suite for contract state and authorization.
- `gig-registry/Cargo.toml`: Configuration for `soroban-sdk v22` and optimized WASM build profiles.

## 🛠 Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup#install-the-stellar-cli)
- WASM Target: `rustup target add wasm32-unknown-unknown`

## 🧪 Testing

We use a robust unit testing suite to verify all contract functions and mock authorizations.

```bash
cd gig-registry
cargo test
```

## 📦 Building

To compile the contract to a production-ready WASM file:

```bash
cd gig-registry
stellar contract build
```

The optimized WASM file will be located in `target/wasm32-unknown-unknown/release/gig_registry.wasm`.

## 🚢 Deployment (Testnet)

1. **Config Identity**: `stellar keys generate --global alice`
2. **Deploy**:
   ```bash
   stellar contract deploy --wasm target/wasm32-unknown-unknown/release/gig_registry.wasm --source alice --network testnet
   ```

## 🔒 Security & Optimization

- **SDK v22**: Upgraded to the latest stable SDK for maximum security and macro fixes.
- **WASM Optimization**: Profiles are configured for size (`opt-level = "z"`) and security (overflow checks).
- **Automated CI**: GitHub Actions automatically run contract tests on every push.
