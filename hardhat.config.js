require('@nomiclabs/hardhat-waffle');
const fs = require('fs');

const privateKey = fs.readFileSync('.secret').toString();
const projectId = 'e5f02c6803804b56a3d0220ccb67a881';

module.exports = {
  solidity: '0.8.4',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${projectId}`,
      accounts: [privateKey],
    },
  },
};
