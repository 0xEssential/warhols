import { Contract } from '@ethersproject/contracts';
import { BigNumber } from 'ethers';
import parseDataUri from 'parse-data-uri';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import useSWR from 'swr';

import {
  abi,
  address as contractAddress,
} from '../../../contract/deployments/mainnet/Blitpops.json';
import { Web3Context } from '../../contexts/web3Context';
import Button from '../Button';
import styles from './styles.module.css';

const BlitpopContract = new Contract(contractAddress, abi);

const initialState = {
  filter1: 'og',
  filter2: 'og',
  filter3: 'og',
};

export default function Mint({ blitmapId }: { blitmapId: string }) {
  console.warn(blitmapId);
  const { address, provider } = useContext(Web3Context);
  const [svg, setSvg] = useState<string>();

  const reducer = (state, action) => {
    if (action.attribute === '*') {
      return action.value;
    }
    return {
      ...state,
      [action.attribute]: action.value,
    };
  };

  const [filterState, dispatch] = useReducer(reducer, initialState);

  const fetchBlitpopSvg = async (id, _filterState, provider) => {
    const Blitpop = BlitpopContract.connect(provider);
    console.warn(BigNumber.from(id), ...Object.values(_filterState));
    const svg = await Blitpop.svgBase64Data(
      BigNumber.from(id),
      ...Object.values(_filterState),
    );
    setSvg(svg);
  };

  const { data: filters } = useSWR(provider ? 'filters' : null, {
    fetcher: async () => {
      if (!provider || !blitmapId) return;
      return new Promise<any[]>(async (resolve, _reject) => {
        const connected = BlitpopContract.connect(provider);
        const filters = await connected.listFilters();
        resolve(filters);
      });
    },
  });

  const { data: owner } = useSWR(provider ? 'owner' : null, {
    fetcher: async () => {
      if (!provider || !blitmapId) return;
      return new Promise<string>(async (resolve, _reject) => {
        const connected = BlitpopContract.connect(provider);
        const owner = await connected
          .ownerOf(BigNumber.from(blitmapId))
          .catch(() => {
            return _reject();
          });

        if (owner) {
          const uri = await connected.tokenURI(BigNumber.from(blitmapId));
          const json = parseDataUri(uri);
          const metadata = JSON.parse(json.data);
          setSvg(metadata.image);

          const { filter1, filter2, filter3 } = await connected.filtersFor(
            BigNumber.from(blitmapId),
          );
          console.warn(filters);
          dispatch({ attribute: '*', value: { filter1, filter2, filter3 } });
        }

        resolve(owner?.toLowerCase());
      });
    },
    revalidateOnFocus: false,
  });

  const options = filters?.map((f, index) => (
    <option key={index} value={f}>
      {f}
    </option>
  ));

  useEffect(() => {
    if (!provider || !blitmapId) return;
    fetchBlitpopSvg(blitmapId, filterState, provider);
  }, [filterState, provider, blitmapId]);

  const mint = async () => {
    const connected = BlitpopContract.connect(provider.getSigner());
    connected.ownerMint(
      BigNumber.from(blitmapId),
      ...Object.values(filterState),
    );
  };

  const updateFilters = async () => {
    const connected = BlitpopContract.connect(provider.getSigner());
    connected.updateFilters(
      BigNumber.from(blitmapId),
      ...Object.values(filterState),
    );
  };

  if (!blitmapId) {
    return (
      <div className={styles.root}>
        <h1>Blitpop Minter</h1>
        <p>Choose a Blitmap to mint a Blitpop</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className={styles.root}>
        <h1>Blitpop Minter</h1>
      </div>
    );
  }

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
