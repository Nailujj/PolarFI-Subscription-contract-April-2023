// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import hre from "hardhat";


async function main(){

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const sub = await hre.ethers.getContractFactory("PolarSubscriptionV4");
  const contract = await sub.deploy();

  console.log("Sub deployed to address:", contract.address);
  
  const tUsdc = await hre.ethers.getContractFactory("USDC");
  const USDc = await tUsdc.deploy();

  await contract.deployed();
  await USDc.deployed();
  await contract.setTokenAddress(USDc.address);
  await contract.safeMint();
}




// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
