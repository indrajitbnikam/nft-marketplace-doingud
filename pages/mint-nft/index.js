import { ethers } from 'ethers';
import { useState } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Web3Modal from 'web3modal';
import { marketAddress, nftAddress } from '../../src/config';

// ABIs
import NFT from '../../artifacts/contracts/NFT.sol/MyNFT.json';
import NFTMarket from '../../artifacts/contracts/NFTMarket.sol/MyNFTMarket.json';
import Modal from '../../src/components/loader-modal';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

export default function MintNFT() {
  const [processingMinting, setProcessingMinting] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: '',
    name: '',
    description: '',
  });
  const router = useRouter();

  const onChange = async (e) => {
    const file = e.target.files[0];
    try {
      const uploadedFile = await client.add(file, {
        progress: (progress) => console.log(`Processing: ${progress}%`),
      });

      const url = `https://ipfs.infura.io/ipfs/${uploadedFile.path}`;
      setFileUrl(url);
    } catch (error) {
      console.error(error.message);
    }
  };

  const mintNFT = async () => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    setProcessingMinting(true);
    try {
      const uploadedNFTData = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${uploadedNFTData.path}`;

      await createSale(url);
    } catch (error) {
      console.error(error.message);
    } finally {
      setProcessingMinting(false);
    }
  };

  const createSale = async (url) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await nftContract.createToken(url);
    let tx = await transaction.wait();

    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, 'ether');

    const marketContract = new ethers.Contract(
      marketAddress,
      NFTMarket.abi,
      signer
    );
    let listingPrice = await marketContract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await marketContract.createMarketItem(
      nftAddress,
      tokenId,
      price,
      { value: listingPrice }
    );
    await transaction.wait();
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Mint new NFT</title>
        <meta
          name='description'
          content='Sample ERC721 based NFT marketplace'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='flex justify-center'>
        <div className='w-1/2 flex flex-col gap-8'>
          <input
            placeholder='Name'
            className='border rounded p-4'
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <textarea
            placeholder='Description'
            className='border rounded p-4'
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
          />
          <input
            placeholder='Price in ETH'
            className='border rounded p-4'
            onChange={(e) =>
              updateFormInput({ ...formInput, price: e.target.value })
            }
          />
          <input type='file' name='Asset' onChange={onChange} />
          {fileUrl && (
            <img className='rounded mt-4' width='350' src={fileUrl} />
          )}
          <button
            className='font-bold bg-purple-600 text-white rounded p-4 shadow-md'
            onClick={mintNFT}
          >
            Mint 🚀
          </button>
        </div>
      </div>

      {processingMinting && (
        <Modal
          title='Minting New NFT'
          loading={true}
          description='You will be prompted to authorize 2 transactions.'
        />
      )}
    </>
  );
}
