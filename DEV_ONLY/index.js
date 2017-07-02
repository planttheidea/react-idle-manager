// external dependencies
import React from 'react';
import {
  render
} from 'react-dom';

// app
import App from './App';

const div = document.createElement('div');

render((
  <App/>
), div);

document.body.appendChild(div);
