/**
 * @File   : index.tsx
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 14:17:07
 */
import * as React from 'react';
import * as BABYLON from 'babylonjs';
import 'babylonjs-gui';
import Player from './Player';
import config from '../config';

interface IPropTypes {

}

interface IStateTypes {

}

export default class View extends React.Component<IPropTypes, IStateTypes> {
  private container: React.RefObject<HTMLCanvasElement> = React.createRef();
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;

  private mainPlayer;
  private ws;
  public async componentDidMount() {
    const url = config.url;
    this.ws = new WebSocket(`ws://${url}/master`);
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({type: 'init'}));
    };
    this.ws.onmessage = (res) => {
      const data = JSON.parse(res.data);
      if (data.type !== 'control') {
        return;
      }
      const { role, id, value } = data.value;
      if (role === 'wheel') {
        this.mainPlayer.translate(this.mainPlayer.forward, value / 20, BABYLON.Space.WORLD);
      } else {
        this.mainPlayer.rotation.y += value;
      }
    };

    const canvas = this.container.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.engine = new BABYLON.Engine(canvas, true);

    const scene = this.scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0);

    this.initEnv();
    this.initPlayer();
    this.initLights();
    this.initCameras();
    // this.initAnimations();
    // this.initSounds();
    // this.initHUD();
    // this.initActions();

    this.engine.runRenderLoop(this.loop);

    window.addEventListener('resize', () => {
      this.container.current.width = document.body.clientWidth;
      this.container.current.height = document.body.clientHeight;
    });
  }

  private initEnv() {
    const skybox = BABYLON.MeshBuilder.CreateBox('skybox', {size: 100}, this.scene);
    const skyboxMaterial = new BABYLON.StandardMaterial('skybox-material', this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('assets/long-shot/', this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;
    skybox.position.y = 49;
    // skybox.infiniteDistance = true;

    const plane = BABYLON.Mesh.CreatePlane('ground', 100, this.scene);
    const material = new BABYLON.StandardMaterial('ground-material', this.scene);
    material.diffuseTexture = new BABYLON.Texture('assets/ground.jpg', this.scene);
    plane.material = material;
    plane.rotation.x = Math.PI / 2;
  }

  private initPlayer() {
    new Player(this.scene);
    this.mainPlayer = this.scene.getMeshByName('body');
  }

  private initLights() {
    const {scene} = this;

    const hemisphericLight = new BABYLON.HemisphericLight('hemisphericLight', new BABYLON.Vector3(1, 1, 1), scene);
    hemisphericLight.intensity = 2;
  }

  private initCameras() {
    const {scene, container} = this;

    const camera = new BABYLON.ArcRotateCamera('Camera', -Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(container.current, true);

    const followCamera = new BABYLON.FollowCamera('FollowCam', new BABYLON.Vector3(0, 0, 0), scene);
    followCamera.radius = -60;
    followCamera.heightOffset = 10;
    followCamera.rotationOffset = 0;
    followCamera.maxCameraSpeed = 10;
    followCamera.attachControl(container.current, true);
    followCamera.lockedTarget = this.scene.getMeshByName('body');

    scene.activeCamera = followCamera;
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

  // private initHUD() {
  //   const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

  //   this.huds = ['cat_mesh', 'tv', 'star', 'desk', 'tree', 'computer'].map(name => {
  //     const mesh = this.scene.getMeshByName(`node_${name}`);

  //     const rect = new BABYLON.GUI.Rectangle();
  //     rect.width = 0.2;
  //     rect.height = '40px';
  //     rect.cornerRadius = 4;
  //     rect.color = 'white';
  //     rect.thickness = 1;
  //     rect.background = 'green';
  //     advancedTexture.addControl(rect);

  //     const label = new BABYLON.GUI.TextBlock();
  //     label.text = name.split('_')[0];
  //     rect.addControl(label);

  //     rect.linkWithMesh(mesh);
  //     rect.linkOffsetY = -150;
  //     rect.isVisible = false;

  //     return rect;
  //   });
  // }

  // private initActions() {
  //   const {scene, cat} = this;

  //   cat.actionManager = new BABYLON.ActionManager(scene);
  //   cat.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
  //     BABYLON.ActionManager.OnPickTrigger,
  //     () => {
  //       scene.getSoundByName('catVoice').play();
  //     }
  //   ));
  // }

  // private registerActions() {
  //   const {scene} = this;
  //   // scene.activeCamera = scene.cameras[1];
  //   scene.actionManager = new BABYLON.ActionManager(scene);

  //   scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
  //     BABYLON.ActionManager.OnKeyDownTrigger,
  //     event => {
  //       switch (event.sourceEvent.key) {
  //         case 'A':
  //           this.setState({walking: true, right: true});
  //           break;
  //         case 'D':
  //           this.setState({walking: true, left: true});
  //           break;
  //         case 'W':
  //           this.setState({walking: true, up: true});
  //           break;
  //         case 'S':
  //           this.setState({walking: true, down: true});
  //           break;
  //         default:
  //           break;
  //       }
  //     }
  //   ));

  //   scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
  //     BABYLON.ActionManager.OnKeyUpTrigger,
  //     event => {
  //       const {state} = this;

  //       switch (event.sourceEvent.key) {
  //         case 'A':
  //           state.right = false;
  //           break;
  //         case 'D':
  //           state.left = false;
  //           break;
  //         case 'W':
  //           state.up = false;
  //           break;
  //         case 'S':
  //           state.down = false;
  //           break;
  //         default:
  //           break;
  //       }

  //       if (!state.left && !state.right && !state.up && !state.down) {
  //         state.walking = false;
  //       }

  //       this.setState(state);
  //     }
  //   ));
  // }

  // private removeActions() {
  //   this.scene.activeCamera = this.scene.cameras[0];

  //   this.scene.actionManager.actions.map(action => {
  //     this.scene.actionManager.unregisterAction(action);
  //   });
  // }

  private update() {
  }

  private loop = () => {
    this.update();
    this.scene.render();
  }

  public render() {
    return (
      <canvas
        ref={this.container}
      />
    );
  }
}
