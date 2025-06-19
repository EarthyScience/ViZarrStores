import React from 'react';
import * as THREE from 'three';
import { useGlobalStore } from '@/utils/GlobalStates';
import { useShallow } from 'zustand/shallow';
import { Edges } from '@react-three/drei'

function Sides({shape, width, thickness=0.01, rotation=new THREE.Vector3(0, 0, 0)} : {shape : THREE.Vector2, width : number, thickness? : number, rotation? : THREE.Vector3}){

    return (
        <>
        <group rotation={rotation.toArray()}>        
            <group position={[0,width/2,0]} >
                <mesh position={[shape.y/2, 0, 0]}>
                    <boxGeometry args={[thickness, thickness, shape.x]} />
                    <meshBasicMaterial color="white"  />
                </mesh>
                <mesh position={[-shape.y/2, 0, 0]}>
                    <boxGeometry args={[thickness, thickness, shape.x]} />
                    <meshBasicMaterial color="white"  />
                </mesh>

                <mesh position={[0, 0, shape.x/2]}>
                    <boxGeometry args={[shape.y, thickness, thickness]} />
                    <meshBasicMaterial color="white"  />
                </mesh>
                <mesh position={[0, 0, -shape.x/2]}>
                    <boxGeometry args={[shape.y, thickness, thickness]} />
                    <meshBasicMaterial color="white"  />
                </mesh>
            </group>
            <group position={[0,-width/2,0]}>
                <mesh position={[shape.y/2, 0, 0]}>
                    <boxGeometry args={[thickness, thickness, shape.x]} />
                    <meshBasicMaterial color="white"  />
                </mesh>
                <mesh position={[-shape.y/2, 0, 0]}>
                    <boxGeometry args={[thickness, thickness, shape.x]} />
                    <meshBasicMaterial color="white"  />
                </mesh>

                <mesh position={[0, 0, shape.x/2]}>
                    <boxGeometry args={[shape.y, thickness, thickness]} />
                    <meshBasicMaterial color="white"  />
                </mesh>
                <mesh position={[0, 0, -shape.x/2]}>
                    <boxGeometry args={[shape.y, thickness, thickness]} />
                    <meshBasicMaterial color="white"  />
                </mesh>
            </group>
        </group>
        </>
    )
}


function WireframeCube({shape} : {shape : THREE.Vector3}) {
    const newShape = shape.multiply(new THREE.Vector3(1.01, 1.01, 1.01))
  return (
    <>
        {/* Front Back */}
        <Sides shape={new THREE.Vector2(newShape.x, newShape.y)} width={newShape.z} rotation={new THREE.Vector3(Math.PI/2, Math.PI/2, 0)}/>

        {/* Sides */}
        <Sides shape={new THREE.Vector2(newShape.z, newShape.y)} width={newShape.x} rotation={new THREE.Vector3(0, 0, Math.PI/2)}/>
    </>
  )
}


const AxisBars = () => {
    const {shape, dimArrays, dimNames} = useGlobalStore(useShallow(state => ({
        shape: state.shape,
        dimArrays: state.dimArrays,
        dimNames: state.dimNames
    })))

  return (
    <WireframeCube shape={new THREE.Vector3(2, 1, 2)} />
  )
}

export {AxisBars}