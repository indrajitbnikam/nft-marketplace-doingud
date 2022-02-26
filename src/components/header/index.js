import Link from 'next/link';
import React from 'react';

const Header = () => {
  return (
    <nav className='h-20 border-b w-full'>
      <div className='h-full px-10 m-auto w-full max-w-[1400px] flex items-center justify-between'>
        <p className='text-2xl font-semibold'>Doingud Marketplace</p>
        <div className='flex items-center gap-12 text-indigo-700 text-lg font-semibold'>
          <Link href='/'>
            <a>Home</a>
          </Link>
          <Link href='/mint-nft'>
            <a>Mint New NFT</a>
          </Link>
          <Link href='/my-nft'>
            <a>My NFTs</a>
          </Link>
          <Link href='/dashboard'>
            <a>My Dashboard</a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
