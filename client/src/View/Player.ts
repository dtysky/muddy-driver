/**
 * @File   : Player.ts
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 16:40:37
 */
import * as BABYLON from 'babylonjs';
import wsMaster from './wsMaster';

export default class Player {
  private scene: BABYLON.Scene;
  public mesh;
  public followCamera;

  constructor(container, scene: BABYLON.Scene, position) {
    this.scene = scene;
    const material = new BABYLON.StandardMaterial('ground-material', this.scene);
    const fakeMaterial = new BABYLON.StandardMaterial('ground-material', this.scene);
    material.diffuseTexture = new BABYLON.Texture('assets/sexy.png', this.scene);
    material.diffuseTexture.hasAlpha = true;

    this.mesh = BABYLON.MeshBuilder.CreateBox('body', {width: 3, height: 3, depth: 3}, scene);
    const plane = BABYLON.MeshBuilder.CreatePlane('plane', {width: 3, height: 3}, scene);
    this.mesh.addChild(plane);
    this.mesh.material = fakeMaterial;
    this.mesh.material.alpha = 0;
    material.alphaMode = 0;
    this.mesh.position.set(...position);
    this.mesh.rotation.y = Math.PI / 2;
    this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.mesh, BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: 1, restitution: 0, friction: 1, ignoreParent: true},
      scene
    );
    plane.material = material;

    plane.position.set(0, 0, 0);
    plane.rotation.x = Math.PI / 4;
    material.ambientColor = new BABYLON.Color3(1, 1, 1);

    const followCamera = new BABYLON.FollowCamera('FollowCam', new BABYLON.Vector3(0, 0, 0), scene);
    followCamera.radius = -10;
    followCamera.heightOffset = 10;
    followCamera.rotationOffset = 0;
    followCamera.maxCameraSpeed = 10;
    followCamera.attachControl(container.current, true);
    followCamera.lockedTarget = this.mesh;

    this.followCamera = followCamera;

    wsMaster.handleControl = data => {
      const { role, id, value } = data;
      if (role === 'wheel') {
        this.mesh.translate(this.mesh.forward, value / 20, BABYLON.Space.WORLD);
      } else {
        this.mesh.rotation.y += value;
      }
    }
  }
}
