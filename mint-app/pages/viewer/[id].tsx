import { Contract } from '@ethersproject/contracts';
import { useRouter } from 'next/dist/client/router';
import parseDataUri from 'parse-data-uri';
import React, { useContext } from 'react';
import useSWR from 'swr';

import {
  abi,
  address as contractAddress,
} from '../../../contract/deployments/mainnet/Blitpops.json';
import { Web3Context } from '../../contexts/web3Context';
import styles from '../../styles/Home.module.css';

const BlitpopContract = new Contract(contractAddress, abi);

export default function Home() {
  const { address, provider } = useContext(Web3Context);
  const route = useRouter();
  console.warn(route.query);

  const { data } = useSWR(address ? `pop/${route.query.id}` : null, {
    fetcher: async () => {
      // setLoading(true);

      return new Promise<Record<string, string>>(async (resolve, _reject) => {
        const contract = BlitpopContract.connect(provider);
        const gas = await provider.estimateGas(
          contract.tokenURI(route.query.id),
        );
        console.warn(gas.toString());
        const tokenData = await contract.tokenURI(route.query.id);
        const json = parseDataUri(tokenData);

        // setLoading(false);
        resolve(JSON.parse(json.data));
      });
    },
  });

  return (
    <div
      className={styles.container}
      style={{
        background: 'var(--light-blue)',
      }}
    >
      <div
        className={styles.article}
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h1 className={styles.title}>BlitPop</h1>

        <img style={{ maxWidth: 480, margin: '24px 0' }} src={data?.image} />
      </div>

      <div className={styles.footer}>
        <p>
          <a
            href="https://etherscan.io/address/0x036bc4Bc220B2d1b364D7f1bA2F31732B72322A6"
            target="_blank"
            rel="noreferrer"
          >
            Etherscan
          </a>{' '}
          •{' '}
          <a
            href="https://opensea.io/collection/blitpop"
            target="_blank"
            rel="noreferrer"
          >
            OpenSea
          </a>{' '}
          •{' '}
          <a
            href="https://discord.gg/4K5EwWgCMn"
            target="_blank"
            rel="noreferrer"
          >
            Discord
          </a>
        </p>
      </div>
      <div className={styles.footer}>
        <p>
          a{' '}
          <a href="https://0xessential.com" target="_blank" rel="noreferrer">
            0xEssential
          </a>{' '}
          joint
        </p>
      </div>
    </div>
  );
}
