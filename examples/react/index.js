import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.js';

const rootNode = document.querySelector('#root');
rootNode && ReactDOM.render(<App />, rootNode);
