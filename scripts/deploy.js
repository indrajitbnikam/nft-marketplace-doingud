const hre = require('hardhat');

async function main() {
  const Market = await ethers.getContractFactory('MyNFTMarket');
  const market = await Market.deploy();
  await market.deployed();
  const marketAddress = market.address;

  const NFT = await ethers.getContractFactory('MyNFT');
  const nft = await NFT.deploy(marketAddress);
  await nft.deployed();
  const nftAddress = nft.address;

  console.log('nftAddress :', nftAddress);
  console.log('marketAddress :', marketAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
