'use client';
import * as THREE from 'three'
THREE.Cache.enabled = true;
import { ZarrDataset, variables } from '@/components/zarr/ZarrLoaderLRU'
import { useEffect, useState, useMemo } from 'react';
import { Analysis, PlotArea, Plot } from '@/components/plots';
import { GetColorMapTexture, colormaps } from '@/components/textures';
import { MiddleSlider } from '@/components/ui';
import { plotContext, DimCoords } from '@/components/contexts';
// import ComputeModule from '@/components/computation/ComputeModule'
import { usePaneInput, usePaneFolder, useTweakpane, useButtonBlade } from '@lazarusa/react-tweakpane'

interface Array{
  data:number[],
  shape:number[],
  stride:number[]
}

const storeURL = "https://s3.bgc-jena.mpg.de:9000/esdl-esdc-v3.0.2/esdc-16d-2.5deg-46x72x1440-3.0.2.zarr"
// const storeURL = "https://s3.waw3-2.cloudferro.com/wekeo/egu2025/OLCI_L1_CHL_cube.zarr"
// const variables = await GetVariables(storeURL)
// console.log(variables)
// const storeURL = "https://s3.bgc-jena.mpg.de:9000/misc/seasfire_v0.4.zarr"



function Loading({showLoading}:{showLoading:boolean}){
  return(
    <div className='messages'>
      {showLoading && <div className='loading'>
        Loading...
      </div>}
    </div>
  )
}

export function CanvasGeometry() {
  // const paneRef = useRef<HTMLDivElement>(null);
  const optionsVars = useMemo(() => variables.map((element) => ({
    text: element,
    value: element
  })), []);
  const colormaps_array = useMemo(() => colormaps.map(colormap => ({
    text: colormap,
    value: colormap
  })), []);

  const pane = useTweakpane(
    {
      backgroundcolor: "#292b32",
      vName: "Default",
      plottype: "volume",
      cmap: "Spectral",
      flipCmap: false,
    },
    {
      title: 'Data settings',
      expanded: true,
    }
  );

  const [bgcolor] = usePaneInput(pane, 'backgroundcolor', {
    label: 'bgcolor',
    value: '#292b32'
  })
  const [variable] = usePaneInput(pane, 'vName', {
    label: 'Plot Variable',
    options: [
      {
        text: 'Default',
        value: 'Default',
      },
    ...optionsVars
  ],
    value: 'Default'
  })

  const [plotType] = usePaneInput(pane, 'plottype', {
    label: 'Plot type',
    options: [
      {
        text: 'volume',
        value: 'volume',
      },
      {
        text: 'point-cloud',
        value: 'point-cloud',
      },
    ],
    value: 'point-cloud'
  })

  const [cmap] = usePaneInput(pane, 'cmap', {
    label: 'colormap',
    options: colormaps_array,
    value: 'Spectral'
  })

  const [flipCmap] = usePaneInput(pane, 'flipCmap', {
    label: 'Invert colors',
    options: [
      {
        text: 'on',
        value: true,
      },
      {
        text: 'off',
        value: false,
      },
    ],
    value: false
  })


  const [shape, setShape] = useState<THREE.Vector3 | THREE.Vector3>(new THREE.Vector3(2, 2, 2))
  const [valueScales,setValueScales] = useState({maxVal:1,minVal:-1})
  const [colormap,setColormap] = useState<THREE.DataTexture>(GetColorMapTexture())
  const [timeSeries, setTimeSeries] = useState<number[]>([0]);
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [metadata,setMetadata] = useState<object[] | null>(null)
  const [dataArray, setDataArray] = useState<Array | null>(null)
  
  //Timeseries Plotting Information
  const [dimArrays,setDimArrays] = useState<number[][]>([[0],[0],[0]])
  const [dimNames,setDimNames] = useState<string[]>(["default"])
  const [dimUnits,setDimUnits] = useState<string[]>(["Default"]);
  const [dimCoords, setDimCoords] = useState<DimCoords>();
  const [plotDim,setPlotDim] = useState<number>(0)
  const ZarrDS = useMemo(()=>new ZarrDataset(storeURL),[])

  //Analysis variables
  const [reduceAxis, setReduceAxis] = useState<number>(0);
  const [reduceOperation, setReduceOperation] = useState<string>("Mean")
  const [executeReduction,setExecuteReduction] = useState<boolean>(false)
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false)

  const [canvasWidth, setCanvasWidth] = useState<number>(0)

  useEffect(() => {
    setCanvasWidth(Math.round(window.innerWidth * 0.4))
  }, [])

  //Camera states
  // const [resetCamera, setResetCamera] = useState<boolean>(false)

  // useButtonBlade(pane, {
  //   title: "Reset Camera",
  //   label: "Reset Camera"
  // } , ()=>setResetCamera(true))

  useEffect(()=>{
    setColormap(GetColorMapTexture(colormap,cmap,1,"#000000",0,flipCmap));
  },[cmap, colormap,flipCmap])

  //These values are passed to the Plot Component
  const plotObj = {
    values:{
      plotType,
      colormap,
      ZarrDS,
      variable,
      shape,
      bgcolor,
      canvasWidth
    },
    setters:{
      setShowLoading,
      setDataArray,
      setValueScales,
      setShape,
      setMetadata,
      setDimArrays,
      setDimNames,
      setDimUnits,
    }
  }

  const timeSeriesObj ={
    setters:{
      setTimeSeries,
      setPlotDim,
      setDimCoords
    },
    values:{
      ZarrDS,
      shape,
      dimArrays,
      dimNames,
      dimUnits
    }
  }

  const defaultDimCoords: DimCoords = {
    first: { name: "", loc: 0, units: "" },
    second: { name: "", loc: 0, units: "" },
    plot: { units: "" }
  };

//This is the data being passed down the plot tree
  const lineObj = {
    coords: dimCoords ?? defaultDimCoords,
    plotDim,
    dimNames,
    dimUnits,
    dimArrays,
    plotUnits:metadata ? (metadata as any).units : "Default",
    yRange:[valueScales.minVal,valueScales.maxVal],
    timeSeries,
    scaling:{...valueScales,colormap}
  } 

  const analysisSetters = {
    setAxis:setReduceAxis,
    setOperation:setReduceOperation,
    setExecute:setExecuteReduction
  }

  const analysisVars = {
    axis:reduceAxis,
    operation:reduceOperation,
    execute:executeReduction
  }

  const analysisObj = {
    setters:{

    },
    values:{
      ZarrDS,
      cmap:colormap,
      shape:shape.toArray(),
      canvasWidth,
      dimNames
    }
  }

  return (
    <>
    <MiddleSlider canvasWidth={canvasWidth} setCanvasWidth={setCanvasWidth}/>
    <Loading showLoading={showLoading} />
    <Analysis values={analysisObj.values} />
    <Plot values={plotObj.values} setters={plotObj.setters} timeSeriesObj={timeSeriesObj} /> 
    {/* {metadata && <Metadata data={metadata} /> } */}

    <plotContext.Provider value={lineObj} >
      {timeSeries.length > 2 && <PlotArea />}
    </plotContext.Provider>

    <button
      style={{
        position:'fixed',
        left:'4rem',
        top:'0.5rem'
      }}
      onClick={()=>setShowAnalysis(x=>!x)}
    >
      {/* {showAnalysis ? 'Hide' : 'Show' } Analysis Stuff */}
    </button>
    </>
  )
}

export default CanvasGeometry