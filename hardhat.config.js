import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-ethers-chai-matchers';
import 'dotenv/config';

const networks = {
  hardhat: {
    type: 'edr-simulated'
  }
};

if (process.env.SEPOLIA_RPC) {
  networks.sepolia = {
    type: 'http',
    url: process.env.SEPOLIA_RPC,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
  };
}

if (process.env.MUMBAI_RPC) {
  networks.mumbai = {
    type: 'http',
    url: process.env.MUMBAI_RPC,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
  };
}

export default {
  solidity: '0.8.30',
  networks
};
