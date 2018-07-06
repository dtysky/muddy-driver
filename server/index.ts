/**
 * @File   : index.ts
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 00:24:56
 */
import * as Express from 'express';

const app = Express();

app.get('/test', (req, res) => {
  res.send('Hello');
});

app.listen(4444, '0.0.0.0', error => {
  if (error) {
    console.error(error);
  } else {
    console.info('==> 🌎 Listen on port %s.', 4444);
  }
});
