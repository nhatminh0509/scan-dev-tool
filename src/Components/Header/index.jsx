import React from 'react';
import { useContext } from 'react';
// import { Link } from 'react-router-dom';
import AppContext from '../../Context/AppContext';
import './style.scss'
import logo from '../../static/images/2Nlogo.png'
import logoTrans from '../../static/images/2Nlogo-trans.png'
import icDarkMode from '../../static/images/icon/moon.png'
import icLightMode from '../../static/images/icon/sun.png'

const Header = () => {
  const [app, updater] = useContext(AppContext)
  const { toggleDarkMode } = updater
  const { isDarkMode } = app
  return (
    <div className='header-container'>
      <div className='wrapper'>
        <div className='left-side'>
          {/* <Link to='/'><img className='logo' src={isDarkMode ? logo : logoTrans} alt='logo' /></Link> */}
        </div>
        <div className='middle link-wrapper'>
          {/* <Link className='link-item' to='/'>Home</Link>
          <Link className='link-item' to='/approve'>Approve</Link>
          <Link className='link-item' to='/setting'>Settings</Link> */}
        </div>
        <div className='right-side'>
          {!isDarkMode ? <img onClick={toggleDarkMode} width={30} alt='dark-mode' src={icDarkMode}/>
          : <img onClick={toggleDarkMode} width={30} alt='light-mode' src={icLightMode} />}
        </div>
      </div>
    </div>
  );
};

export default Header;
