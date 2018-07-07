/**
 * @File   : index.tsx
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 14:45:30
 */
import * as React from 'react';
import {
  withRouter, RouteComponentProps
} from 'react-router-dom';
import './base.scss';

interface IPropTypes extends RouteComponentProps<{roomId}> {

}

interface IStateTypes {

}

class Controller extends React.Component<IPropTypes, IStateTypes> {
  private lastTouchedPart = null;
  private raf;
  private startY = {
    leftPart: 0,
    rightPart: 0
  };

  public state = {
    velocity: 0,
    isRunning: false
  };

  private touchDown = {
    leftPart: false,
    rightPart: false
  };

  public componentDidMount() {
    console.log(this.props.match.params);
    /*
    const ws = new WebSocket('ws://192.168.43.102:4444/ws-test');
    ws.onopen = () => {
      console.log('connected');
      ws.send(JSON.stringify({code: 1}));
    };
    ws.onmessage = (data) => {
      console.log(data);
    };
    */
  }

  private stop() {
    cancelAnimationFrame(this.raf);
    this.setState({
      isRunning: false
    });
  }

  private run() {
    this.setState({
      isRunning: true
    });
    this.raf = requestAnimationFrame(() => this.run());
    const v = this.state.velocity - 3;
    this.setState({
      velocity: v > 0 ? v : 0
    });
  }

  private onTouchStart = (e, part) => {
    if ((this.touchDown.leftPart && part === 'rightPart') || (this.touchDown.rightPart && part === 'leftPart')) {
      return;
    }
    if (this.lastTouchedPart === part) {
      return;
    }
    this.lastTouchedPart = part;
    this.startY[part] = e.touches[0].pageY;
    this.touchDown[part] = true;
  }

  private onTouchEnd = (e, part) => {
    if (!this.touchDown[part]) {
      return;
    }
    this.touchDown[part] = false;
    const offset = e.changedTouches[0].pageY - this.startY[part];
    this.setState({
      velocity: (offset > 0 ? offset : 0) + this.state.velocity
    });
  }

  private onTouchMove = (e, part) => {
    if (!this.touchDown[part]) {
      return;
    }
  }

  public render() {
    return (
      <div className='controller'>
        <div style={{
          position: 'absolute',
          left: 10,
          top: 10
        }}>{this.state.velocity}</div>
        {
          this.state.isRunning ? (
            <button className='btnStop' onClick={() => this.stop()}>Stop</button>
          ) : (
            <button className='btnRun' onClick={() => this.run()}>Run</button>
          )
        }
        <div
          className='left'
          onTouchStart={(e) => this.onTouchStart(e, 'leftPart')}
          onTouchMove={(e) => this.onTouchMove(e, 'leftPart')}
          onTouchEnd={(e) => this.onTouchEnd(e, 'leftPart')}
        >
        </div>
        <div
          className='right'
          onTouchStart={(e) => this.onTouchStart(e, 'rightPart')}
          onTouchMove={(e) => this.onTouchMove(e, 'rightPart')}
          onTouchEnd={(e) => this.onTouchEnd(e, 'rightPart')}
        >
        </div>
      </div>
    );
  }
}

export default withRouter(Controller);
