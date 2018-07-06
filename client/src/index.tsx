/**
 * @File   : index.tsx
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 00:25:02
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import * as es6ObjectAssign from 'es6-object-assign';

es6ObjectAssign.polyfill();

import App from './App';
import './base.scss';

const render = () => {
  ReactDOM.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById('container')
  );
};

declare const module: any;
if (module.hot) {
  module.hot.accept();
  render();
} else {
  render();
}
