import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAsync } from '../../hooks/useAsync';
import './Footer.css';

export default function Footer() {
  const club = useAsync(() => api.club(), []);
  const links = useAsync(() => api.quickLinks(), []);

  const info = club.data;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__col site-footer__col--brand">
            <h4 className="site-footer__title">{info?.clubName ?? 'Aurelia FC'}</h4>
            <p className="site-footer__motto">&ldquo;{info?.motto ?? 'Rise. Unite. Conquer.'}&rdquo;</p>
            <p className="site-footer__body">
              {info?.description ??
                'Aurelia Football Club is a professional football club based in Aurelia. Founded in 1987, the club competes in the premier tier of sports excellence.'}
            </p>
          </div>

          <div className="site-footer__col">
            <h4 className="site-footer__title">{info?.stadiumName?.toUpperCase() ?? 'AURELIA ARENA'}</h4>
            <address className="site-footer__address">
              <span>Capacity: {(info?.capacity ?? 45000).toLocaleString('en-GB')} Seats</span>
              <span>Built: {info?.builtYear ?? 2003}</span>
              <span>Address: {info?.address ?? '100 Royal Way, Aurelia'}</span>
            </address>
          </div>

          <div className="site-footer__col">
            <h4 className="site-footer__title">QUICK LINKS</h4>
            <ul className="site-footer__links">
              {(links.data ?? []).map((link) => (
                <li key={link.href}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
              {links.data?.length === 0 && <li className="dim">No links available</li>}
            </ul>
          </div>

          <div className="site-footer__col">
            <h4 className="site-footer__title">GET IN TOUCH</h4>
            <address className="site-footer__address">
              <span>{info?.address ?? '100 Royal Way, Aurelia'}</span>
              <span>{info?.phone ?? '+44 (0) 20 8123 4567'}</span>
              <span>
                <a href="mailto:hello@aureliafc.com">hello@aureliafc.com</a>
              </span>
            </address>
          </div>
        </div>

        <div className="site-footer__bar">
          <p>© {new Date().getFullYear()} Aurelia Football Club. All Rights Reserved.</p>
          <p>Designed for Premium Performance.</p>
        </div>
      </div>
    </footer>
  );
}
