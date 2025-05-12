'use client';
import * as THREE from 'three'
THREE.Cache.enabled = true;
import { ZarrDataset } from '@/components/zarr/ZarrLoaderLRU'
import { GetZarrMetadata, GetVariableNames } from  '@/components/zarr/GetMetadata'
import { useEffect, useState, useMemo } from 'react';
import { Analysis, PlotArea, Plot } from '@/components/plots';
import { GetColorMapTexture, colormaps } from '@/components/textures';
import { createPaneContainer, MiddleSlider } from '@/components/ui';
import { plotContext, DimCoords } from '@/components/contexts';
import { Metadata, ShowAnalysis } from '@/components/ui';
import { zarrContext } from './contexts/ZarrContext';
// import ComputeModule from '@/components/computation/ComputeModule'
import { usePaneInput, usePaneFolder, useTweakpane, useButtonBlade, useTextBlade } from '@lazarusa/react-tweakpane'
import useGlobals from '@/utils/useGlobals';


interface Array{
  data:number[],
  shape:number[],
  stride:number[]
}


const storeURL = "https://s3.bgc-jena.mpg.de:9000/misc/seasfire_rechunked.zarr"
// const storeURL = "https://s3.bgc-jena.mpg.de:9000/esdl-esdc-v3.0.2/esdc-16d-2.5deg-46x72x1440-3.0.2.zarr"
const zarrMetadata = await GetZarrMetadata(storeURL)
console.log(zarrMetadata)
const variables = GetVariableNames(zarrMetadata)
// console.log(variables)

// const storeURL = "https://s3.waw3-2.cloudferro.com/wekeo/egu2025/OLCI_L1_CHL_cube.zarr"
// const variables = await GetVariables(storeURL)
// console.log(variables)
// const storeURL = "https://s3.bgc-jena.mpg.de:9000/misc/seasfire_v0.4.zarr"



function Loading({showLoading}:{showLoading:boolean}){
  return (
    showLoading && <div className='loading'>
    Loading
    </div>
  )
}

export function CanvasGeometry() {
  const [flipCmap, setFlipCmap] = useState<boolean>(false)
  const {values, setters} = useGlobals();
  const {timeSeries, colormap} = values;
  const {setColormap} = setters;
  useEffect(()=>{
    console.log("TS Update")
  },[timeSeries])
  const optionsVars = useMemo(() => variables.map((element) => ({
    text: element,
    value: element
  })), []);
  const colormaps_array = useMemo(() => colormaps.map(colormap => ({
    text: colormap,
    value: colormap
  })), []);
  const paneContainer = createPaneContainer("data-settings-pane");

  const pane = useTweakpane(
    {
      backgroundcolor: "#292b32",
      storeURL: 'https://s3.bgc-jena.mpg.de:9000/esdl-esdc-v3.0.2/esdc-16d-2.5deg-46x72x1440-3.0.2.zarr',
      vName: "Default",
      plottype: "volume",
      cmap: "Spectral",
      flipCmap: false,
    },
    {
      title: 'Data settings',
      container: paneContainer ?? undefined,
      expanded: false,
    }
  );

  const [bgcolor] = usePaneInput(pane, 'backgroundcolor', {
    label: 'bgcolor',
    value: '#292b32'
  })

  usePaneInput(pane, 'storeURL', {
    label: 'Store URL',
    options: [
      {
        text: 'ESDC',
        value: 'https://s3.bgc-jena.mpg.de:9000/esdl-esdc-v3.0.2/esdc-16d-2.5deg-46x72x1440-3.0.2.zarr',
      },
      {
        text: 'Seasfire ',
        value: 'https://s3.bgc-jena.mpg.de:9000/misc/seasfire_rechunked.zarr',
      },
    ],
    value: 'https://s3.bgc-jena.mpg.de:9000/esdl-esdc-v3.0.2/esdc-16d-2.5deg-46x72x1440-3.0.2.zarr'
});

// TODO: update variables when custom store is selected
  const [customStore] = useTextBlade(pane, {
    label: 'Custom Store',
    value: 'Setup your own store',
    parse: (value) => value,
    format: (value) => value,
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

  useButtonBlade(pane,{
    title:"Flip Colors"
  },()=>setFlipCmap(x=>!x))

  const [shape, setShape] = useState<THREE.Vector3 | THREE.Vector3>(new THREE.Vector3(2, 2, 2))
  const [valueScales,setValueScales] = useState({maxVal:1,minVal:-1})

  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [metadata,setMetadata] = useState<object[] | null>(null)
  
  //Timeseries Plotting Information
  const [dimArrays,setDimArrays] = useState<number[][]>([[0],[0],[0]])
  const [dimNames,setDimNames] = useState<string[]>(["default"])
  const [dimUnits,setDimUnits] = useState<string[]>(["Default"]);
  const [dimCoords, setDimCoords] = useState<DimCoords>();
  const [plotDim,setPlotDim] = useState<number>(0)

  const ZarrDS = useMemo(()=>{if (storeURL){ return new ZarrDataset(storeURL)}},[storeURL])

  // We will change this logic later on when the tweakpane is reactive

  const [canvasWidth, setCanvasWidth] = useState<number>(0)

  useEffect(() => {
    setCanvasWidth(Math.round(window.innerWidth * 0.0))
  }, [])

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

  const analysisObj = {
    setters:{

    },
    values:{
      ZarrDS,
      cmap:colormap,
      shape:shape.toArray(),
      canvasWidth,
      dimNames,
      valueScales
    }
  }

  return (
    <>
    <zarrContext.Provider value={ZarrDS} >
      {canvasWidth < 10 && <ShowAnalysis onClick={()=>setCanvasWidth(window.innerWidth*.5)} canvasWidth={canvasWidth} />}
      {canvasWidth > 10 && <MiddleSlider canvasWidth={canvasWidth} setCanvasWidth={setCanvasWidth}/>}
      <Loading showLoading={showLoading} />
      {canvasWidth > 10 && <Analysis variables={variables} />}
      <Plot values={plotObj.values} setters={plotObj.setters} />
      {metadata && <Metadata data={metadata} /> }

      <plotContext.Provider value={lineObj} >
        {timeSeries.length > 2 && <PlotArea />}
      </plotContext.Provider>
    </zarrContext.Provider>
    </>
  )
}

export default CanvasGeometry