import { createVlayerClient } from "@vlayer/sdk";
import averageBalanceOfAbi from "./averageBalanceOf.abi.json" assert { type: "json" };

// Create vlayer server client
const vlayer = createVlayerClient({url:"https://test-prover.vlayer.xyz"});

const hash = await vlayer.prove({
  address: "0x1284786a8b79d1d2cd4ca7cd4dfd8a441b8ce820", // Address as string
  proverAbi: averageBalanceOfAbi.abi,
  functionName: "averageBalanceOf",
  args: [tokenOwner],
  chainId: 84532,
});

const result = await vlayer.waitForProvingResult(hash);
console.log(result);

// verfier contract address: 0x92410d28eadd7ffe0e6ca8cd39d81f3022ec9141