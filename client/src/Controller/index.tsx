/**
 * @File   : index.tsx
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 14:45:30
 */
import * as React from 'react';
import {
  Route, Switch, withRouter, RouteComponentProps, Redirect
} from 'react-router-dom';
import axios from 'axios';

import HandleBar from './handlebar';
import Pedal from './pedal';

interface IPropTypes extends RouteComponentProps<{roomId}> {

}

interface IStateTypes {

}

class Controller extends React.Component<IPropTypes, IStateTypes> {
  private ws;
  public state = {
    role: null
  };
  public async componentDidMount() {
    const roomId = this.props.match.params.roomId;
    const url = '192.168.43.102:4444';
    const roomRes = (await axios.get<{
      code: number,
      message: string,
      data?: {
        role: string
      }
    }>(`http://${url}/player/join/${roomId}`)).data;
    if (roomRes.code) {
      alert(roomRes.message);
      return;
    }
    const role = roomRes.data.role;

    this.ws = new WebSocket(`ws://${url}/room/${roomId}/${role}`);
    this.ws.onopen = () => {
      console.log('connected');
      this.ws.send(JSON.stringify({type: 'init'}));
      this.setState({
        role
      });
    };
    this.ws.onmessage = (data) => {
      // console.log(data);
    };
  }
  public render() {
    if (this.state.role === 'handlebar') {
      return <HandleBar onChange={(pitch) => {
        this.ws.send(JSON.stringify({type: 'value', value: pitch}));
      }}/>;
    } else if (this.state.role === 'wheel') {
      return <Pedal onChange={(velocity) => {
        this.ws.send(JSON.stringify({type: 'value', value: velocity}));
      }}/>;
    } else {
      return null;
    }
  }
}

export default withRouter(Controller);
