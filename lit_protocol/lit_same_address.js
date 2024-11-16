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

// Load environment variables
dotenv.config();

class Lit {
   litNodeClient;
   chain;

   constructor(chain){
     this.chain = chain;
   }

   async connect() {
      this.litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: "datil-dev",
      });
      await this.litNodeClient.connect();
   }

   async encrypt(message) {
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

   async getSessionSignatures() {
      // Using server-side approach with a private key
      if (!process.env.PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY not found in environment variables");
      }

      const ethWallet = new ethers.Wallet(process.env.PRIVATE_KEY);

      // Rest of the method remains the same
      const latestBlockhash = await this.litNodeClient.getLatestBlockhash();

      const authNeededCallback = async(params) => {
        if (!params.uri) throw new Error("uri is required");
        if (!params.expiration) throw new Error("expiration is required");
        if (!params.resourceAbilityRequests) throw new Error("resourceAbilityRequests is required");

        const toSign = await createSiweMessageWithRecaps({
          uri: params.uri,
          expiration: params.expiration,
          resources: params.resourceAbilityRequests,
          walletAddress: ethWallet.address,
          nonce: latestBlockhash,
          litNodeClient: this.litNodeClient,
        });

        const authSig = await generateAuthSig({
          signer: ethWallet,
          toSign,
        });

        return authSig;
      }

      const litResource = new LitAccessControlConditionResource('*');

      const sessionSigs = await this.litNodeClient.getSessionSigs({
          chain: this.chain,
          resourceAbilityRequests: [
              {
                  resource: litResource,
                  ability: LitAbility.AccessControlConditionDecryption,
              },
          ],
          authNeededCallback,
      });
      return sessionSigs;
   }

   async decrypt(ciphertext, dataToEncryptHash, accessControlConditions) {
      const sessionSigs = await this.getSessionSignatures();

      const decryptedString = await LitJsSdk.decryptToString(
        {
          accessControlConditions,
          chain: this.chain,
          ciphertext,
          dataToEncryptHash,
          sessionSigs,
        },
        this.litNodeClient,
      );

      return { decryptedString };
   }
}

const chain = "ethereum";

async function main() {
    let myLit = new Lit(chain);
    await myLit.connect();
    console.log("Connected to Lit Protocol!");

    // Test encryption
    const dummyMessage = "Hello, this is a secret message!";
    try {
        const encryptedData = await myLit.encrypt(dummyMessage);
        console.log("Encryption successful!");
        console.log("Encrypted data:", encryptedData);

        // Test decryption
        const decryptedData = await myLit.decrypt(
            encryptedData.ciphertext, 
            encryptedData.dataToEncryptHash,
            encryptedData.accessControlConditions
        );
        console.log("Decryption successful!");
        console.log("Decrypted message:", decryptedData.decryptedString);
    } catch (err) {
        console.error("Operation failed:", err);
    }
}

main().catch(console.error);