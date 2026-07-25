import { run } from "hardhat";

async function main() {
	await run("verify:verify", {
		address: "0x504207973E4d2733c8244A71AAbe1585230E3737",
		constructorArguments: [
			["0xecBC78bDb203D1F168Ffc2701249f78664Fa7e19", "0x62A2283160d4c3aCd66190053aD7377b265379a3", "0x46A6688d9eeFD490f4826d2328088Acd18C52ff0"],
			2,
		],
	});
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});