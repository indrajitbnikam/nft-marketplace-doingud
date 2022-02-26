import Head from 'next/head';
import { useEffect, useState } from 'react';

// External libs
import axios from 'axios';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

// ABIs
import NFT from '../artifacts/contracts/NFT.sol/MyNFT.json';
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/MyNFTMarket.json';

// Config
import { marketAddress, nftAddress } from '../src/config';
import NoData from '../src/components/no-data';
import Modal from '../src/components/loader-modal';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState('not-loaded');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    setLoadingStatus('loading');

    const provider = new ethers.providers.JsonRpcProvider(
      'https://rinkeby.infura.io/v3/e5f02c6803804b56a3d0220ccb67a881'
    );
    const nftContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      marketAddress,
      NFTMarket.abi,
      provider
    );

    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await nftContract.tokenURI(i.tokenId);
        const metaData = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');

        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: metaData.data.image,
          name: metaData.data.name,
          description: metaData.data.description,
        };

        return item;
      })
    );

    setNfts(items);
    setLoadingStatus('loaded');
  };

  const buyNFT = async (nft) => {
    setPurchasing(true);
    try {
      const web3modal = new Web3Modal();
      const connection = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);

      const signer = provider.getSigner();
      const marketContract = new ethers.Contract(
        marketAddress,
        NFTMarket.abi,
        signer
      );

      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
      const transaction = await marketContract.createMarketSale(
        nftAddress,
        nft.tokenId,
        {
          value: price,
        }
      );

      await transaction.wait();
      loadNFTs();
    } catch (error) {
      console.error(error);
    } finally {
      setPurchasing(false);
    }
  };

  const renderNFTs = () => {
    if (loadingStatus === 'loading') {
      return <div>Loading...</div>;
    }

    if (loadingStatus === 'loaded' && nfts.length === 0) {
      return (
        <div className='w-full'>
          <NoData message='Nothing on sale at the moment.' />
        </div>
      );
    }

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {nfts.map((nft) => (
          <>
            <div
              key={nft.tokenId}
              className='flex flex-col border shadow rounded-xl overflow-hidden'
            >
              <img src={nft.image} style={{ maxHeight: '300px' }} />
              <div className='p-4 flex flex-col gap-4'>
                <p className='h-8 text-2xl font-semibold'>{nft.name}</p>
                <p className='line-clamp-2'>{nft.description}</p>
                <button
                  onClick={() => buyNFT(nft)}
                  className='text-white font-bold bg-indigo-700 p-4 rounded '
                >
                  Buy @ {nft.price} ETH
                </button>
              </div>
            </div>
          </>
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>NFT Marketplace Doingud</title>
        <meta
          name='description'
          content='Sample ERC721 based NFT marketplace'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {renderNFTs()}

      {purchasing && (
        <Modal
          title='Purchasing NFT'
          loading={true}
          description='You will be prompted to authorize 1 transactions.'
        />
      )}
    </>
  );
}
