import Image from 'next/image';
import React from 'react';

const NoData = ({ message = 'No data found!' }) => {
  return (
    <div className='grid place-content-center'>
      <div className='flex flex-col items-center'>
        <Image
          src='/images/no-data.svg'
          height={400}
          width={800}
          alt='No data'
        />
        <p className='text-indigo-600 text-4xl mt-8'>{message}</p>
      </div>
    </div>
  );
};

export default NoData;
