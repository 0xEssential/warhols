import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} = await getNamedAccounts();

  await deploy('Blitpops', {
    from: deployer,
    args: ['0x8d04a8c79cEB0889Bdd12acdF3Fa9D207eD3Ff63'],
    log: true,
  });
};
export default func;
func.tags = ['Blitpops'];
