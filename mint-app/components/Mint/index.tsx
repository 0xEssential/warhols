import { Contract } from '@ethersproject/contracts';
import { InfuraProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import useSWR from 'swr';

import {
  abi,
  address as contractAddress,
} from '../../../contract/deployments/rinkeby/Blitpops.json';
import { Web3Context } from '../../contexts/web3Context';
import Button from '../Button';
import styles from './styles.module.css';

const BlitpopContract = new Contract(contractAddress, abi);

const initialState = {
  filter1: 'campbells',
  filter2: 'marilyn',
  filter3: 'electric-chair',
};

export default function Mint({ blitmapId }) {
  const { address, provider } = useContext(Web3Context);
  const [svg, setSvg] = useState<string>();

  const reducer = (state, action) => {
    console.warn(state, action);
    return {
      ...state,
      [action.attribute]: action.value,
    };
  };

  const [filterState, dispatch] = useReducer(reducer, initialState);
  console.warn('FS', filterState);
  const fetchBlitpopSvg = async (id, _filterState, provider) => {
    const Blitpop = BlitpopContract.connect(provider);
    console.warn(...Object.values(_filterState));
    const svg = await Blitpop.svgBase64Data(id, ...Object.values(_filterState));
    console.warn(svg);
    setSvg(svg);
  };

  const { data: filters } = useSWR(provider ? 'filters' : null, {
    fetcher: async () => {
      if (!provider) return;
      return new Promise<any[]>(async (resolve, _reject) => {
        const jsonProvider = new InfuraProvider(
          'rinkeby',
          process.env.INFURA_API_KEY,
        );
        const connected = BlitpopContract.connect(jsonProvider);
        const filters = await connected.listFilters();
        resolve(filters);
      });
    },
  });

  const { data: owner } = useSWR(provider ? 'owner' : null, {
    fetcher: async () => {
      if (!provider) return;
      return new Promise<string>(async (resolve, _reject) => {
        const connected = BlitpopContract.connect(provider);
        const owner = await connected.ownerOf(BigNumber.from(blitmapId));
        resolve(owner.toLowerCase());
      });
    },
  });
  console.warn('owner', owner);
  const options = filters?.map((f, index) => (
    <option key={index} value={f}>
      {f}
    </option>
  ));

  useEffect(() => {
    if (!provider) return;
    fetchBlitpopSvg(blitmapId, filterState, provider);
  }, [filterState, provider]);

  const mint = async () => {
    const connected = BlitpopContract.connect(provider.getSigner());
    connected.ownerMint('100', ...Object.values(filterState));
  };

  const updateFilters = async () => {
    const connected = BlitpopContract.connect(provider.getSigner());
    connected.updateFilters('100', ...Object.values(filterState));
  };
  console.warn(owner, address);
  return (
    <div className={styles.root}>
      <h1>Blitpop Minter</h1>
      {svg && <img src={svg} />}
      <form className={styles.form}>
        <label>
          TOP RIGHT
          <select
            value={filterState.filter1}
            onChange={(e) =>
              dispatch({ attribute: 'filter1', value: e.target.value })
            }
          >
            {options}
          </select>
        </label>

        <label>
          BOTTOM LEFT
          <select
            value={filterState.filter2}
            onChange={(e) =>
              dispatch({ attribute: 'filter2', value: e.target.value })
            }
          >
            {options}
          </select>
        </label>

        <label>
          BOTTOM RIGHT
          <select
            value={filterState.filter3}
            onChange={(e) =>
              dispatch({ attribute: 'filter3', value: e.target.value })
            }
          >
            {options}
          </select>
        </label>
      </form>
      {owner ? (
        owner === address && (
          <Button style={{ width: '100%' }} onClick={updateFilters}>
            Update Filters
          </Button>
        )
      ) : (
        <Button style={{ width: '100%' }} onClick={mint}>
          Mint for 0.02 ETH
        </Button>
      )}
    </div>
  );
}
