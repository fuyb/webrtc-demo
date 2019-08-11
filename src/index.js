import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';
import App from './App.jsx';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.body);
serviceWorker.unregister();
