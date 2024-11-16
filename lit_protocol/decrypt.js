import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import {
  LitAccessControlConditionResource,
  LitAbility,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

class LitDecrypt {
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

   getSessionSignatures = async () => {
      if (!process.env.USER_PRIVATE_KEY) {
        throw new Error("USER_PRIVATE_KEY not found in environment variables");
      }

      const userWallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY);
      const latestBlockhash = await this.litNodeClient.getLatestBlockhash();

      const authNeededCallback = async(params) => {
        if (!params.uri) throw new Error("uri is required");
        if (!params.expiration) throw new Error("expiration is required");
        if (!params.resourceAbilityRequests) throw new Error("resourceAbilityRequests is required");

        const toSign = await createSiweMessageWithRecaps({
          uri: params.uri,
          expiration: params.expiration,
          resources: params.resourceAbilityRequests,
          walletAddress: userWallet.address,
          nonce: latestBlockhash,
          litNodeClient: this.litNodeClient,
        });

        const authSig = await generateAuthSig({
          signer: userWallet,
          toSign,
        });

        return authSig;
      }

      const litResource = new LitAccessControlConditionResource('*');

      return await this.litNodeClient.getSessionSigs({
          chain: this.chain,
          resourceAbilityRequests: [
              {
                  resource: litResource,
                  ability: LitAbility.AccessControlConditionDecryption,
              },
          ],
          authNeededCallback,
      });
   }

   decrypt = async (encryptedData) => {
      console.log("Starting decryption process...");
      
      // Get session signatures
      const sessionSigs = await this.getSessionSignatures();
      console.log("Session signatures obtained");

      const decryptedString = await LitJsSdk.decryptToString(
        {
          accessControlConditions: encryptedData.accessControlConditions,
          chain: encryptedData.chain,
          ciphertext: encryptedData.ciphertext,
          dataToEncryptHash: encryptedData.dataToEncryptHash,
          sessionSigs,
        },
        this.litNodeClient,
      );

      return { decryptedString };
   }
}

async function main() {
    try {
        // Read the encrypted data from file
        const encryptedData = JSON.parse(fs.readFileSync('encrypted_data.json', 'utf8'));
        console.log("Read encrypted data from file");

        // Validate the encrypted data
        if (!encryptedData.accessControlConditions || 
            !encryptedData.ciphertext || 
            !encryptedData.dataToEncryptHash) {
            throw new Error("Invalid encrypted data structure in file");
        }

        const chain = encryptedData.chain || "baseSepolia";
        let litDecrypt = new LitDecrypt(chain);
        await litDecrypt.connect();
        console.log("Connected to Lit Protocol!");

        const userWallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY);
        console.log("User wallet address:", userWallet.address);

        const decryptedData = await litDecrypt.decrypt(encryptedData);
        console.log("Decryption successful!");
        console.log("Decrypted message:", decryptedData.decryptedString);
        await litDecrypt.litNodeClient.disconnect();

    } catch (err) {
        console.error("Operation failed:", err);
        if (err.details) {
            console.error("Error details:", err.details);
        }
        if (err.stack) {
            console.error("Stack trace:", err.stack);
        }
    }
}

main().catch(console.error);