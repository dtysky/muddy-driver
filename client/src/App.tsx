/**
 * @File   : App.tsx
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 00:37:29
 */
import * as React from 'react';
import {
  Route, Switch, withRouter, RouteComponentProps, Redirect
} from 'react-router-dom';

import Controller from './Controller';
import View from './View';

interface IPropTypes extends RouteComponentProps<{}> {

}

interface IStateTypes {

}

class App extends React.Component<IPropTypes, IStateTypes> {
  public render() {
    return (
      <Switch>
        <Route path={'/player/:roomId'} component={Controller} />
        <Route path={'/view'} component={View} />
      </Switch>
    );
  }
}

export default withRouter(App);
