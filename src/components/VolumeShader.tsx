import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
// import { shaderMaterial } from '@react-three/drei';
import vertexShader from '../utils/shaders/vertex.glsl'
import fragmentShader from '../utils/shaders/fragment.glsl'

import { createTexture} from '../utils/colormap'
import {
  useListBlade,
  // usePaneFolder,
  // usePaneInput,
  useSliderBlade,
  // useTextBlade,
  useTweakpane,
} from '../../pane'

const volData = new Uint8Array( 100 * 100 * 100 );
for ( let x = 0; x < 1000000; x ++ ) {
  volData[ x ] = Math.random()*255;
}

const volTexture = new THREE.Data3DTexture(volData, 100, 100, 100)

volTexture.format = THREE.RedFormat;
volTexture.minFilter = THREE.NearestFilter;
volTexture.magFilter = THREE.NearestFilter;
volTexture.unpackAlignment = 1;
volTexture.needsUpdate = true;

// console.log(volTexture)
export function VolumeShader() {
  const containerElement = document.getElementById('myPane');
  const pane = useTweakpane(
    {
      threshold: 0.0,
    },
    {
      title: 'Geometry Settings',
      container: containerElement,
    }
  )
  const [threshold] = useSliderBlade(pane, {
    label: 'threshold',
    value: 0.0,
    min: 0,
    max: 1,
    step: 0.01,
    format: (value) => value.toFixed(2),
  })
  // List blade
// const cmap_texture = createTexture('blackbody')
const [cmap_texture] = useListBlade(pane, {
  label: 'colormap',
  options: [
    {
      text: 'blackbody',
      value: createTexture('blackbody'),
    },
    {
      text: 'rainbow',
      value: createTexture('rainbow'),
    },
    {
      text: 'cooltowarm',
      value: createTexture('cooltowarm'),
    },
    {
      text: 'grayscale',
      value: createTexture('grayscale'),
    },
  ],
  value: null //  calling createTexture('blackbody') creates a huhe lag here!
})

  const meshRef = useRef()
  useFrame(({ camera }) => {
    meshRef.current.material.uniforms.cameraPos.value.copy(camera.position)
  })
  return (
  <group position={[0,1.01,0]}>
  <mesh ref={meshRef}>
    <boxGeometry args={[2, 2, 2]} />
    <shaderMaterial
      attach="material"
      args={[{
        glslVersion: THREE.GLSL3,
        uniforms: {
          map: { value: volTexture },
          cameraPos: { value: new THREE.Vector3() },
          threshold: { value: threshold },
          steps: { value: 200 },
          scale: {value: 2},
          flip: {value: false},
          cmap: {value: cmap_texture}
        },
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
      }]}
    />
  </mesh>
  <mesh castShadow>
    <boxGeometry args={[2, 2, 2]} />
    <meshStandardMaterial transparent color={'red'} visible={false} />
  </mesh>
  </group>
  )
}