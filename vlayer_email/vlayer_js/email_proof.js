import fs from "fs";
import { preverifyEmail, createVlayerClient } from "@vlayer/sdk";
import emailProverAbi from "./emailProver.abi.json" assert { type: "json" };

// Read the email MIME-encoded file content
const email = fs.readFileSync("mail.eml").toString();

// Prepare the email for verification
const unverifiedEmail = await preverifyEmail(email);

// Create vlayer server client
const vlayer = createVlayerClient();

const hash = await vlayer.prove({
  address: 0x38B00d0ba50f32f85883033F63B042750f33d057,
  proverAbi: emailProverAbi.abi,
  functionName: "main",
  args: [unverifiedEmail],
  chainId: 84532,
});

const result = await vlayer.waitForProvingResult(hash);
console.log(result);