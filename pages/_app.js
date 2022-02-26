import BaseLayout from '../src/layouts/base';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <BaseLayout>
        <Component {...pageProps} />
      </BaseLayout>
    </>
  );
}

export default MyApp;
