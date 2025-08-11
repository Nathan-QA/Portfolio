import * as THREE from 'https://esm.sh/three@0.164.1';
import { GLTFLoader } from 'https://esm.sh/three@0.164.1/examples/jsm/loaders/GLTFLoader.js';
import { byId } from './utils.js';
import { CONFIG, I } from './config.js';
import { state } from './state.js';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function initThree(){
  const canvas = byId('r3f'); if(!canvas) return;
  const hasGL = (()=>{ try{ const c=document.createElement('canvas'); return !!(c.getContext('webgl')||c.getContext('experimental-webgl')); }catch{ return false } })();

  if(!hasGL){
    const fb = byId('webglFallback');
    fb?.classList.remove('sr-only');
    if (fb) fb.textContent = state.lang==='fr' ? 'Votre navigateur ne supporte pas WebGL.' : 'Your browser does not support WebGL.';
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, .1, 100);
  camera.position.set(0,0,2.9);
  const dl=new THREE.DirectionalLight(0xffffff,1.1); dl.position.set(1,2,3); scene.add(dl);
  scene.add(new THREE.AmbientLight(0xffffff,.45));

  let head, eyeL, eyeR, loadedModel=null;

  function sizeFromContainer(){
    const parent = canvas.parentElement || document.body;
    const rect = parent.getBoundingClientRect();
    const wCSS = Math.max(1, Math.floor(rect.width));
    const hCSS = Math.max(1, Math.floor(rect.height));
    let pr = clamp(window.devicePixelRatio || 1, 1, 2);
    const estPixels = wCSS * hCSS * pr * pr;
    const MAX_PIXELS = 10_000_000;
    if (estPixels > MAX_PIXELS) pr = Math.sqrt(MAX_PIXELS / (wCSS * hCSS));
    renderer.setPixelRatio(pr);
    renderer.setSize(wCSS, hCSS, true);
    camera.aspect = wCSS / hCSS; camera.updateProjectionMatrix();
  }

  function fallbackHead(){
    head=new THREE.Mesh(new THREE.SphereGeometry(1,42,42),new THREE.MeshStandardMaterial({roughness:.35,metalness:.05}));
    scene.add(head);
    const eyeG=new THREE.SphereGeometry(.08,24,24), eyeM=new THREE.MeshStandardMaterial({color:0x222222,roughness:.3});
    eyeL=new THREE.Mesh(eyeG,eyeM); eyeR=new THREE.Mesh(eyeG,eyeM); eyeL.position.set(-.28,.15,.93); eyeR.position.set(.28,.15,.93); scene.add(eyeL,eyeR);
  }

  if(CONFIG.MODEL_URL){
    const loader=new GLTFLoader();
    loader.load(CONFIG.MODEL_URL,
      (gltf)=>{ loadedModel=gltf.scene; scene.add(loadedModel); renderOnce(); },
      undefined,
      (e)=>{ console.warn('GLTF load error',e); fallbackHead(); renderOnce(); }
    );
  } else {
    fallbackHead(); renderOnce();
  }

  let moveRAF = 0;
  function onMove(e){
    if (moveRAF) return;
    moveRAF = requestAnimationFrame(()=>{
      moveRAF = 0;
      const vw=window.innerWidth, vh=window.innerHeight;
      const x=(e.clientX/vw)*2-1; 
      const y=-((e.clientY/vh)*2-1);
      if(loadedModel){
        loadedModel.rotation.y = x * 0.8;
        loadedModel.rotation.x = y * 0.55;
      } else if(head){
        head.rotation.y = x * 0.45;
        head.rotation.x = y * 0.35;
        if(eyeL&&eyeR){
          eyeL.position.x = -0.28 + x*0.12;
          eyeR.position.x =  0.28 + x*0.12;
          eyeL.position.y =  0.15 + y*0.08;
          eyeR.position.y =  0.15 + y*0.08;
        }
      }
      renderOnce();
    });
  }
  document.addEventListener('pointermove', onMove, {passive:true});
  window.addEventListener('resize', ()=>{ sizeFromContainer(); renderOnce(); }, {passive:true});
  window.addEventListener('orientationchange', ()=>{ sizeFromContainer(); renderOnce(); }, {passive:true});
  sizeFromContainer();

  function renderOnce(){ renderer.render(scene,camera) }
}
