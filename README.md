# Tick3t 🎟️

Privacy-first on-chain event ticketing platform with gasless transactions and smart wallet integration through Telegram. Built at ETHGlobal Bangkok 2024.

## 🌟 Features

- **Gasless NFT Tickets**: Event organizers can sponsor gas fees, removing barriers for attendees
- **Smart Account Integration**: Instant wallet creation via Telegram for 1B+ potential users
- **Privacy Preservation**: ZK technology for private events and selective information disclosure
- **Multi-chain Support**: Deploy and manage events across multiple networks

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
