import React, { useContext, useState } from 'react';

import Blitmaps from '../components/Blitmaps';
import Blitpops from '../components/Blitpops';
import Mint from '../components/Mint';
import { Web3Context } from '../contexts/web3Context';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { address } = useContext(Web3Context);
  const [blitmapId, setBlitmapId] = useState<string>();
  return (
    <div className={styles.container}>
      <div className={styles.headline}>
        <h1 className={styles.title}>BlitPop</h1>
        <p>onchain pop art Blitmap derivatives</p>
      </div>
      <div className={styles.article}>
        <div className={styles.mintRow}>
          <div className={styles.blitColumn}>
            <Blitmaps onSelect={setBlitmapId} />
            <Blitpops onSelect={setBlitmapId} />
          </div>
          {address && <Mint blitmapId={blitmapId} />}
        </div>
      </div>
      <div className={styles.footer}>
        <p>
          <a
            href="https://etherscan.io/address/fair-drop"
            target="_blank"
            rel="noreferrer"
          >
            Etherscan
          </a>{' '}
          •{' '}
          <a href="https://opensea.io/blitpop" target="_blank" rel="noreferrer">
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
