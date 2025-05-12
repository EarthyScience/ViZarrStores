import { OrbitControls } from '@react-three/drei';
import React from 'react';
import { useState, useEffect, useContext } from 'react';
import * as THREE from 'three';
import { PointCloud, UVCube, DataCube } from '@/components/plots';
import { Canvas, useThree } from '@react-three/fiber';
import { ArrayToTexture, DefaultCubeTexture } from '@/components/textures';
import { zarrContext } from '../contexts/ZarrContext';
import useGlobals from '@/utils/useGlobals';


interface PlotParameters{
    values:{
        plotType:string;
        colormap:THREE.DataTexture;
        variable:string;
        shape:THREE.Vector3;
        bgcolor:string;
        canvasWidth:number
    },
    setters:{
      setShowLoading: React.Dispatch<React.SetStateAction<boolean>>;
    }
}


const Plot = ({values,setters}:PlotParameters) => {
    const globals = useGlobals()
    const {setValueScales,setShape,setMetadata,setDimArrays,setDimNames,setDimUnits} = globals.setters;
    const {shape,colormap} = globals.values;
    const {plotType,variable,bgcolor,canvasWidth} = values;
    const ZarrDS = useContext(zarrContext)

    const {setShowLoading} = setters;
    const [texture, setTexture] = useState<THREE.DataTexture | THREE.Data3DTexture | null>(null)
    const [currentBg, setCurrentBg] = useState(bgcolor || 'var(--background)')
    const [flipY, setFlipY] = useState<boolean>(false)
    
    const [windowWidth, setWindowWidth] = useState<number>(0);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Listen for theme changes
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    setCurrentBg('var(--background)')
                }
            })
        })
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        })

        return () => observer.disconnect()
    }, [])

    // Update background when bgcolor changes
    useEffect(() => {
        setCurrentBg(bgcolor || 'var(--background)')
    }, [bgcolor])

  //DATA LOADING
  useEffect(() => {
    if (variable != "Default" && ZarrDS) {
      setShowLoading(true);
      //Need to add a check somewhere here to swap to 2D or 3D based on shape. Probably export two variables from GetArray
      ZarrDS.GetArray(variable).then((result) => {
        // result now contains: { data: TypedArray, shape: number[], dtype: string }
        const [texture, scaling] = ArrayToTexture({
          data: result.data,
          shape: result.shape
        })
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
        if (dimArrs[1][1] < dimArrs[1][0])
          {setFlipY(true)}
        else
          {setFlipY(false)}
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
        const texture = DefaultCubeTexture();
        // again need to check type before using it
        if (texture instanceof THREE.Data3DTexture || texture instanceof THREE.DataTexture) {
          setTexture(texture);
        }
        setShape(new THREE.Vector3(2, 2, 2))
        setMetadata(null)
      }
  }, [variable])


  return (
    <div className='main-canvas'
      style={{
        width: windowWidth - canvasWidth         
      }}
    >
        <Canvas camera={{ position: [-4.5, 3, 4.5], fov: 50 }}
        frameloop="demand"
        style={{
        background: currentBg
        }}
        >
            {/* Volume Plots */}
            {plotType == "volume" && <>
            <DataCube volTexture={texture} shape={shape} colormap={colormap} flipY={flipY}/>
            <UVCube />
            </>}
            {/* Point Clouds */}
            {plotType == "point-cloud" && <PointCloud textures={{texture,colormap}} />}

            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} enablePan={false}
            maxDistance={50}
            />
        </Canvas>
    </div>
  )
}

export {Plot}
