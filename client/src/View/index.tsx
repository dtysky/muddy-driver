/**
 * @File   : index.tsx
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 14:17:07
 */
import * as React from 'react';
import * as BABYLON from 'babylonjs';
import 'babylonjs-gui';
import 'cannon';

import config from '../config';
import Player from './Player';
import GUI from './GUI';
import wsMaster from './wsMaster';

interface IPropTypes {

}

interface IStateTypes {
  state: 'start' | 'playing' | 'end';
}

export default class View extends React.Component<IPropTypes, IStateTypes> {
  public state: IStateTypes = {
    state: 'playing'
  };

  private container: React.RefObject<HTMLCanvasElement> = React.createRef();
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private groundCollision: BABYLON.Mesh;

  public async componentDidMount() {
    const canvas = this.container.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.engine = new BABYLON.Engine(canvas, true);

    const scene = this.scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0);

    await this.initEnv();
    this.initPhysics();
    this.initPlayer();
    this.initLights();
    this.initCameras();
    // this.initAnimations();
    // this.initSounds();

    wsMaster.connect();

    this.engine.runRenderLoop(this.loop);

    window.addEventListener('resize', () => {
      this.container.current.width = document.body.clientWidth;
      this.container.current.height = document.body.clientHeight;
    });
  }

  private initEnv() {
    const {scene} = this;

    const skybox = BABYLON.MeshBuilder.CreateBox('skybox', {size: 150}, this.scene);
    const skyboxMaterial = new BABYLON.StandardMaterial('skybox-material', this.scene);
    skyboxMaterial.ambientColor = new BABYLON.Color3(1, 1, 1);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('assets/long-shot/', this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;
    skybox.position.y = 0;
    skybox.infiniteDistance = true;

    return new Promise(resolve => {
      const ground = BABYLON.Mesh.CreatePlane('ground', 100, this.scene);
      const material = new BABYLON.StandardMaterial('ground-material', this.scene);
      material.diffuseTexture = new BABYLON.Texture('assets/ground.jpg', this.scene);
      material.ambientColor = new BABYLON.Color3(1, 1, 1);
      ground.material = material;
      ground.rotation.x = Math.PI / 2;

      const groundCollision = this.groundCollision = BABYLON.Mesh.CreateGroundFromHeightMap(
        'ground-heightmap', 'assets/ground-heightmap.jpg', 100, 100, 250, 0, 10, scene, true, () => {

          const groundCollisionMaterial = new BABYLON.StandardMaterial('ground-heightmap-material', this.scene);
          groundCollisionMaterial.alpha = 0;
          groundCollisionMaterial.alphaMode = 1;
          groundCollision.material = groundCollisionMaterial;
          groundCollision.position.x = ground.position.x;
          groundCollision.position.z = ground.position.y;
          groundCollision.position.y = ground.position.z;

          return resolve();
        }
      );
    });
  }

  private initPlayer() {
    Player.INIT_MATERIAL(this.scene);
    const p1 = new Player('P1', this.container, this.scene, [0, 3, 15]);
    const p2 = new Player('P2', this.container, this.scene, [0, 3, 12]);

    this.scene.activeCameras.push(p1.followCamera);
    this.scene.activeCameras.push(p2.followCamera);

    p1.followCamera.viewport = new BABYLON.Viewport(0.501, 0, 0.501, 1.0);
    p2.followCamera.viewport = new BABYLON.Viewport(0, 0, 0.499, 1.0);
  }

  private initLights() {
    const {scene} = this;

    scene.ambientColor = new BABYLON.Color3(1, 1, 1);
  }

  private initCameras() {
    const {scene, container} = this;

    const camera = new BABYLON.ArcRotateCamera('Camera', -Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(container.current, true);
  }

  private initPhysics() {
    const {scene, groundCollision} = this;

    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

    groundCollision.physicsImpostor = new BABYLON.PhysicsImpostor(
      groundCollision, BABYLON.PhysicsImpostor.HeightmapImpostor,
      {mass: 0, restitution: 0, friction: 1, ignoreParent: true},
      scene
    );
  }

  // private initSounds() {
  //   const {scene} = this;

  //   const bgm = new BABYLON.Sound('bgm', 'assets/bgm.mp3', scene, null, {
  //     loop: true, autoplay: false, spatialSound: true, rolloffFactor: .4
  //   });
  //   bgm.attachToMesh(scene.getMeshByName('node_star'));

  //   const catVoice = new BABYLON.Sound('catVoice', 'assets/miao.mp3', scene);
  // }

  // private initAnimations() {
  //   const {scene} = this;

  //   this.animations = {
  //     walk: scene.getAnimationGroupByName('walk'),
  //     hello: scene.getAnimationGroupByName('hello'),
  //     slap: scene.getAnimationGroupByName('slap')
  //   };
  //   scene.animationGroups[0].stop();
  // }

  private update() {
    // this.mainPlayer.translate(this.mainPlayer.forward, -0.1, BABYLON.Space.WORLD);
  }

  private loop = () => {
    this.update();
    this.scene.render();
  }

  public render() {
    return (
      <React.Fragment>
        <canvas
          className={'view-container'}
          ref={this.container}
        />
        <GUI
          state={this.state.state}
          handleStart={() => {
            wsMaster.ready = true;
            this.setState({state: 'playing'});
          }}
        />
      </React.Fragment>
    );
  }
}
