import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

class LitEncrypt {
   constructor(chain) {
     this.chain = chain;
     this.litNodeClient = null;
   }

   connect = async () => {
      this.litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: "datil-dev",
      });
      await this.litNodeClient.connect();
   }

   createCapacityDelegation = async () => {
      if (!process.env.OWNER_PRIVATE_KEY || !process.env.CAPACITY_TOKEN_ID) {
        throw new Error("OWNER_PRIVATE_KEY or CAPACITY_TOKEN_ID not found in environment variables");
      }

      const ownerWallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY);
      
      return await this.litNodeClient.createCapacityDelegationAuthSig({
        uses: '1000',
        dAppOwnerWallet: ownerWallet,
        capacityTokenId: process.env.CAPACITY_TOKEN_ID,
      });
   }

   getAccessControlConditions = (type, contractAddress, amount) => {
    if (type === 'nft') {
      return [
        {
          contractAddress: contractAddress,
          standardContractType: 'ERC721',
          chain: this.chain,
          method: 'balanceOf',
          parameters: [
            ':userAddress'
          ],
          returnValueTest: {
            comparator: '>',
            value: '0'
          }
        }
      ];
    } else if (type === 'balance') {
      // Convert amount to wei and then to string
      const weiAmount = (amount * 1e18).toString();
      return [
        {
          contractAddress: "",
          standardContractType: "",
          chain: this.chain,
          method: "eth_getBalance",
          parameters: [":userAddress", "latest"],
          returnValueTest: {
            comparator: ">=",
            value: weiAmount, // amount in wei as string
          },
        },
      ];
    } else if (type === 'tokens' ){
      // For ERC20, convert to token decimal places
      const tokenAmount = (amount * 1e18).toString();
      return [
        {
          contractAddress: contractAddress,
          standardContractType: 'ERC20',
          chain: this.chain,
          method: 'balanceOf',
          parameters: [
            ':userAddress'
          ],
          returnValueTest: {
            comparator: '>',
            value: tokenAmount
          }
        }
      ]
    }
    else {
      throw new Error("Invalid type. Must be 'nft' or 'tokens' or 'balance'");
    }
 }

   encrypt = async (message, contractAddress, type, amount) => {
      const accessControlConditions = this.getAccessControlConditions(type, contractAddress, amount);
      console.log("Using access control conditions:", JSON.stringify(accessControlConditions, null, 2));

      // Create capacity delegation first
      const capacityDelegationAuthSig = await this.createCapacityDelegation();
      console.log("Capacity delegation created successfully");

      const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
        {
          accessControlConditions,
          dataToEncrypt: message,
          chain: this.chain,
          capacityDelegationAuthSig,
        },
        this.litNodeClient,
      );

      return {
        ciphertext,
        dataToEncryptHash,
        accessControlConditions,
        chain: this.chain
      };
   }
}

async function main() {
    // Get command line arguments
    const args = process.argv.slice(2);
    if (args.length !== 4) {
        console.error("Usage: node encrypt.js <type> <amount> <contract-address> <message>");
        console.error("Type must be 'nft' or 'tokens' or 'balance'");
        console.error("Example for NFT: node encrypt.js nft 1 0xA80617371A5f511Bf4c1dDf822E6040acaa63e71 \"The event location is 221b Baker St\"");
        console.error("Example for Tokens: node encrypt.js tokens 100 0xA80617371A5f511Bf4c1dDf822E6040acaa63e71 \"The event location is 221b Baker St\"");
        process.exit(1);
    }

    const type = args[0].toLowerCase();
    const amount = args[1]
    const contractAddress = args[2];
    const message = args[3];

    // Validate type
    if (type !== 'nft' && type !== 'tokens'&& type !== 'balance') {
        console.error("Error: Type must be 'nft' or 'tokens' or 'balance'");
        process.exit(1);
    }

    // Validate contract address for NFT type
    if (type === 'nft' && !ethers.isAddress(contractAddress)) {
        console.error("Error: Invalid Ethereum address");
        process.exit(1);
    }

    const chain = "baseSepolia";
    let litEncrypt = new LitEncrypt(chain);
    await litEncrypt.connect();
    console.log("Connected to Lit Protocol!");

    try {
        console.log(`Encrypting message using ${type.toUpperCase()} condition${type === 'nft' ? ` for contract: ${contractAddress}` : ''}`);
        const encryptedData = await litEncrypt.encrypt(message, contractAddress, type, amount);
        console.log("Encryption successful!");
        
        // Save to file
        const filename = `scripts/encrypted_data.json`;
        fs.writeFileSync(filename, JSON.stringify(encryptedData, null, 2));
        console.log(`Encrypted data saved to ${filename}`);
        
    } catch (err) {
        console.error("Operation failed:", err);
        console.error("Error details:", err.stack);
        await litEncrypt.litNodeClient.disconnect();
    }
    await litEncrypt.litNodeClient.disconnect();
}

main().catch(console.error);