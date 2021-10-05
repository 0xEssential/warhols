import { Contract } from '@ethersproject/contracts';
import { BigNumber, utils } from 'ethers';
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

export default function Mint({
  blitmapId,
  blitpopId,
}: {
  blitmapId: string;
  blitpopId: string;
}) {
  const { address, provider } = useContext(Web3Context);
  const [svg, setSvg] = useState<string>();
  console.warn(blitpopId);
  const reducer = (state, action) => {
    if (action.attribute === '*') {
      return action.value;
    }
    return {
      ...state,
      [action.attribute]: action.value,
    };
  };

  const id = blitpopId || blitmapId;

  const [filterState, dispatch] = useReducer(reducer, initialState);

  const fetchBlitpopSvg = async (_id, _filterState, provider) => {
    const Blitpop = BlitpopContract.connect(provider);

    const svg = await Blitpop.svgBase64Data(
      BigNumber.from(_id),
      ...Object.values(_filterState),
    );
    setSvg(svg);
  };

  const { data: filters } = useSWR(provider && id ? 'filters' : null, {
    fetcher: async () => {
      return new Promise<any[]>(async (resolve, _reject) => {
        const connected = BlitpopContract.connect(provider);
        const filters = await connected.listFilters();

        resolve(filters);
      });
    },
  });

  const { data: owner } = useSWR(provider && id ? 'owner' : null, {
    fetcher: async () => {
      if (!provider || !id) return;
      return new Promise<string>(async (resolve, _reject) => {
        const connected = BlitpopContract.connect(provider);
        const owner = await connected.ownerOf(BigNumber.from(id)).catch(() => {
          return _reject();
        });

        if (owner) {
          const uri = await connected.tokenURI(BigNumber.from(id));
          const json = parseDataUri(uri);
          const metadata = JSON.parse(json.data);
          setSvg(metadata.image);

          const { filter1, filter2, filter3 } = await connected.filtersFor(
            BigNumber.from(id),
          );

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
    if (!provider || !id) return;
    fetchBlitpopSvg(id, filterState, provider);
  }, [filterState, provider, blitmapId]);

  const mint = async () => {
    const connected = BlitpopContract.connect(provider.getSigner());
    connected.ownerMint(BigNumber.from(id), ...Object.values(filterState), {
      gasPrice: utils.parseUnits('100', 'gwei'),
    });
  };

  // const updateFilters = async () => {
  //   const connected = BlitpopContract.connect(provider.getSigner());
  //   connected.updateFilters(BigNumber.from(id), ...Object.values(filterState));
  // };

  if (!id) {
    return (
      <div className={styles.root}>
        <h1>Blitpop Minter</h1>
        <p>Choose a Blitmap to mint a Blitpop</p>
      </div>
    );
  }

  if (!address || !filters) {
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
      {!blitpopId && (
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
      )}
      {!owner && address === '0xc102f76973f4890cAB1b5d1ed26F3623381983aF' && (
        <Button style={{ width: '100%' }} onClick={mint}>
          Mint for 0.02 ETH
        </Button>
      )}
    </div>
  );
}
