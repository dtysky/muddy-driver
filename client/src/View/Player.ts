/**
 * @File   : Player.ts
 * @Author : dtysky (dtysky@outlook.com)
 * @Link   : dtysky.moe
 * @Date   : 2018-7-7 16:40:37
 */
import * as BABYLON from 'babylonjs';
import wsMaster from './wsMaster';

let animationIndex = 0;
export default class Player {
  private expired = 0;
  private interval;
  private turningMaterial;
  private scene: BABYLON.Scene;
  public id;
  public mesh;
  private plane;
  public followCamera;

  public static materials = {
    forward: [
    ],
    left: [

    ],
    right: [

    ]
  };

  private status = 'forward';
  private velocity = 0;
  public static INIT_MATERIAL(scene) {
    const res = {
      forward: [
        'forward/w0.png',
        'forward/w1.png',
        'forward/w2.png',
        'forward/w3.png',
        'forward/y0.png',
        'forward/y1.png',
        'forward/y2.png',
        'forward/y3.png'
      ],
      left: [
        'turning/wl1.png',
        'turning/wl2.png',
        'turning/yl1.png',
        'turning/yl2.png'
      ],
      right: [
        'turning/wr1.png',
        'turning/wr2.png',
        'turning/yr1.png',
        'turning/yr2.png'
      ]
    };
    Object.keys(res).forEach(i => {
      res[i].forEach((j, idx) => {
        const material = new BABYLON.StandardMaterial(j, scene);
        material.diffuseTexture = new BABYLON.Texture(`assets/${j}`, scene);
        material.diffuseTexture.hasAlpha = true;
        material.alphaMode = 0;
        material.ambientColor = new BABYLON.Color3(1, 1, 1);
        Player.materials[i][idx] = material;
      });
    });
  }

  constructor(id, container, scene: BABYLON.Scene, position) {
    this.id = id;
    this.scene = scene;
    const fakeMaterial = new BABYLON.StandardMaterial('ground-material', this.scene);

    this.mesh = BABYLON.MeshBuilder.CreateBox(id, {width: 3, height: 3, depth: 3}, scene);
    const plane = BABYLON.MeshBuilder.CreatePlane('plane', {width: 3, height: 3 * 729 / 516}, scene);
    this.mesh.addChild(plane);
    this.mesh.material = fakeMaterial;
    this.mesh.material.alpha = 0;
    this.mesh.position.set(...position);
    this.mesh.rotation.y = Math.PI / 2;
    setTimeout(() => {
      this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        this.mesh, BABYLON.PhysicsImpostor.BoxImpostor,
        {mass: 1, restitution: 0, friction: 1, ignoreParent: true},
        scene
      );
    }, 100);
    plane.material = Player.materials.forward[0];

    plane.position.set(0, -0.7, 0);
    plane.rotation.x = Math.PI / 4;

    const followCamera = new BABYLON.FollowCamera('FollowCam', new BABYLON.Vector3(0, 0, 0), scene);
    followCamera.radius = -1.414 * 10;
    followCamera.heightOffset = 5;
    followCamera.rotationOffset = 0;
    followCamera.maxCameraSpeed = 10;
    followCamera.attachControl(container.current, true);
    followCamera.lockedTarget = this.mesh;

    this.followCamera = followCamera;

    this.plane = plane;

    wsMaster.controlHandlers.push(data => {
      const { role, id, value } = data;
      if (id !== parseInt(this.id.substr(1), 10)) {
        return;
      }
      if (role === 'wheel') {
        console.log(value / 20);
        this.mesh.translate(this.mesh.forward, value / 20, BABYLON.Space.WORLD);
        this.status = 'forward';
        this.velocity = value / 20;
      } else {
        this.mesh.rotation.y += value / 20;
        const t = Math.abs(value / (Math.PI / 2));
        const dir = value > 0 ? 'right' : 'left';
        this.status = dir;
        if (t > 0.1) {
          this.turningMaterial = Player.materials[dir][0 + 2 * (id - 1)];
        } else if (t > 0.3) {
          this.turningMaterial = Player.materials[dir][1 + 2 * (id - 1)];
        } else {
          this.status = 'forawrd';
        }
      }
    });

    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const rect = new BABYLON.GUI.Rectangle();
    rect.width = 0.1;
    rect.horizontalAlignment = 1;
    rect.height = '40px';
    rect.cornerRadius = 4;
    rect.color = 'white';
    rect.thickness = 2;
    rect.scaleX = 2;
    advancedTexture.addControl(rect);

    const label = new BABYLON.GUI.TextBlock();
    label.text = id;
    rect.addControl(label);

    rect.linkWithMesh(this.mesh);
    rect.linkOffsetY = -80;
    rect.isVisible = true;

  }

  public update() {
    if (this.status === 'forward') {
      if (this.expired < Date.now()) {
        this.plane.material = Player.materials.forward[(animationIndex++) % 4 + (parseInt(this.id.substr(1), 10) - 1) * 4];
        this.expired = Date.now() + 200 / this.velocity;
      }
    } else {
      this.plane.material = this.turningMaterial;
    }
  }
}