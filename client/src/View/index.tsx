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
    state: 'start'
  };
  private players = [];

  private container: React.RefObject<HTMLCanvasElement> = React.createRef();
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private groundCollision: BABYLON.Mesh;

  private async initGL() {
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
    this.initBarrier();
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

    [3].forEach(id => {
      const skybox = BABYLON.Mesh.CreateBox(`skybox${id}`, 100, scene);
      const skyboxMaterial = new BABYLON.StandardMaterial(`skybox-material${id}`, scene);
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.disableLighting = true;
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(`assets/bg${id}/`, this.scene);
      skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      skybox.material = skyboxMaterial;
      skybox.position.y = 49.9;
      skybox.infiniteDistance = true;
      // skybox.rotation.x = -Math.PI / 4;
    });

    return new Promise(resolve => {
      const ground = BABYLON.Mesh.CreatePlane('ground', 100, this.scene);
      const material = new BABYLON.StandardMaterial('ground-material', this.scene);
      material.disableLighting = true;
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

  private initBarrier() {
    const material = new BABYLON.StandardMaterial('barrier', this.scene);
    material.diffuseTexture = new BABYLON.Texture(`assets/ground.jpg`, this.scene);
    material.ambientColor = new BABYLON.Color3(1, 1, 1);

    const mesh = BABYLON.MeshBuilder.CreateBox('barrier', {width: 2, height: 1.5, depth: 6}, this.scene);
    mesh.material = material;
    mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      mesh, BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: 0, restitution: 0, friction: 1, ignoreParent: true},
      this.scene
    );
    mesh.position.set(-5, 1, 13);

    mesh.physicsImpostor.onCollideEvent = (self, other) => {
      const obj = other.object as BABYLON.Mesh;
      if (obj.name === 'P1' || obj.name === 'P2') {
        console.log(obj.name);
        wsMaster.ready = false;
        this.setState({
          state: 'end'
        });
      }
    };
  }

  private initPlayer() {
    Player.INIT_MATERIAL(this.scene);
    const p1 = new Player('P1', this.container, this.scene, [0, 3, 15]);
    const p2 = new Player('P2', this.container, this.scene, [-5, 3, 12]);

    this.players.push(p1);
    this.players.push(p2);
    this.scene.activeCameras.push(p1.followCamera);
    this.scene.activeCameras.push(p2.followCamera);

    p1.followCamera.viewport = new BABYLON.Viewport(0.501, 0, 0.501, 1.0);
    p2.followCamera.viewport = new BABYLON.Viewport(0, 0, 0.499, 1.0);
  }

  private initLights() {
    const {scene} = this;

    scene.ambientColor = new BABYLON.Color3(1, 1, 1);
    // const hemisphericLight =  new BABYLON.HemisphericLight('directionalLight', new BABYLON.Vector3(1, 1, 1), scene);
    const directionalLight =  new BABYLON.DirectionalLight('directionalLight', new BABYLON.Vector3(-2, -2, 1), scene);
    // hemisphericLight.intensity = 2;
  }

  private initCameras() {
    const {scene, container} = this;

    const camera = new BABYLON.ArcRotateCamera('Camera', -Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(container.current, true);

    // scene.activeCamera = camera;
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
    this.players.forEach(i => i.update());
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
          handleStart={async () => {
            wsMaster.ready = true;
            await this.initGL();
            this.setState({state: 'playing'});
          }}
        />
      </React.Fragment>
    );
  }
}
