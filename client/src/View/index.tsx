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

import Player from './Player';
import GUI from './GUI';
import wsMaster from './wsMaster';

interface IPropTypes {

}

interface IStateTypes {
  state: 'start' | 'step' | 'playing' | 'end';
  winner: 'P1' | 'P2';
}

export default class View extends React.Component<IPropTypes, IStateTypes> {
  public state: IStateTypes = {
    state: 'start',
    winner: null
  };
  private players = [];

  private container: React.RefObject<HTMLCanvasElement> = React.createRef();
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private groundCollision: BABYLON.Mesh;
  private skyboxes: BABYLON.Mesh[];

  public componentDidMount() {
    wsMaster.connect();

    this.initGL();
    this.setState({state: 'step'});
    // this.setState({state: 'playing'});
  }

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

    this.engine.runRenderLoop(this.loop);

    window.addEventListener('resize', () => {
      this.container.current.width = document.body.clientWidth;
      this.container.current.height = document.body.clientHeight;
    });
  }

  private initEnv() {
    const {scene} = this;

    this.skyboxes = [].map(id => {
      // const skybox = BABYLON.Mesh.CreateBox(`skybox${id}`, 150, scene);
      // const skyboxMaterial = new BABYLON.StandardMaterial(`skybox-material${id}`, scene);
      // skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      // skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      // skyboxMaterial.backFaceCulling = false;
      // skyboxMaterial.disableLighting = true;
      // skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(`assets/bg${id}/`, this.scene);
      // skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      // skybox.material = skyboxMaterial;
      // skybox.position.y = 75.9;
      // skybox.infiniteDistance = true;

      const skybox = BABYLON.Mesh.CreateCylinder('skybox', 30, 80 + id * 10, 80 + id * 10, 32, 32, scene, false, BABYLON.Mesh.BACKSIDE);
      const skyboxMaterial = new BABYLON.StandardMaterial(`skybox-material${id}`, scene);
      skyboxMaterial.ambientColor = new BABYLON.Color3(1, 1, 1);
      skyboxMaterial.diffuseTexture = new BABYLON.Texture(`assets/bg${id}.png`, this.scene);
      skyboxMaterial.diffuseTexture.hasAlpha = true;
      skyboxMaterial.alphaMode = 0;
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.disableLighting = true;
      skybox.material = skyboxMaterial;
      // skybox.position.y = 14.86;
      skybox.infiniteDistance = true;

      return skybox;
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
        'ground-heightmap', 'assets/ground-heightmap.png', 100, 100, 250, 0, 10, scene, true, () => {

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

    const mesh = BABYLON.MeshBuilder.CreateBox('barrier', {width: .1, height: 0.1, depth: 8}, this.scene);
    mesh.material = material;
    mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      mesh, BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: 0, restitution: 0, friction: 1, ignoreParent: true},
      this.scene
    );
    mesh.position.set(15, 0, -17);

    mesh.physicsImpostor.onCollideEvent = (self, other) => {
      const obj = other.object as BABYLON.Mesh;
      if (obj.name === 'P1' || obj.name === 'P2') {
        console.log(obj.name);
        wsMaster.ready = false;
        this.setState({
          state: 'end',
          winner: obj.name
        });
      }
    };
  }

  private initPlayer() {
    Player.INIT_MATERIAL(this.scene);
    const p1 = new Player('P1', this.container, this.scene, [22, 2.2, -16]);
    const p2 = new Player('P2', this.container, this.scene, [22, 2.2, -19]);

    this.players.push(p1);
    this.players.push(p2);
    this.scene.activeCameras.push(p1.followCamera);
    this.scene.activeCameras.push(p2.followCamera);

    p2.followCamera.viewport = new BABYLON.Viewport(0.501, 0, 0.501, 1.0);
    p1.followCamera.viewport = new BABYLON.Viewport(0, 0, 0.499, 1.0);
  }

  private initLights() {
    const {scene} = this;
    scene.ambientColor = new BABYLON.Color3(1, 1, 1);
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
            await this.initGL();
            this.setState({state: 'step'});
          }}
          handleAllowControl={() => {
            wsMaster.ready = true;
            this.setState({state: 'playing'});
          }}
          winner={this.state.winner}
        />
      </React.Fragment>
    );
  }
}
