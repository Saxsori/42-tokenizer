import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
	sepolia: {
		url: process.env.SEPOLIA_RPC_URL || "",
		accounts: process.env.PRIVATE_KEY_1 && process.env.PRIVATE_KEY_2 && process.env.PRIVATE_KEY_3 ? [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2, process.env.PRIVATE_KEY_3] : [],
	},
	// bsc testnet
	// bscTestnet: {
	// 	url: process.env.BSC_TESTNET_RPC_URL || "",
	// 	accounts:
	// 		process.env.PRIVATE_KEY_1 !== undefined || process.env.PRIVATE_KEY_2 !== undefined ? [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2] : [],
	// },
  },
    etherscan: {
		// apiKey: {
		// 	sepolia: process.env.ETHERSCAN_API_KEY || "",
		// 	// bscTestnet: process.env.BSCSCAN_API_KEY || "",
		// },
		apiKey: process.env.ETHERSCAN_API_KEY || "",
	}
};

export default config;
