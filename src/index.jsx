import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { AppProvider } from './Context/AppContext';

ReactDOM.render(
  <React.StrictMode>
    <AppProvider>
      <App />
      <div className='app-background-mask' />
    </AppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
