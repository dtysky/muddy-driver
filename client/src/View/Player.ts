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
    const material = new BABYLON.StandardMaterial('ground-material', this.scene);
    material.diffuseTexture = new BABYLON.Texture('assets/ground.jpg', this.scene);
    const body = BABYLON.MeshBuilder.CreatePlane('body', {width: 5, height: 2}, scene);
    body.material = material;
  }
}
