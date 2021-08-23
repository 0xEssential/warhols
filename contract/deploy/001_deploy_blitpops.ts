import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} = await getNamedAccounts();

  await deploy('Blitpops', {
    from: deployer,
    args: ['0xf6A56f5B9cff7f84320C85C71Cac94092d3CD424'],
    log: true,
  });
};
export default func;
func.tags = ['Blitpops'];
