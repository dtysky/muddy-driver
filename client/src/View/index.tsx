/**
 * @File   : index.tsx
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 14:17:07
 */
import * as React from 'react';
import * as BABYLON from 'babylonjs';
import 'babylonjs-gui';

interface IPropTypes {

}

interface IStateTypes {

}

export default class View extends React.Component<IPropTypes, IStateTypes> {
  private container: React.RefObject<HTMLCanvasElement> = React.createRef();
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;

  public async componentDidMount() {
    const canvas = this.container.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.engine = new BABYLON.Engine(canvas, true);

    const scene = this.scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color4(.8, .8, .8);

    this.initEnv();
    this.initPlayer();
    // this.initLights();
    // this.initCameras();
    // this.initAnimations();
    // this.initSounds();
    // this.initHUD();
    // this.initActions();

    this.engine.runRenderLoop(this.loop);

    window.addEventListener('resize', () => {
      this.container.current.width = window.innerWidth;
      this.container.current.height = window.innerHeight;
    });
  }

  private initEnv() {

  }

  private initPlayer() {

  }

  // private initLights() {
  //   const {scene, cat} = this;

  //   const directionalLight =  new BABYLON.DirectionalLight('directionalLight', new BABYLON.Vector3(-2, -2, 1), scene);
  //   directionalLight.intensity = 2;
  //   directionalLight.shadowEnabled = true;

  //   const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
  //   scene.meshes.forEach(mesh => {
  //     if (/^node_/.test(mesh.name)) {
  //       shadowGenerator.addShadowCaster(mesh);
  //     }
  //   });
  // }

  // private initCameras() {
  //   const {scene, container} = this;

  //   const camera = new BABYLON.ArcRotateCamera('Camera', -Math.PI / 2, Math.PI / 2, 1, new BABYLON.Vector3(-5, 10, -36), scene);
  //   camera.attachControl(container.current, true);

  //   const followCamera = new BABYLON.FollowCamera('FollowCam', new BABYLON.Vector3(0, 0, 0), scene);
  //   followCamera.radius = 20;
  //   followCamera.heightOffset = 10;
  //   followCamera.rotationOffset = 0;
  //   followCamera.maxCameraSpeed = 10;
  //   followCamera.attachControl(container.current, true);
  //   followCamera.lockedTarget = cat;

  //   scene.activeCamera = camera;
  // }

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
