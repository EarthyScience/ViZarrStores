import React, { useEffect } from 'react'
import { useState }, { useEffect } from 'react'
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import ComputeModule from '@/components/computation/ComputeModule'
import { ZarrDataset } from '../zarr/ZarrLoaderLRU'
import { createPaneContainer } from '@/components/ui'
import { useTweakpane, usePaneInput } from '@lazarusa/react-tweakpane'
import { OrbitControls } from '@react-three/drei'
import { variables } from '../zarr/ZarrLoaderLRU'
import { variables } from '../zarr/ZarrLoaderLRU'
import './Plots.css'

interface Array{
  data:number[],
  shape:number[],
  stride:number[]
}
interface Array{
  data:number[],
  shape:number[],
  stride:number[]
}
interface AnalysisParameters{

    values:{
      ZarrDS:ZarrDataset;
      cmap: THREE.DataTexture;
      shape: number[];
      canvasWidth:number;
      dimNames: string[];
      canvasWidth:number;
      dimNames: string[];
    }
}

const operations = [
          "Mean",
          "Min",
          "Max",
          "StDev"
          ]

interface ControlParams{
  dimNames: string[];
  showExecute:boolean;
  setters:{
    setFirstVariable: React.Dispatch<React.SetStateAction<string>>
    setSecondVariable: React.Dispatch<React.SetStateAction<string>>
    setExecute: React.Dispatch<React.SetStateAction<boolean>>
    setAxis: React.Dispatch<React.SetStateAction<number>>
    setOperation: React.Dispatch<React.SetStateAction<string>>
  }
}

function ControlFace({dimNames,showExecute,setters}:ControlParams){
  const{setSecondVariable,setFirstVariable,setExecute,setAxis,setOperation} = setters;
  return(
    <div className='analysis-ui'>
      <div className='analysis-item'>
        <label htmlFor="firstVar">Variable</label>
        <select name="firstVar" id="firstVar" onChange={(e)=>setFirstVariable(e.target.value)}>
        <option value={"Default"} key={`firstVar_default`}>Default</option>
          {variables.map((val,idx)=>(
            <option value={val} key={`firstVar${idx}`}>{val}</option>
          ))}
        </select>
      </div>
      <div className='analysis-item'>
        <label htmlFor="operation">Operation</label>
        <select name="operation" id="operation" onChange={e=>setOperation(e.target.value)}>
          {operations.map((val,idx)=>(
            <option value={val} key={`operation${idx}`}>{val}</option>
          ))}
        </select>
      </div>
      {dimNames && <div className='analysis-item' >
        <label htmlFor="axis">Axis</label>
        <select name="axis" id="axis" onChange={e=>setAxis(parseInt(e.target.value))}>
          {dimNames.map((val,idx)=>(
            <option value={idx} key={`dims${idx}`}>{val}</option>
          ))}
        </select>
      </div>}
       <div className='analyze'>
        {showExecute && <button onClick={()=>setExecute(x=>!x)}>
          Calculate
        </button>}
      </div>
    </div>
  )
}

const operations = [
          "Mean",
          "Min",
          "Max",
          "StDev"
          ]

interface ControlParams{
  dimNames: string[];
  showExecute:boolean;
  setters:{
    setFirstVariable: React.Dispatch<React.SetStateAction<string>>
    setSecondVariable: React.Dispatch<React.SetStateAction<string>>
    setExecute: React.Dispatch<React.SetStateAction<boolean>>
    setAxis: React.Dispatch<React.SetStateAction<number>>
    setOperation: React.Dispatch<React.SetStateAction<string>>
  }
}

