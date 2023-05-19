import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import GlobalStyles from './components/global-styles/global-styles.jsx';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <GlobalStyles>
        <App />
      </GlobalStyles>
    </Router>
  </React.StrictMode>
);
