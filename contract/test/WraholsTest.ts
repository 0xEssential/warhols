import chai, {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts} from 'hardhat';
import {setupUser, setupUsers } from './utils';
import {BigNumber, Contract} from 'ethers';
import {getAddress, parseEther} from 'ethers/lib/utils';
import open from 'open';
import {deployMockContract} from '@ethereum-waffle/mock-contract';

describe.only('Warhols', function () {
  describe('SVGs', function () {
    const setup = deployments.createFixture(async () => {
      const BlitmapMock = await ethers.getContractFactory(
        'MockBlitmap'
      );

      const Blitmap = await BlitmapMock.deploy();

      const WarholsContract = await ethers.getContractFactory(
        'Warhols'
      );

      const Warhols = await WarholsContract.deploy(
        Blitmap.address
      );

      const [_owner] = await ethers.getSigners();
      const owner = await setupUser(_owner.address, {Blitmap, Warhols});


      const mint = await owner.Warhols.ownerMint(1, { value: parseEther('0.02')});

      await mint.wait();

      return {  owner, Warhols };
    });

    let fixtures: any;

    describe.only('Onchain Wrasslers', function () {
      before(async () => {
        fixtures = await setup();
      });

      it('does onchain svg', async () => {
        const {
          Warhols,
        } = fixtures;

        const metadata = await Warhols.tokenURI(1);
        console.warn(metadata);
        // await open(metadata, { app: { name: 'google chrome'}});
      });
    });
  });
});
