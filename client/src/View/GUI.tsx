/**
 * @File   : GUI.ts
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 22:22:02
 */
import * as React from 'react';
import * as cx from 'classnames';
import * as QrCode from 'qrcode.react';

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
    }
  };

  public render() {
    if (this.props.state === 'playing') {
      return null;
    }

    if (this.props.state === 'start') {
      return this.renderStart();
    }

    return this.renderEnd();
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
          onClick={this.props.handleStart}
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
          value={`${location.host}/player/join/${id}`}
          size={240}
          fgColor={'#000'}
          bgColor={'#fff'}
          level='M'
        />
        <div className={'view-gui-start-player-roles'}>
          <div
            className={cx(
              'view-gui-start-player-role',
              'view-gui-start-player-h',
              rooms[id].handlebar && 'view-gui-start-player-active'
            )}
          />
          <div
            className={cx(
              'view-gui-start-player-role',
              'view-gui-start-player-w',
              rooms[id].wheel && 'view-gui-start-player-active'
            )}
          />
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
