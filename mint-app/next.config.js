module.exports = {
  reactStrictMode: true,
  target: 'experimental-serverless-trace',
  env: {
    RPC_URL: process.env.RPC_URL,
    CHAIN_ID: process.env.CHAIN_ID,
    INFURA_KEY: process.env.INFURA_KEY,
    BLITMAP_CONTRACT_ADDRESS: process.env.BLITMAP_CONTRACT_ADDRESS,
  },
};
