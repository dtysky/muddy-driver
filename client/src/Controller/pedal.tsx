/**
 * @File   : index.tsx
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 14:45:30
 */
import * as React from 'react';
import './base.scss';

export default class Pedal extends React.Component<{
  onChange: Function
}, {}> {
  private lastTouchedPart = null;
  private raf;
  private startY = {
    leftPart: 0,
    rightPart: 0
  };

  public state = {
    velocity: 0
  };

  private touchDown = {
    leftPart: false,
    rightPart: false
  };

  public componentDidMount() {
    this.run();
  }
  private stop() {
    cancelAnimationFrame(this.raf);
  }

  private run() {
    this.raf = requestAnimationFrame(() => this.run());
    const v = this.state.velocity - 0.04;
    this.setState(
      {
        velocity: v > 0 ? v : 0
      },
      () => {
        this.props.onChange(this.state.velocity);
      }
    );
  }

  private onTouchStart = (e, part) => {
    e.preventDefault();
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
    e.preventDefault();
    if (!this.touchDown[part]) {
      return;
    }
    this.touchDown[part] = false;
    const offset = (e.changedTouches[0].pageY - this.startY[part]) / 100;
    this.setState({
      velocity: (offset > 0 ? offset : 0) + this.state.velocity
    });
  }

  public render() {
    return (
      <div className='controller'>
        <div style={{
          position: 'absolute',
          left: 10,
          top: 10
        }}>{this.state.velocity}</div>
        <div
          className='left'
          onTouchStart={(e) => this.onTouchStart(e, 'leftPart')}
          onTouchEnd={(e) => this.onTouchEnd(e, 'leftPart')}
          onTouchMove={(e) => e.preventDefault()}
        >
        </div>
        <div
          className='right'
          onTouchStart={(e) => this.onTouchStart(e, 'rightPart')}
          onTouchMove={(e) => e.preventDefault()}
          onTouchEnd={(e) => this.onTouchEnd(e, 'rightPart')}
        >
        </div>
      </div>
    );
  }
}
