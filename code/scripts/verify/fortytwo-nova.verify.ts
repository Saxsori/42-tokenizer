// docker run --rm -it -v "$PWD":/app -w /app --env-file .env node:20-bullseye   npx hardhat verify --network sepolia 0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423   1000000000000000000000000 42000000000000000000000000
import { run } from "hardhat";

async function main() {
	await run("verify:verify", {
		address: "0x8d7d63ab0B9Dbe1fCD6D0b3ae57c96Ea0728C423",
		constructorArguments: [
			"1000000000000000000000000",
			"42000000000000000000000000",
		],
	});
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});