import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { ethers } from "ethers";
import {
  LitAccessControlConditionResource,
  LitAbility,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import dotenv from 'dotenv';

dotenv.config();

class Lit {
   constructor(chain) {
     this.chain = chain;
     this.litNodeClient = null;
     this.capacityDelegationAuthSig = null;
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

      const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
        {
          accessControlConditions,
          dataToEncrypt: message,
          chain: this.chain,
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

   decrypt = async (ciphertext, dataToEncryptHash, accessControlConditions) => {
      // First get the capacity delegation
      const capacityDelegationAuthSig = await this.createCapacityDelegation();
      
      // Then get session signatures
      const sessionSigs = await this.getSessionSignatures();

      const decryptedString = await LitJsSdk.decryptToString(
        {
          accessControlConditions,
          chain: this.chain,
          ciphertext,
          dataToEncryptHash,
          sessionSigs,
          capacityDelegationAuthSig, // Add the delegation here instead
        },
        this.litNodeClient,
      );

      return { decryptedString };
   }
}

const chain = "baseSepolia";

async function main() {
    let myLit = new Lit(chain);
    await myLit.connect();
    console.log("Connected to Lit Protocol!");

    // Get wallet addresses for logging
    const ownerWallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY);
    const userWallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY);
    console.log("Owner wallet address:", ownerWallet.address);
    console.log("User wallet address:", userWallet.address);

    // Test encryption
    const dummyMessage = "Hello, this is a secret message!";
    try {
        const encryptedData = await myLit.encrypt(dummyMessage);
        console.log("Encryption successful!");
        console.log("Encrypted data:", encryptedData);

        // Test decryption with user wallet
        const decryptedData = await myLit.decrypt(
            encryptedData.ciphertext, 
            encryptedData.dataToEncryptHash,
            encryptedData.accessControlConditions
        );
        console.log("Decryption successful!");
        console.log("Decrypted message:", decryptedData.decryptedString);
    } catch (err) {
        console.error("Operation failed:", err);
        console.error("Error details:", err.stack);
    }
    await myLit.disconnect();
}

main().catch(console.error);