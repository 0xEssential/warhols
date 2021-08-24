import { Contract } from '@ethersproject/contracts';
import React, { useContext, useState } from 'react';
import useSWR from 'swr';

import {
  abi,
  address as contractAddress,
} from '../../../contract/deployments/rinkeby/Blitpops.json';
import { Web3Context } from '../../contexts/web3Context';
import Button from '../Button';
import styles from './styles.module.css';

const BlitpopContract = new Contract(contractAddress, abi);

export default function Blitpops({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const { address, onboard, provider } = useContext(Web3Context);
  console.warn(address, 'ADDRESS');

  const { data } = useSWR(address ? 'ownedPops' : null, {
    fetcher: async () => {
      setLoading(true);

      return new Promise<any[]>(async (resolve, _reject) => {
        const contract = BlitpopContract.connect(provider);
        const count = await contract.balanceOf(address).catch(() => {
          return resolve([]);
        });

        const blits: any[] = [];

        for (let index = 0; index < count; index++) {
          const token = await contract.tokenOfOwnerByIndex(address, index);
          const tokenData = await contract.tokenURI(token);
          console.warn(tokenData);
          const json = atob(tokenData.substring(29));
          blits.push({ tokenID: token.toString(), ...JSON.parse(json) });
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
      <h1>Your Blitpops</h1>
      <p>Choose a Blitpop to update filters</p>
      <div className={styles.blits}>
        {data?.map(({ tokenId, image }) => (
          <img onClick={() => onSelect(tokenId)} key={tokenId} src={image} />
        ))}
      </div>
    </div>
  );
}
