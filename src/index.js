import 'react-app-polyfill/ie9'; // For IE 9-11 support
import 'react-app-polyfill/stable';
import 'core-js/es6/map';
import 'core-js/es6/set';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import crtoolSession from './crtoolSession';

// Initialize Token HERE instead of in React App.
crtoolSession.init();

ReactDOM.render(<App />, document.getElementById('react'));
