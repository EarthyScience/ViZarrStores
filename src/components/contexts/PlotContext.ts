import { createContext } from "react";
import * as THREE from 'three'

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


interface PlotContextType {
    coords: DimCoords;
    plotDim: number;
    dimNames:string[],
    dimUnits:string[],
    dimArrays: number[][];
    plotUnits:string;
    yRange: number[];
    timeSeries: number[];
    scaling: {
        colormap: THREE.DataTexture;
        maxVal: number;
        minVal: number;
    };
}
const plotObj = {
    coords: {
      first: {
        name: "DefaultName1",
        loc: 0,
        units: "meters",
      },
      second: {
        name: "DefaultName2",
        loc: 1,
        units: "meters",
      },
      plot: {
        units: "pixels",
      },
    },
    plotDim: 100, // Example dimension value
    dimNames:["Default","Default","Default"],
    dimUnits:["Default","Default","Default"],
    dimArrays: [[0, 1, 2], [3, 4, 5]], // Example array of arrays
    plotUnits:"Default",
    yRange: [0, 10], // Example range
    timeSeries: [1, 2, 3, 4, 5], // Example time series
    scaling: {
      colormap: new THREE.DataTexture(), // Example DataTexture instance
      maxVal: 100, // Example max value
      minVal: 0, // Example min value
    },
  };
  
export const plotContext = createContext<PlotContextType>(plotObj)

