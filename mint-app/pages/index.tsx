import Head from 'next/head';
import React, { useState } from 'react';

import Blitmaps from '../components/Blitmaps';
import Button from '../components/Button';
import Mint from '../components/Mint';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [blitmapId, setBlitmapId] = useState<string>();
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>BlitPop</h1>

            <p className={styles.description}>On-chain Blitmap derivatives</p>

            <p>
              <a
                href="https://github.com/0xessential/fair-drop"
                target="_blank"
                rel="noreferrer"
              >
                Etherscan
              </a>{' '}
              •{' '}
              <a
                href="https://github.com/0xessential/fair-drop"
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
              </a>{' '}
            </p>
          </div>
          <div className={styles.buttonContainer}>
            <img src="/burger.png" style={{ width: 180 }} />{' '}
          </div>
        </div>
        <div className={styles.article}>
          <h1>Intro</h1>
          <p>
            <strong>Blitpops</strong> are a collection of NFT artworks derived
            from the Blitmap project. Each Blitpop is based on the Blitmap with
            the corresponding token ID. Blitpops are inspired by Andy
            Warhol&apos;s pop art collages of Campbell&apos;s Soup and Marilyn
            Monroe, as well as Warhol&apos;s general attitudes towards art and
            business.
          </p>

          <p>
            The Blitpop contract reads the onchain image data for a Blitmap,
            arranges the original artwork into a 2x2 collage, and applies a
            filter to three of the quadrants, leaving the original Blitmap art
            in the top left. Blitpops are also co-created by their minter and
            can be changed by their owner at any time. The project includes
            numerous filters that can be chosen and applied to quadrants, and we
            will also add more filters as the project goes on, meaning your
            Blitpops are never finished!
          </p>
          <p>Blitpops are created by @sammybauch</p>

          <h1>Minting</h1>
          <p>
            For the first 7 days of the project minting is restricted to the
            owner of the corresponding Blitmap. Minting for these owners costs{' '}
            <strong>0.02 ETH</strong>. The contract is written so that minters
            can edit the chosen filters and see what their artwork will look
            like without minting.
          </p>
          <p>
            After 7 days, any remaining Blitpops can be minted by the general
            public for <strong>0.2 ETH</strong>.
          </p>
          <div className={styles.mintRow}>
            <Blitmaps onSelect={setBlitmapId} />
            <Mint blitmapId="100" />
          </div>
        </div>
      </main>
    </div>
  );
}
