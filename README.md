# Tick3t 🎟️

Privacy-first on-chain event ticketing platform with gasless transactions and smart wallet integration through Telegram. Built at ETHGlobal Bangkok 2024.

## 🌟 Features

- **Gasless NFT Tickets**: Event organizers can sponsor gas fees, removing barriers for attendees
- **Smart Account Integration**: Instant wallet creation via Telegram for 1B+ potential users
- **Privacy Preservation**: ZK technology for private events and selective information disclosure
- **Multi-chain Support**: Deploy and manage events across multiple networks


## Deployed contracts

| Contract | Network | Address | Etherscan Verified |
| --------------- | --------------- | --- | ----- |
| Event Factory  | Base Sepolia  | [0x439AEfC24D2BD67470891B5AAc2663ba0d148cf1](https://base-sepolia.blockscout.com/address/0x439AEfC24D2BD67470891B5AAc2663ba0d148cf1)  | :white_check_mark:  |
| Email Verifier  | Base Sepolia  | [0xc6178EEeD9dA5253D040388a9f300374648c303c](https://base-sepolia.blockscout.com/address/0xc6178EEeD9dA5253D040388a9f300374648c303c)  | :white_check_mark:  |
| Email Prover  | Base Sepolia  | [0xc500a04866c94639F1b82fB3c1d35c76903FbB35](https://base-sepolia.blockscout.com/address/0xc500a04866c94639F1b82fB3c1d35c76903FbB35)  | :white_check_mark:  |
| Event Factory  | Scroll Sepolia  | [0x7133cf0d4597f39ffa0e5dd19144800fd49ec47b](https://sepolia.scrollscan.com/address/0x7133cf0d4597f39ffa0e5dd19144800fd49ec47b)  | :white_check_mark:  |
| Event Factory  | Chiliz Spicy  | [0xf67125d4169C343479Ab66353d5135fE5e50AEb2](https://spicy-explorer.chiliz.com/address/0xf67125d4169C343479Ab66353d5135fE5e50AEb2)  | :white_check_mark:  |





## 🏗️ Project Structure

```
tick3t/
├── contracts/           # Foundry smart contracts for ticketing
├── frontend/           # Next.js web application
├── lit_protocol/      # Privacy and encryption integration
├── server/           # Backend services and APIs
└── vlayer_email/     # Email verification layer
```

## 🛠️ Tech Stack

- **Frontend**: 
  - Next.js + React
  - TailwindCSS
  - Dynamic SDK (Telegram integration)
  - Biconomy SDK (Account abstraction)

- **Smart Contracts**:
  - Solidity
  - Foundry
  - OpenZeppelin

## 🚀 Supported Networks

- Base Sepolia
- Arbitrum Sepolia
- Scroll Sepolia
- Mantle Sepolia
- Chiliz Testnet
- Polygon Amoy
- Gnosis Chiado
- Flow Testnet

## 🔧 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/cleanerzkp/tick3t.git
cd tick3t
```

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your configuration values
```

4. Run development environment:
```bash
cd frontend
npm run dev
```

## 💻 Development Team

- [@cleanerzkp](https://github.com/cleanerzkp)
- [@HemangVora](https://github.com/HemangVora)
- [@miqlar](https://github.com/miqlar)
- [@Tanguyvans](https://github.com/Tanguyvans)

## 🙏 Acknowledgments

Built with support from:
- Biconomy (Account Abstraction)
- Dynamic (Authentication)
- Base (L2 Scaling)
- Lit Protocol (Privacy)
- ??? add otehrs pls
