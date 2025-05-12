import React from 'react'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { GetColorMapTexture } from '@/components/textures'
import { ZarrDataset } from '@/components/zarr/ZarrLoaderLRU'

interface Coord {
    name: string; 
    loc: number;  
    units: string;
  }

export interface DimCoords {
  first: Coord;
  second: Coord;
  plot: Pick<Coord, "units">; // Only units
}

const useGlobals = () => {

    //Global Shape of Volume Plot
    const [shape, setShape] = useState<THREE.Vector3 | THREE.Vector3>(new THREE.Vector3(2, 2, 2))
    //Global Scale of Volume Plot. Use for 
    const [valueScales,setValueScales] = useState({maxVal:1,minVal:-1})

    const [colormap,setColormap] = useState<THREE.DataTexture>(GetColorMapTexture())
    //Timeseries data for lineplot
    const [timeSeries, setTimeSeries] = useState<number[]>([0]);

    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [metadata,setMetadata] = useState<object[] | null>(null)

    //Dimension arrays for line plot coordinates
    const [dimArrays,setDimArrays] = useState<number[][]>([[0],[0],[0]])
    const [dimNames,setDimNames] = useState<string[]>(["default"])
    const [dimUnits,setDimUnits] = useState<string[]>(["Default"]);

    //Coordinates of the selected point on the cube
    const [dimCoords, setDimCoords] = useState<DimCoords>();
    const [plotDim,setPlotDim] = useState<number>(0)


    //Whether to flip plots due to Y coordinates
    const [flipY, setFlipY] = useState<boolean>(false)

    const [canvasWidth, setCanvasWidth] = useState<number>(0)

  return {
    values:{
        shape,
        valueScales,
        colormap,
        timeSeries,
        showLoading,
        metadata,
        dimArrays,
        dimNames,
        dimUnits,
        dimCoords,
        plotDim,
        canvasWidth,
        flipY
    },
    setters:{
        setShape,
        setValueScales,
        setColormap,
        setTimeSeries,
        setShowLoading,
        setMetadata,
        setDimArrays,
        setDimNames,
        setDimUnits,
        setDimCoords,
        setPlotDim,
        setCanvasWidth,
        setFlipY,
    }

  }
}

export default useGlobals
