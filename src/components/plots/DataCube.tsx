import {  useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from '@/components/textures/shaders';
import { usePaneInput, usePaneFolder, useSliderBlade, useTweakpane } from '@lazarusa/react-tweakpane'
import { createPaneContainer } from '@/components/ui';
import { useGlobalStore, usePlotStore } from '@/utils/GlobalStates';
import { useShallow } from 'zustand/shallow';
import { useFrame, useThree } from '@react-three/fiber';

interface DataCubeProps {
  volTexture: THREE.Data3DTexture | THREE.DataTexture | null,
}

export const DataCube = ({ volTexture }: DataCubeProps ) => {


    const {shape, colormap, flipY} = useGlobalStore(useShallow(state=>({shape:state.shape, colormap:state.colormap, flipY:state.flipY}))) //We have to useShallow when returning an object instead of a state. I don't fully know the logic yet
    const {valueRange, xRange, yRange, zRange, quality, animate, resetAnim, cScale, cOffset} = usePlotStore(useShallow(state => ({
      valueRange: state.valueRange,
      xRange: state.xRange,
      yRange: state.yRange,
      zRange: state.zRange,
      quality: state.quality,
      animate: state.animate,
      resetAnim: state.resetAnim,
      cScale: state.cScale,
      cOffset: state.cOffset
    })))
    const [animateProg, setAnimateProg] = useState<number>(0)
  // We need to check if moving this outside of useMemo means it's creating a ton of materials. This was how it was done in THREE Journey when I was doing that, so I know it's not stricly speaking wrong
    const shaderMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: {
          map: { value: volTexture },
          cmap:{value: colormap},
          cOffset:{value: cOffset},
          cScale: {value: cScale},
          cameraPos: { value: new THREE.Vector3() },
          threshold: {value: new THREE.Vector2(valueRange[0],valueRange[1])},
          scale: {value: shape},
          flatBounds:{value: new THREE.Vector4(xRange[0],xRange[1],zRange[0],zRange[1])},
          vertBounds:{value: new THREE.Vector2(yRange[0]/shape.x,yRange[1]/shape.x)},
          steps: { value: quality },
          animateProg: {value: animateProg}
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

    useFrame(()=>{
      if (animate){
        const newProg = animateProg + 0.001
        setAnimateProg(newProg % 1.)
      }
    })

    useEffect(() => {
      return () => {
        geometry.dispose(); // Dispose when unmounted
      };
    }, []);

    useEffect(()=>{
      setAnimateProg(0)
    },[resetAnim])
  
  return (
    <>
    <mesh geometry={geometry} scale={[1,flipY ? -1: 1,1]}>
      <primitive attach="material" object={shaderMaterial} />
    </mesh>
    </>
  )
}