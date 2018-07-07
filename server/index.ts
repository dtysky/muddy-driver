/**
 * @File   : index.ts
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 00:24:56
 */
import * as Express from 'express';
import * as ExpressWS from 'express-ws';
import * as WS from 'ws';

const app = Express() as (Express.Express & {
  ws: (string, cb: (ws: WS, req: Express.Request) => any) => any
});

ExpressWS(app);

type TRoom = {
  id: number;
  alive: boolean;
  ready: {
    handlebar: boolean;
    wheel: boolean;
  }
};

const rooms: {
  [id: number]: TRoom
} = {};

app.get('/test', (req, res) => {
  res.send('Hello');
});

app.ws('/ws-test', (ws, req) => {
  ws.on('message', (data) => {
    console.log(data);
    ws.send('蛤蛤');
  });

  ws.on('close', () => {
    console.log('close');
  });
});

let wsMaster: WS = null;
app.ws('/master', (ws, req) => {
  wsMaster = ws;
});

app.get('/player/join/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (id !== 1 && id !== 2) {
    return res.send({code: -100, message: 'RoomID must be 1 or 2.'});
  }

  if (!rooms[id]) {
    rooms[id] = {id, alive: false, ready: {handlebar: false, wheel: false}};
  }

  const room = rooms[id];
  if (room.ready.handlebar && room.ready.wheel) {
    return res.send({code: -101, message: 'Room is full.'});
  }

  let role = 'handlebar';

  if (!room.ready.handlebar) {
    room.ready.handlebar = true;
  } else if (!room.ready.wheel) {
    role = 'wheel';
    room.ready.wheel = true;
  }

  room.alive = room.ready.handlebar && room.ready.wheel;

  wsMaster.send(JSON.stringify({type: 'rooms', value: rooms}));
  res.send({code: 0, data: {role}});
});

app.ws('/room/:id/:role', (ws, req) => {
  const role = req.params.role;
  const id = parseInt(req.params.id, 10);
  const room = rooms[id];

  ws.on('message', value => {
    console.log(id, role, value);

    wsMaster.send({type: 'control', value: {role, id, value}});
    ws.send('haha');
  });

  ws.on('close', () => {
    room.ready[role] = false;
    room.alive = false;

    wsMaster.send({type: 'rooms', value: rooms});
  });

  ws.on('error', error => {
    room.ready[role] = false;
    room.alive = false;

    wsMaster.send({type: 'rooms', value: rooms});
    console.error(error);
  });
});

app.listen(4444, '0.0.0.0', error => {
  if (error) {
    console.error(error);
  } else {
    console.info('==> 🌎 Listen on port %s.', 4444);
  }
});
