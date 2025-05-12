import {  useMemo } from 'react'
import {  useRef } from 'react'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from '@/components/textures/shaders';
import { usePaneInput, usePaneFolder, useSliderBlade, useTweakpane } from '@lazarusa/react-tweakpane'
import { createPaneContainer } from '@/components/ui';
import useGlobals from '@/utils/useGlobals';

interface DataCubeProps {
  volTexture: THREE.Data3DTexture | THREE.DataTexture | null,
  shape : THREE.Vector3,
  colormap: THREE.DataTexture,
  flipY:boolean
}

export const DataCube = ({ volTexture, shape, colormap, flipY }: DataCubeProps ) => {  
  
    const meshRef = useRef<THREE.Mesh>(null);
    const paneContainer = createPaneContainer("plot-pane");
    const pane = useTweakpane(
        {
          flip: false,
        },
        {
          title: 'Volume',
          container: paneContainer ?? undefined,
          expanded: false,
        }
      );

      const [threshold] = useSliderBlade(pane, {
        label: 'Clip Values',
        value: 0.0,
        min: 0,
        max: 1,
        step: 0.01,
        format: (value) => value.toFixed(2),
      })

      const [steps] = useSliderBlade(pane, {
        label: 'Quality',
        value: 200,
        min: 50,
        max: 1000,
        step: 25,
      })

      const [xMin] = useSliderBlade(pane, {
        label: 'xmin',
        value: -1,
        min: -1,
        max: 1,
        step: 0.01,
      })
      const [xMax] = useSliderBlade(pane, {
        label: 'xmax',
        value: 1,
        min: -1,
        max: 1,
        step: 0.01,
      })
      const [yMin] = useSliderBlade(pane, {
        label: 'ymin',
        value: -1,
        min: -1,
        max: 1,
        step: 0.01,
      })
      const [yMax] = useSliderBlade(pane, {
        label: 'ymax',
        value: 1,
        min: -1,
        max: 1,
        step: 0.01,
      })
      const [zMin] = useSliderBlade(pane, {
        label: 'zmin',
        value: -1,
        min: -1,
        max: 1,
        step: 0.01,
      })
      const [zMax] = useSliderBlade(pane, {
        label: 'zmax',
        value: 1,
        min: -1,
        max: 1,
        step: 0.01,
      })

      const [flip] = usePaneInput(
        pane,
        'flip',
        {
          label: 'Invert values',
          value: false
        }
      )
  // We need to check if moving this outside of useMemo means it's creating a ton of materials. This was how it was done in THREE Journey when I was doing that, so I know it's not stricly speaking wrong
    const shaderMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: {
          map: { value: volTexture },
          cmap:{value: colormap},
          cameraPos: { value: new THREE.Vector3() },
          threshold: {value: threshold},
          scale: {value: shape},
          flatBounds:{value: new THREE.Vector4(xMin,xMax,yMin,yMax)},
          vertBounds:{value: new THREE.Vector2(zMin,zMax)},
          steps: { value: steps },
          flip: {value: flip }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });
        
  // Use geometry once, avoid recreating -- Using a sphere to avoid the weird angles you get with cube
    const geometry = useMemo(() => new THREE.IcosahedronGeometry(4, 8), []);

  return (
    <>
    <mesh ref={meshRef} geometry={geometry} scale={[1,flipY ? -1: 1,1]}>
      <primitive attach="material" object={shaderMaterial} />
    </mesh>
    </>
  )
}