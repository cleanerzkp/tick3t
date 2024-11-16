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
      const encryptedData = JSON.parse(fs.readFileSync('scripts/encrypted_data.json', 'utf8'));

      const chain = encryptedData.chain || "baseSepolia";
      let litDecrypt = new LitDecrypt(chain);
      await litDecrypt.connect();

      const userWallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY);
      const decryptedData = await litDecrypt.decrypt(encryptedData);
      
      // First disconnect
      await litDecrypt.litNodeClient.disconnect();
      
      // Then output our result as the last thing we do
      process.stdout.write(JSON.stringify({
          success: true,
          decryptedMessage: decryptedData.decryptedString
      }));

  } catch (err) {
      // First disconnect if we can
      if (litDecrypt?.litNodeClient) {
          await litDecrypt.litNodeClient.disconnect();
      }
      
      // Then output error
      process.stdout.write(JSON.stringify({
          success: false,
          error: err.message,
          details: err.details || null
      }));
  }
}

// Run main and handle any uncaught errors
main().catch((err) => {
  process.stdout.write(JSON.stringify({
      success: false,
      error: 'Uncaught error',
      details: err.message
  }));
});