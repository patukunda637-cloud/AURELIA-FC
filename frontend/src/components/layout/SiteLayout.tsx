import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Partners from './Partners';

/** Chrome shared by every public-facing screen: header, main, partners, footer. */
export default function SiteLayout() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Partners />
      <Footer />
    </>
  );
}
