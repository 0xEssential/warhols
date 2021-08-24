import { Contract } from '@ethersproject/contracts';
import { MintableNonFungibleToken } from 'non-fungible-token-abi';
import React, { useContext, useState } from 'react';
import useSWR from 'swr';

import { Web3Context } from '../../contexts/web3Context';
import Button from '../Button';
import styles from './styles.module.css';

const BlitmapContract = new Contract(process.env.BLITMAP_CONTRACT_ADDRESS, [
  ...MintableNonFungibleToken,
  'function tokenSvgDataOf(uint256 tokenId) public view returns (string memory)',
]);

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
            onClick={() => onSelect(tokenId)}
            key={tokenId}
            src={`data:image/svg+xml;base64,${btoa(svgData)}`}
          />
        ))}
      </div>
    </div>
  );
}
