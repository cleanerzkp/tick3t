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

   encrypt = async (message) => {
      const accessControlConditions = [
        {
          contractAddress: "",
          standardContractType: "",
          chain: "baseSepolia",
          method: "eth_getBalance",
          parameters: [":userAddress", "latest"],
          returnValueTest: {
            comparator: ">=",
            value: "1000000000000", // 0.000001 ETH
          },
        },
      ];

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
    const chain = "baseSepolia";
    let litEncrypt = new LitEncrypt(chain);
    await litEncrypt.connect();
    console.log("Connected to Lit Protocol!");

    const dummyMessage = "The event location is 221b Baker St, London NW1 6XE, United Kingdom";
    try {
        const encryptedData = await litEncrypt.encrypt(dummyMessage);
        console.log("Encryption successful!");
        
        // Save to file
        fs.writeFileSync('encrypted_data.json', JSON.stringify(encryptedData, null, 2));
        console.log("Encrypted data saved to encrypted_data.json");
        
    } catch (err) {
        console.error("Operation failed:", err);
        console.error("Error details:", err.stack);
    }
    await litEncrypt.litNodeClient.disconnect();
}

main().catch(console.error);