/**
 * @File   : GUI.ts
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 22:22:02
 */
import * as React from 'react';
import * as cx from 'classnames';
import * as QrCode from 'qrcode.react';

import wsMaster from './wsMaster';
import './base.scss';

interface IPropTypes {
  state: 'playing' | 'start' | 'end';
  handleStart: () => any;
}

interface IStateTypes {
  rooms: {
    1: {
      handlebar: boolean;
      wheel: boolean;
    },
    2: {
      handlebar: boolean;
      wheel: boolean;
    }
  };
  state: 'init' | 'title' | 'playing' | 'start' | 'end';
}

export default class GUI extends React.Component<IPropTypes, IStateTypes> {
  public state: IStateTypes = {
    rooms: {
      1: {
        handlebar: false,
        wheel: false
      },
      2: {
        handlebar: false,
        wheel: false
      }
    },
    state: 'init'
  };

  private videoElement: React.RefObject<HTMLVideoElement> = React.createRef();
  private bgmElement: React.RefObject<HTMLAudioElement> = React.createRef();

  public componentDidMount() {
    wsMaster.handleRooms = data => {
      if (data[1]) {
        this.state.rooms[1] = data[1].ready;
      } else {
        this.state.rooms[1] = {handlebar: false, wheel: false};
      }

      if (data[2]) {
        this.state.rooms[2] = data[2].ready;
      } else {
        this.state.rooms[2] = {handlebar: false, wheel: false};
      }

      this.forceUpdate();
    };

    this.videoElement.current.addEventListener('ended', () => {
      // play
      this.bgmElement.current.play();
      this.setState({state: 'title'});
    });

    this.videoElement.current.addEventListener('click', () => {
      if (this.state.state !== 'title') {
        return;
      }
      // stop
      this.setState({state: 'start'});
    });
  }

  public componentWillReceiveProps(nextProps: IPropTypes) {
    if (nextProps.state === 'start') {
      this.setState({state: 'init'});
      return;
    }

    if (nextProps.state === 'playing') {
      this.bgmElement.current.currentTime = 0;
    }

    this.setState({state: nextProps.state});
  }

  public componentWillUnmount() {
    wsMaster.handleRooms = () => {};
  }

  public render() {
    return (
      <div className={'view-gui'}>
        {this.renderContent()}
        <audio
          src={'/assets/bgm.mp3'}
          ref={this.bgmElement}
        />
      </div>
    );
  }

  public renderContent() {
    if (this.state.state === 'playing') {
      return null;
    }

    if (this.state.state === 'init' || this.state.state === 'title') {
      return this.renderInit();
    }

    if (this.state.state === 'start') {
      return this.renderStart();
    }

    return this.renderEnd();
  }

  private renderInit() {
    return (
      <video
        className={'view-gui-init'}
        src={'/assets/logo.mp4'}
        ref={this.videoElement}
        autoPlay
      />
    );
  }

  private renderStart() {
    return (
      <div className={'view-gui-start'}>
        <div
          className={cx(
            'view-gui-start-border',
            'view-gui-start-border-1',
            'view-gui-start-r'
          )}
        />
        <div
          className={cx(
            'view-gui-start-border',
            'view-gui-start-border-2',
            'view-gui-start-b'
          )}
        />
        <div className={'view-gui-start-players'}>
          {this.renderQrcode(1, 'r')}
          {this.renderQrcode(2, 'b')}
        </div>
        <img
          className={'view-gui-start-confirm'}
          src={'/assets/start.png'}
          onClick={() => {
            const {rooms} = this.state;

            if (!(rooms[1].handlebar && rooms[1].wheel && rooms[2].handlebar && rooms[2].wheel)) {
              return;
            }

            this.props.handleStart();
          }}
        />
      </div>
    );
  }

  private renderQrcode(id: number, color: 'r' | 'b') {
    const {rooms} = this.state;

    return (
      <div
        className={cx(
          'view-gui-start-player',
          `view-gui-start-${color}`
        )}
      >
        <QrCode
          className={'view-gui-start-player-qr'}
          value={`http://${location.host}/player/${id}`}
          size={240}
          fgColor={'#000'}
          bgColor={'#fff'}
          level='M'
        />
        <div className={'view-gui-start-player-roles'}>
          <div
            className={cx(
              'view-gui-start-player-role',
              'view-gui-start-player-h'
            )}
          >
            {rooms[id].handlebar && 'H'}
          </div>
          <div
            className={cx(
              'view-gui-start-player-role',
              'view-gui-start-player-w',
              rooms[id].wheel && 'view-gui-start-player-active'
            )}
          >
            {rooms[id].wheel && 'W'}
          </div>
        </div>
      </div>
    );
  }

  private renderEnd() {
    return (
      <div className={'view-gui-end'}>

      </div>
    );
  }
}
