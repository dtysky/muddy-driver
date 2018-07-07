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
    const fakeMaterial = new BABYLON.StandardMaterial('ground-material', this.scene);
    material.diffuseTexture = new BABYLON.Texture('assets/ground.jpg', this.scene);
    const body = BABYLON.MeshBuilder.CreateBox('body', {width: 3, height: 3, depth: 3}, scene);
    const plane = BABYLON.MeshBuilder.CreatePlane('plane', {width: 3, height: 3}, scene);
    body.addChild(plane);
    body.material = fakeMaterial;
    body.material.alpha = 0;
    plane.material = material;
    body.position.set(0, 3, 13);

    plane.position.set(0, -1.4, 0);
    body.rotation.y = Math.PI / 2;
    plane.rotation.x = Math.PI / 2;
    material.ambientColor = new BABYLON.Color3(1, 1, 1);
    body.physicsImpostor = new BABYLON.PhysicsImpostor(
      body, BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: 1, restitution: 0, friction: 1, ignoreParent: true},
      scene
    );
  }
}
