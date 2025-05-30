// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const EventBooking = await hre.ethers.getContractFactory("EventBooking");
  const eventBooking = await EventBooking.deploy();

  await eventBooking.waitForDeployment();

  console.log("EventBooking contract deployed to:",  await eventBooking.getAddress());

  //ajout de quelque evenements initiaux
  console.log("Creating initial events...");
  let tx;

  tx = await eventBooking.createEvent("Web3 Conf Paris", 100);
  await tx.wait(); // en attendant que la transaction soit minée
  console.log("evenement 'Web3 Conf Paris' created.");

  tx = await eventBooking.createEvent("Solidity Summit", 50);
  await tx.wait();
  console.log("Event 'Solidity Summit' created.");

  tx = await eventBooking.createEvent("NFT Expo", 2); 
  await tx.wait();
  console.log("evenement 'NFT Expo' created.");

  console.log("evenement initials créés avec succès.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });