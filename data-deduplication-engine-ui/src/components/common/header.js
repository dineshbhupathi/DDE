import { useEffect, useState } from 'react';
import statelogo from '../static/images/ssjpg.jpg';

export default function Header() {

    const [barVisibility, setBarVisibility] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const handleScroll = () => {
    const position = window.pageYOffset;
    position >= 120 ? setBarVisibility(true) : setBarVisibility(false);
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
    return (
        <div  id="navbar_top" className="navbar navbar-expand-lg navbar-dark nav-background-color fixed-top" role="navigation">
          <div className="navbar-header pull-left">
              {/* <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
              </button> */}
              <a className="navbar-left" href="/identify-duplicates"><img src={statelogo} className='navbar-logo' /></a>
              <label className="navbar-left nav-bar-app-name">Data Deduplication Engine</label>
          </div>
        </div>
 )
}