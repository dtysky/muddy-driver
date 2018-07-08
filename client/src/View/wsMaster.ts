/**
 * @File   : wsMaster.ts
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-8 10:50:40
 */
import config from '../config';

type TRoom = {
  id: number;
  alive: boolean;
  ready: {
    handlebar: boolean;
    wheel: boolean;
  }
};

class WSMaster {
  public handleControl: (data: {
    role: 'wheel' | 'handlebar',
    id: number,
    value: number
  }) => any = () => {};
  public handleRooms: (
    data: {
      1: TRoom;
      2: TRoom;
    }
  ) => any = () => {};

  private ws: WebSocket;

  public connect() {
    this.reconnect();
  }

  private reconnect() {
    const url = config.url;
    this.ws = new WebSocket(`ws://${url}/master`);

    this.ws.onopen = () => {
      console.log('open');
      this.ws.send(JSON.stringify({type: 'init'}));
    };

    this.ws.onmessage = (res) => {
      const data = JSON.parse(res.data);
      console.log(data);
      if (data.type === 'control') {
        this.handleControl(data.value);
      } else if ((data.type === 'rooms')) {
        this.handleRooms(data.value);
      }
    };

    this.ws.onclose = () => {
      console.log('close');
    };

    this.ws.onerror = (error) => {
      console.log(error);
    };
  }
}

export default new WSMaster();
