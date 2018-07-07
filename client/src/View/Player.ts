/**
 * @File   : Player.ts
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 16:40:37
 */
import * as BABYLON from 'babylonjs';

export default class Player {
  private scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }
}
