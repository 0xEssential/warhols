import { Contract } from '@ethersproject/contracts';
import { MintableNonFungibleToken } from 'non-fungible-token-abi';
import React, { useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

import { Web3Context } from '../../contexts/web3Context';
import Button from '../Button';
import styles from './styles.module.css';

const BlitmapContract = new Contract(process.env.BLITMAP_CONTRACT_ADDRESS, [
  ...MintableNonFungibleToken,
  'function tokenSvgDataOf(uint256 tokenId) public view returns (string memory)',
]);

export default function Blitmaps({ onSelect }) {
  const [loading, setLoading] = useState(false);
  const { address, onboard, provider } = useContext(Web3Context);

  const { data } = useSWR(address ? 'owned' : null, {
    fetcher: async () => {
      setLoading(true);
      return new Promise<any[]>(async (resolve, _reject) => {
        const contract = BlitmapContract.connect(provider);
        const count = await contract.balanceOf(address).catch(() => {
          return resolve([]);
        });

        const blits: any[] = [];

        for (let index = 0; index < count; index++) {
          const token = await contract.tokenOfOwnerByIndex(address, index);
          const svgData = await contract.tokenSvgDataOf(token);

          blits.push({ tokenID: token.toString(), svgData });
        }
        setLoading(false);
        resolve([
          ...blits,
          ...blits,
          ...blits,
          ...blits,
          ...blits,
          ...blits,
          ...blits,
          ...blits,
          ...blits,
          ...blits,
        ]);
      });
    },
  });

  if (!address) {
    return (
      <Button
        onClick={async () => {
          await onboard.checkWallet();
          await onboard.connect();
        }}
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className={styles.root}>
      <h1>Your Blitmaps</h1>
      <p>Choose a Blitmap to mint a Blitpop</p>
      <div className={styles.blits}>
        {loading && <p>Loading</p>}
        {data?.map(({ tokenId, svgData }) => (
          <img
            onClick={onSelect}
            key={tokenId}
            src={`data:image/svg+xml;base64,${btoa(svgData)}`}
          />
        ))}
      </div>
    </div>
  );
}