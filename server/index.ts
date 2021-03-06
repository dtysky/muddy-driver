/**
 * @File   : index.ts
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 00:24:56
 */
import * as Express from 'express';
import * as ExpressWS from 'express-ws';
import * as WS from 'ws';
import * as path from 'path';

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

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  next();
});

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

const wsMaster = {ws: null};
app.ws('/master', (ws, req) => {
  ws.on('message', (data: string) => {
    const {type} = JSON.parse(data);

    if (type === 'init') {
      wsMaster.ws = ws;
      wsMaster.ws.send(JSON.stringify({type: 'init'}));
    }
  });

  ws.on('close', () => {
    delete rooms['0'];
    delete rooms['1'];
  });

  ws.on('error', () => {
    delete rooms['0'];
    delete rooms['1'];
  });
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

  if (!room.ready.wheel) {
    role = 'wheel';
  }

  res.send({code: 0, data: {role}});
});

function sendRooms() {
  console.log(rooms);

  try {
    wsMaster.ws.send(JSON.stringify({type: 'rooms', value: rooms}));
  } catch (error) {
    delete rooms['0'];
    delete rooms['1'];

    console.error(error);
  }
}

app.ws('/room/:id/:role', (ws, req) => {
  const role = req.params.role;
  const id = parseInt(req.params.id, 10);
  const room = rooms[id];

  ws.on('message', (reqData: string) => {
    const data: {type: 'init' | 'value', value?: number} = JSON.parse(reqData);

    if (data.type === 'init') {
      if (role === 'handlebar') {
        room.ready.handlebar = true;
      } else if (role === 'wheel') {
        room.ready.wheel = true;
      }

      room.alive = room.ready.handlebar && room.ready.wheel;

      sendRooms();
    } else {
      try {
        wsMaster.ws.send(JSON.stringify({type: 'control', value: {role, id, value: data.value}}));
      } catch (error) {
        console.error(error);
      }
    }
  });

  ws.on('close', () => {
    room.ready[role] = false;
    room.alive = false;

    sendRooms();
  });

  ws.on('error', error => {
    room.ready[role] = false;
    room.alive = false;

    sendRooms();
    console.error(error);
  });
});

app.use((req, res, next) => {
  const ext = path.extname(req.url);

  if (ext === '.js') {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'text/javascript');
  }

  if (ext === '.css') {
    res.setHeader('Content-Type', 'text/css');
  }

  next();
});

app.use('/assets', Express.static(path.resolve(__dirname, './dist/assets/')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './dist/index.html'));
});

app.listen(4444, '0.0.0.0', error => {
  if (error) {
    console.error(error);
  } else {
    console.info('==> 🌎 Listen on port %s.', 4444);
  }
});
