import * as THREE from 'three'
THREE.Cache.enabled = true;
import { Canvas } from '@react-three/fiber';
import { Center, OrbitControls, Environment } from '@react-three/drei'
import { variables, ZarrDataset } from '@/components/ZarrLoaderLRU'
import { useEffect, useState, useMemo } from 'react';
import { useControls } from 'leva'
import { PointCloud, UVCube, PlotArea, DataCube } from './PlotObjects';
import { GetColorMapTexture, ArrayToTexture, DefaultCube, colormaps } from './Textures';
import { Metadata, AnalysisWindow } from './UI';
import { plotContext, DimCoords } from './Contexts';
import ComputeModule from '@/components/Computation/ComputeModule'

interface Array{
  data:number[],
  shape:number[],
  stride:number[]
}

const storeURL = "https://s3.bgc-jena.mpg.de:9000/esdl-esdc-v3.0.2/esdc-16d-2.5deg-46x72x1440-3.0.2.zarr"

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
  const { variable, plotter, cmap, flipCmap } = useControls({ 
    variable: { 
      value: "Default", 
      options: variables, 
      label:"Select Variable" 
    },
    plotter: {
      value:"volume",
      options:["volume","point-cloud"],
      label:"Select Plot Style"
    },
    cmap: {
      value: "Spectral",
      options:colormaps,
      label: 'ColorMap'
  }, 
  flipCmap:{
    value:false,
    label:"Invert Colors"

  }
  })

  const [texture, setTexture] = useState<THREE.DataTexture | THREE.Data3DTexture | null>(null) //Main Texture
  const [shape, setShape] = useState<THREE.Vector3 | THREE.Vector3>(new THREE.Vector3(2, 2, 2))
  const [valueScales,setValueScales] = useState({maxVal:1,minVal:-1})
  const [colormap,setColormap] = useState<THREE.DataTexture>(GetColorMapTexture())
  const [timeSeries, setTimeSeries] = useState<number[]>([0]);
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [metadata,setMetadata] = useState<object[] | null>(null)
  const [dataArray, setDataArray] = useState<Array | null>(null)
  
  //Timeseries Plotting Information
  const [dimArrays,setDimArrays] = useState([[0],[0],[0]])
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

  useEffect(()=>{
    setColormap(GetColorMapTexture(colormap,cmap,1,"#000000",0,flipCmap));
  },[cmap, colormap,flipCmap])

  //DATA LOADING
  useEffect(() => {
    if (variable != "Default") {
      setShowLoading(true);
      //Need to add a check somewhere here to swap to 2D or 3D based on shape. Probably export two variables from GetArray
      ZarrDS.GetArray(variable).then((result) => {
        // result now contains: { data: TypedArray, shape: number[], dtype: string }
        const [texture, shape, scaling] = ArrayToTexture({
          data: result.data,
          shape: result.shape
        })
        setDataArray(result)
        console.log(`logging the shape since we will want to use it in the future for 2D vs 3D actions ${shape}`)
        if (texture instanceof THREE.DataTexture || texture instanceof THREE.Data3DTexture) {
          setTexture(texture)
        } else {
          console.error("Invalid texture type returned from ArrayToTexture");
          setTexture(null);
        }
        if (
          typeof scaling === 'object' &&
          'maxVal' in scaling &&
          'minVal' in scaling
        ) {
          setValueScales(scaling as { maxVal: number; minVal: number });
        }
        const shapeRatio = result.shape[1] / result.shape[2] * 2;
        setShape(new THREE.Vector3(2, shapeRatio, 2));
        setShowLoading(false)
      })
      //Get Metadata
      ZarrDS.GetAttributes(variable).then((result)=>{
        setMetadata(result);
        const [dimArrs, dimMetas] = ZarrDS.GetDimArrays()
        setDimArrays(dimArrs)
        const dimNames = []
        const tempDimUnits = []
        for (const meta of dimMetas){
          dimNames.push(meta.standard_name)
          tempDimUnits.push(meta.units)
        }
        setDimNames(dimNames)
        setDimUnits(tempDimUnits)
      })

    }
      else{
        const texture = DefaultCube();
        // again need to check type before using it
        if (texture instanceof THREE.Data3DTexture || texture instanceof THREE.DataTexture) {
          setTexture(texture);
        }
        setShape(new THREE.Vector3(2, 2, 2))
        setMetadata(null)
      }
  }, [variable])

  //These are passed to the UVCube (will be renamed) to extract the timeseries info
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
  const plotObj = {
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
  return (
    <>
    
    <Loading showLoading={showLoading} />
    <div className='canvas'>
      <Canvas shadows camera={{ position: [-4.5, 3, 4.5], fov: 50 }}
      frameloop="demand"
      >
        
        <Center top position={[-1, 0, 1]}/>
        {dataArray && showAnalysis && <ComputeModule array={dataArray} cmap={colormap} shape={shape.toArray()} stateVars={analysisVars}/>}
        {/* Volume Plots */}
        {plotter == "volume" && <>
          <DataCube volTexture={texture} shape={shape} colormap={colormap}/>
          <UVCube {...timeSeriesObj} />
        </>}
        {/* Point Clouds Plots */}
        {plotter == "point-cloud" && <PointCloud textures={{texture,colormap}} />}
        
        {/* Time Series Plots */}
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} enablePan={false}/>
        <Environment preset="city" />
        
      </Canvas>
    </div>
    {showAnalysis && <AnalysisWindow setters={analysisSetters}/>}
    {metadata && <Metadata data={metadata} /> }

    <plotContext.Provider value={plotObj} >
      
      {variable !== "Default" && <PlotArea />}
    </plotContext.Provider>
   
    {/* <Leva theme={lightTheme} /> */}
    <button
      style={{
        position:'fixed',
        left:'5%',
        top:'55%'
      }}
      onClick={()=>setShowAnalysis(x=>!x)}
    >
      {showAnalysis ? 'Hide' : 'Show' } Analysis Stuff
    </button>
    </>
  )
}

export default CanvasGeometry