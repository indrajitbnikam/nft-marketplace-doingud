import axios from 'axios';
import { ethers } from 'ethers';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';

// ABIs
import NFT from '../../artifacts/contracts/NFT.sol/MyNFT.json';
import NFTMarket from '../../artifacts/contracts/NFTMarket.sol/MyNFTMarket.json';
import NoData from '../../src/components/no-data';
import { marketAddress, nftAddress } from '../../src/config';

export default function Dashboard() {
  const [createdNfts, setCreatedNfts] = useState([]);
  const [soldNfts, setSoldNfts] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState('not-loaded');

  useEffect(() => {
    loadNFT();
  }, []);

  const loadNFT = async () => {
    setLoadingStatus('loading');

    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(nftAddress, NFT.abi, signer);
    const marketContract = new ethers.Contract(
      marketAddress,
      NFTMarket.abi,
      signer
    );
    const createdItemsData = await marketContract.fetchCreatedItems();

    const createdItems = await Promise.all(
      createdItemsData.map(async (i) => {
        const tokenUri = await nftContract.tokenURI(i.tokenId);
        const metaData = await axios.get(tokenUri);
        const price = ethers.utils.formatUnits(i.price.toString(), 'ether');

        const item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          name: metaData.data.name,
          description: metaData.data.description,
          image: metaData.data.image,
        };

        return item;
      })
    );

    const soldItems = createdItems.filter((i) => i.sold);

    setCreatedNfts(createdItems);
    setSoldNfts(soldItems);
    setLoadingStatus('loaded');
  };

  const renderNFTs = () => {
    if (loadingStatus === 'loading') {
      return <div>Loading...</div>;
    }

    if (loadingStatus === 'loaded' && createdNfts.length === 0) {
      return (
        <div className='w-full'>
          <NoData message='You have not minted any NFT.' />
        </div>
      );
    }

    return (
      <>
        <p className='mb-8 text-2xl font-semibold'>Created NFTs</p>
        {createdNfts.length && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {createdNfts.map((nft) => (
              <div
                key={nft.tokenId}
                className='flex flex-col border shadow rounded-xl overflow-hidden'
              >
                <img src={nft.image} />
                <div className='p-4 flex flex-col gap-4'>
                  <p className='h-8 text-2xl font-semibold'>{nft.name}</p>
                  <p className='line-clamp-2'>{nft.description}</p>
                  <p className='text-xl font-semibold'>{nft.price} ETH</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className='mt-16 mb-8 text-2xl font-semibold'>Sold NFTs</p>
        {soldNfts.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {soldNfts.map((nft) => (
              <div
                key={nft.tokenId}
                className='flex flex-col border shadow rounded-xl overflow-hidden'
              >
                <img src={nft.image} />
                <div className='p-4 flex flex-col gap-4'>
                  <p className='h-8 text-2xl font-semibold'>{nft.name}</p>
                  <p className='line-clamp-2'>{nft.description}</p>
                  <p className='text-xl font-semibold'>{nft.price} ETH</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='w-full'>
            <NoData message='You have not sold any NFT so far.' />
          </div>
        )}
      </>
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
    </>
  );
}
