import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.155.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, controls;
let model, skeleton;

const restPose = new Map();
const restPos  = new Map();

const container = document.getElementById('scene-container');
const overlay   = document.getElementById('overlay');
const ui        = document.getElementById('ui');

const raiseHand = document.getElementById('raise-hand');
const lowerHand = document.getElementById('lower-hand');
const raiseLeg  = document.getElementById('raise-leg');
const lowerLeg  = document.getElementById('lower-leg');
const resetBtn  = document.getElementById('reset-pose');

let handStep = 0;
let legStep  = 0;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafc);

  camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 1.6, 3.5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(5, 10, 7);
  scene.add(light);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;

  loadModel();
  window.addEventListener('resize', onResize);
}

function loadModel() {
  new GLTFLoader().load('model.glb', gltf => {
    model = gltf.scene;

    model.traverse(o => {
      if (o.isSkinnedMesh) skeleton = o.skeleton;
    });

    skeleton.bones.forEach(b => {
      restPose.set(b.name, b.quaternion.clone());
      restPos.set(b.name, b.position.clone());
    });

    console.log('Available bones:', skeleton.bones.map(b => b.name));

    scene.add(model);
    overlay.style.display = 'none';
    ui.classList.remove('hidden');

    setupUI();
  });
}

function getBone(name) {
  return skeleton.bones.find(b => b.name === name);
}

function setRotation(bone, x, y, z) {
  if (!bone) return;

  const q = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      THREE.MathUtils.degToRad(x),
      THREE.MathUtils.degToRad(y),
      THREE.MathUtils.degToRad(z),
      'XYZ'
    )
  );

  bone.quaternion.copy(restPose.get(bone.name)).multiply(q);
}

function setIKPos(name, offset) {
  const bone = getBone(name);
  if (!bone) return;

  bone.position.copy(restPos.get(name)).add(offset);
}

const HAND_POSES = [
  { upper: 0,  lower: 0,  ik: new THREE.Vector3(0, 0, 0) },
  { upper: 25, lower: 15, ik: new THREE.Vector3(0.20, 0.45, -0.09) },
  { upper: 45, lower: 20, ik: new THREE.Vector3(0.37, 0.7,  -0.04) }
];

function applyHand() {
  const p = HAND_POSES[handStep];

  setRotation(getBone('uppderarmR'), 0, 0, -p.upper);
  setRotation(getBone('lowerarmR'), 0, 0, -p.lower);
  setIKPos('hand_IKR', p.ik);

  skeleton.update();
}

const LEG_POSES = [
  {
    upper: { x: 0,  y: 0,  z: 0 },
    lower: { x: 0,  y: 0,  z: 0 },
    ik: new THREE.Vector3(0, 0, 0)
  },
  {
    upper: { x: 35, y: 0, z: 0 },   
    lower: { x: 22, y: 0, z: 0 },   
    ik: new THREE.Vector3(-0.15, 0.25, 0.57) 
  },
  {
    upper: { x: 55, y: 0, z: 0 },
    lower: { x: 38, y: 0, z: 0 },
    ik: new THREE.Vector3(-0.20 , 0.45, 0.78) 
  }
];

function applyLeg() {
  const p = LEG_POSES[legStep];

  setRotation(getBone('upperlegR'), p.upper.x, p.upper.y, p.upper.z);
  setRotation(getBone('lowerlegR'), p.lower.x, p.lower.y, p.lower.z);

  setIKPos('Foot_IKR', p.ik);

  skeleton.update();
}





function setupUI() {

  raiseHand.onclick = () => {
    handStep = Math.min(handStep + 1, HAND_POSES.length - 1);
    applyHand();
  };

  lowerHand.onclick = () => {
    handStep = Math.max(handStep - 1, 0);
    applyHand();
  };

  raiseLeg.onclick = () => {
  legStep = Math.min(legStep + 1, 2);
  applyLeg();
  };
  lowerLeg.onclick = () => {
    legStep = Math.max(legStep - 1, 0);
    applyLeg();
  };

  resetBtn.onclick = () => {
    handStep = 0;
    legStep  = 0;
    resetPose();
  };
}

function resetPose() {
  skeleton.bones.forEach(b => {
    b.quaternion.copy(restPose.get(b.name));
    b.position.copy(restPos.get(b.name));
  });
  skeleton.update();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}