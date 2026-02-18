# Gig Registry Contract (Soroban)

This directory contains the Smart Contract source code for the MicroGig platform.

## 📁 Structure

- `src/lib.rs`: **Main Contract Logic**. Contains the `post_gig`, `submit_work`, and `pick_winner` functions.
- `src/test.rs`: **Unit Tests**. Simulates the full gig lifecycle (Post -> Submit -> Win) in a test environment.
- `Cargo.toml`: Project configuration and Soroban dependencies.

## 🛠️ How to Test

You can run the test suite using standard Rust tooling:

```bash
cd contracts/gig-registry
cargo test
```

## 📦 How to Build

To compile the contract to WASM:

```bash
cargo build --target wasm32-unknown-unknown --release
```