function ControlFace({dimNames,showExecute,setters}:ControlParams){
  const{setSecondVariable,setFirstVariable,setExecute,setAxis,setOperation} = setters;
  return(
    <div className='analysis-ui'>
      <div className='analysis-item'>
        <label htmlFor="firstVar">Variable</label>
        <select name="firstVar" id="firstVar" onChange={(e)=>setFirstVariable(e.target.value)}>
        <option value={"Default"} key={`firstVar_default`}>Default</option>
          {variables.map((val,idx)=>(
            <option value={val} key={`firstVar${idx}`}>{val}</option>
          ))}
        </select>
      </div>
      <div className='analysis-item'>
        <label htmlFor="operation">Operation</label>
        <select name="operation" id="operation" onChange={e=>setOperation(e.target.value)}>
          {operations.map((val,idx)=>(
            <option value={val} key={`operation${idx}`}>{val}</option>
          ))}
        </select>
      </div>
      {dimNames && <div className='analysis-item' >
        <label htmlFor="axis">Axis</label>
        <select name="axis" id="axis" onChange={e=>setAxis(parseInt(e.target.value))}>
          {dimNames.map((val,idx)=>(
            <option value={idx} key={`dims${idx}`}>{val}</option>
          ))}
        </select>
      </div>}
       <div className='analyze'>
        {showExecute && <button onClick={()=>setExecute(x=>!x)}>
          Calculate
        </button>}
      </div>
    </div>
  )
}

export const Analysis = ({values}:AnalysisParameters) => {
  const {ZarrDS, cmap, shape, canvasWidth,dimNames} = values

  const [execute , setExecute] = useState<boolean>(false)
  const [firstVar, setFirstVar] = useState<string>("Default")
  const [secondVar, setSecondVar] = useState<string>("Default")
  const [axis, setAxis] = useState<number>(0);
  const [operation,setOperation] = useState<string>("Mean");
  const [array , setArray] = useState<Array | null>(null)
  const [showExecute,setShowExecute] = useState<boolean>(false)

  useEffect(()=>{
    setShowExecute(false)
    if (firstVar !== "Default"){
      ZarrDS.GetArray(firstVar).then(result=>{setArray(result); setShowExecute(true)})
    }
    
  },[firstVar])

  // const paneContainer = createPaneContainer("analysis-tp")
  // const pane = useTweakpane({
  //   operation:"mean",
  //   firstVar:"Default"
  // },
  // {
  //   title:"Analysis",
  //   container:paneContainer ?? undefined,
  //   expanded:true
  // }
  // )

  // const [operation] = usePaneInput(pane,"operation",
  //   {
  //     label:"Operation",
  //     options:[
  //       {
  //         text:"Mean",
  //         value:"mean"
  //       },
  //       {
  //         text:"Min",
  //         value:"min"
  //       }
  //     ]
  //   }

  // )

  const stateVars = {
    operation,
    axis,
    execute
  }

  const setters={
    setExecute,
    setOperation,
    setAxis,
    setFirstVariable:setFirstVar,
    setSecondVariable:setSecondVar,
    setShowExecute
  }
  const stateVars = {
    operation,
    axis,
    execute
  }

  const setters={
    setExecute,
    setOperation,
    setAxis,
    setFirstVariable:setFirstVar,
    setSecondVariable:setSecondVar,
    setShowExecute
  }

  return (
    <div className='analysis-canvas'
      style={{
        width:canvasWidth,
        background:"#2c3d4f"
      }}
    >
      <ControlFace dimNames={dimNames} setters={setters} showExecute={showExecute} />
      <ControlFace dimNames={dimNames} setters={setters} showExecute={showExecute} />
      <Canvas
        camera={{ position: [0, 0, 50], zoom:5}}
        camera={{ position: [0, 0, 50], zoom:5}}
        orthographic
      >
        {/* <mesh>
        {/* <mesh>
          <planeGeometry />
          <meshBasicMaterial color={"red"} />
        </mesh> */}
        {array && <ComputeModule array={array} cmap={cmap} stateVars={stateVars}/>}
        <axesHelper scale={10} />
        </mesh> */}
        {array && <ComputeModule array={array} cmap={cmap} stateVars={stateVars}/>}
        <axesHelper scale={10} />
        <OrbitControls 
          enablePan={true}
          enableRotate={true}
          enableRotate={true}
        
        />
      </Canvas>
    </div>
  )
}
