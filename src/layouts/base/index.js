import React from 'react';
import Header from '../../components/header';

const BaseLayout = ({ children }) => {
  return (
    <>
      <Header />
      <div className='py-8 px-10 m-auto w-full max-w-[1400px]'>{children}</div>
    </>
  );
};

export default BaseLayout;
