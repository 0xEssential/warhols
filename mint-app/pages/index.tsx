import React, { useContext, useState } from 'react';

import Blitpops from '../components/Blitpops';
import Mint from '../components/Mint';
import { Web3Context } from '../contexts/web3Context';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { address } = useContext(Web3Context);
  const [blitmapId, setBlitmapId] = useState<string>();
  const [blitpopId, setBlitpopId] = useState<string>();

  return (
    <div className={styles.container}>
      <div className={styles.headline}>
        <h1 className={styles.title}>BlitPop</h1>
        <p>onchain pop art Blitmap derivatives</p>
        <p>
          <small>
            minting is complete - stay tuned for the next phase of the project!
          </small>
        </p>
      </div>
      <div className={styles.article}>
        <div className={styles.mintRow}>
          <div className={styles.blitColumn}>
            <h3>Enter Blitmap Token ID</h3>
            <input onChange={(e) => setBlitmapId(e.target.value)} />
            <Blitpops onSelect={setBlitpopId} />
          </div>
          <Mint blitmapId={blitmapId} blitpopId={blitpopId} />
        </div>
      </div>
      <div className={styles.footer}>
        <p>
          <a
            href="https://etherscan.io/address/0xF9BddDBa8011262382182CdFA7c92327afF15279"
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
