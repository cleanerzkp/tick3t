import fs from "fs";
import { preverifyEmail, createVlayerClient } from "@vlayer/sdk";
import emailProverAbi from "./emailProver.abi.json" assert { type: "json" };
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const EVENT_TICKET_ABI = [
    {
        "inputs": [
            {
                "components": [
                    {
                        "components": [
                            {
                                "internalType": "bytes4",
                                "name": "verifierSelector",
                                "type": "bytes4"
                            },
                            {
                                "internalType": "bytes32[8]",
                                "name": "seal",
                                "type": "bytes32[8]"
                            },
                            {
                                "internalType": "enum ProofMode",
                                "name": "mode",
                                "type": "uint8"
                            }
                        ],
                        "internalType": "struct Seal",
                        "name": "seal",
                        "type": "tuple"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "callGuestId",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "length",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "proverContractAddress",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes4",
                                "name": "functionSelector",
                                "type": "bytes4"
                            },
                            {
                                "internalType": "uint256",
                                "name": "settleBlockNumber",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "settleBlockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CallAssumptions",
                        "name": "callAssumptions",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct Proof",
                "name": "emailProof",
                "type": "tuple"
            }
        ],
        "name": "buy",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];

async function main() {
    try {
        if (!process.env.PRIVATE_KEY || !process.env.RPC_URL || !process.env.CONTRACT_ADDRESS) {
            throw new Error("Please provide PRIVATE_KEY, RPC_URL and CONTRACT_ADDRESS in .env file");
        }

        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, EVENT_TICKET_ABI, signer);

        // Get email proof
        const email = fs.readFileSync("mail.eml").toString();
        const unverifiedEmail = await preverifyEmail(email);
        const hackedDns = 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCPwsG12awgnJc3oDr984Y5bVhgJ+EPiGlPqGD+IwD/iVz80hI9o3AVfEjmUgHxCToZsuRxs6dez3TDD1wYRiWcNlmgcEy68IxuAf4nAGxmAueSKRYoencKlH5Bn5XDnQDlnZbr7WWsKlBoDfb2lhK+WSxmDm4oo7Zh+qxzh45elwIDAQAB; n=1024,1450901090,1466712290';
        unverifiedEmail.dnsRecords = [hackedDns];

        const vlayer = createVlayerClient({url:"https://test-prover.vlayer.xyz"});
        
        console.log("Getting proof from vlayer...");
        const hash = await vlayer.prove({
            address: "0xE67C22E9A5612D9De94c01d5Bb0e72E8041E05AD",
            proverAbi: emailProverAbi.abi,
            functionName: "main",
            args: [unverifiedEmail],
            chainId: 84532,
        });

        console.log("Waiting for proof result...");
        const proofResult = await vlayer.waitForProvingResult(hash);
        console.log("Raw proof result:", JSON.stringify(proofResult, null, 2));

        // Get the first element of the array
        const result = proofResult[0];
        console.log("Using proof element:", JSON.stringify(result, null, 2));

        // Format proof for contract
        const proof = {
            seal: {
                verifierSelector: result.seal.verifierSelector,
                seal: result.seal.seal,
                mode: result.seal.mode
            },
            callGuestId: result.callGuestId,
            length: result.length,
            callAssumptions: {
                proverContractAddress: result.callAssumptions.proverContractAddress,
                functionSelector: result.callAssumptions.functionSelector,
                settleBlockNumber: result.callAssumptions.settleBlockNumber,
                settleBlockHash: result.callAssumptions.settleBlockHash
            }
        };

        console.log("Proof formatted for contract:", JSON.stringify(proof, null, 2));
        
        console.log("Sending transaction...");
        const tx = await contract.buy(proof, {
            value: 0,
            gasLimit: 500000 // Adding explicit gas limit
        });

        console.log("Transaction sent! Hash:", tx.hash);
        console.log("Waiting for confirmation...");
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        
    } catch (error) {
        console.error("Error:", error);
        if (error.reason) {
            console.error("Contract revert reason:", error.reason);
        }
    }
}

main();