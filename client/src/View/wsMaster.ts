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
  public controlHandlers: ((data: {
    role: 'wheel' | 'handlebar',
    id: number,
    value: number
  }) => any)[] = [];
  public handleRooms: (
    data: {
      1: TRoom;
      2: TRoom;
    }
  ) => any = () => {};

  private ws: WebSocket;

  constructor() {
    const url = config.url;
    this.ws = new WebSocket(`ws://${url}/master`);

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({type: 'init'}));
    };

    this.ws.onmessage = (res) => {
      const data = JSON.parse(res.data);
      if (data.type === 'control') {
        this.controlHandlers.forEach(i => i(data.value));
      } else {
        this.handleRooms(data.value);
      }
    };
  }
}

export default new WSMaster();
