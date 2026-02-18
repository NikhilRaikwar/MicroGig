# Gig Registry Contract (Soroban)

This directory contains the Smart Contract source code for the MicroGig platform.

## 📁 Structure

- `src/lib.rs`: **Main Contract Logic**. Contains the `post_gig`, `submit_work`, and `pick_winner` functions.
- `Cargo.toml`: Project configuration and Soroban dependencies.

## 📦 How to Build

To compile the contract to WASM:

```bash
cd contracts/gig-registry
cargo build --target wasm32-unknown-unknown --release
```
