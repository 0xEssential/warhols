import { Contract } from '@ethersproject/contracts';
import { MintableNonFungibleToken } from 'non-fungible-token-abi';
import React, { useContext, useState } from 'react';
import useSWR from 'swr';

import {
  abi,
  address as contractAddress,
} from '../../../contract/deployments/mainnet/Blitpops.json';
import { Web3Context } from '../../contexts/web3Context';
import Button from '../Button';
import styles from './styles.module.css';

const BlitmapContract = new Contract(process.env.BLITMAP_CONTRACT_ADDRESS, [
  ...MintableNonFungibleToken,
  'function tokenSvgDataOf(uint256 tokenId) public view returns (string memory)',
]);

const ERC721BatcherContract = new Contract(
  process.env.BATCHER_CONTRACT_ADDRESS,
  [
    'function getIds(address erc721Address, address user) public view returns(uint256[] memory)',
    'function getURIs(address erc721Address, address user) public view returns(string[] memory)',
  ],
);

const BlitpopContract = new Contract(contractAddress, abi);

export default function Blitmaps({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [_loading, setLoading] = useState(false);
  const { address, onboard, provider } = useContext(Web3Context);

  const { data } = useSWR(address ? 'owned' : null, {
    fetcher: async () => {
      setLoading(true);
      return new Promise<any[]>(async (resolve, _reject) => {
        const batcher = ERC721BatcherContract.connect(provider);
        const blitmap = BlitmapContract.connect(provider);
        const blitpop = BlitpopContract.connect(provider);

        const ids = await batcher.getIds(
          process.env.BLITMAP_CONTRACT_ADDRESS,
          address,
        );

        const blits: any[] = [];

        for (const id of ids) {
          const svgData = await blitmap.tokenSvgDataOf(id);

          // const blitpopOwner = await blitpop.ownerOf(id).catch(() => {
          //   return false;
          // });

          blits.push({ tokenId: id, svgData });
        }
        setLoading(false);
        resolve(blits);
      });
    },
  });

  if (!address) {
    return (
      <div className={styles.wallet}>
        <Button
          onClick={async () => {
            await onboard?.walletSelect();
            await onboard.walletCheck();
          }}
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <h1>Your Blitmaps</h1>
      <p>
        Minting is exclusive to Blitmap holders. Choose a Blitmap to mint a
        deriviative.
      </p>
      <div className={styles.blits}>
        {data?.map(({ tokenId, svgData }) => (
          <img
            onClick={() => {
              console.log(tokenId);
              onSelect(tokenId);
            }}
            key={tokenId}
            src={`data:image/svg+xml;base64,${btoa(svgData)}`}
          />
        ))}
      </div>
    </div>
  );
}
