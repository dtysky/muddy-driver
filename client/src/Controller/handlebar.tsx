/**
 * @File   : index.tsx
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 14:45:30
 */
import * as React from 'react';

import DeviceOrientationManager from 'device-orientation-manager';

export default class HandleBar extends React.Component<{
  onChange: Function
}, {}> {
  public state = {
    pitch: 0
  };
  public componentDidMount() {
    const options = {
      freq: 30
    };

    const doManager: DeviceOrientationManager = new DeviceOrientationManager(options);

    doManager.addEventListener(
      'deviceorientation',
      ({ pitch }) => {
        this.props.onChange(pitch);
        this.setState({
          pitch
        });
      }
    );
    doManager.start();
  }
  public render() {
    return <div>{this.state.pitch * 180 / Math.PI}</div>;
  }
}
