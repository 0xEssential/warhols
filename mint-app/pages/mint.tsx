import Head from 'next/head';
import React, { useState } from 'react';

import Button from '../components/Button';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h2>Your Blitmaps</h2>
      </main>
    </div>
  );
}
