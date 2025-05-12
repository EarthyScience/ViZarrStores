
import * as THREE from 'three'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { plotContext } from '../contexts/PlotContext';
import { useFrame } from '@react-three/fiber';
import { createPaneContainer } from '../ui';
import { useButtonBlade, useSliderBlade, useTweakpane, usePaneInput } from '@lazarusa/react-tweakpane';
import useGlobals from '@/utils/useGlobals';

interface PlotLineProps {
  color?: string;
  lineWidth?: number;
  showPoints?: boolean;
  pointSize?: number;
  pointColor?: string;
  interpolation?: 'linear' | 'curved';
  height:number,
  pointSetters:pointSetters,
  yScale:number,
  xScale:number
}

interface pointSetters{
  setPointID:React.Dispatch<React.SetStateAction<number>>,
  setPointLoc:React.Dispatch<React.SetStateAction<number[]>>,
  setShowPointInfo:React.Dispatch<React.SetStateAction<boolean>>,
}

function PlotPoints({ points, pointSize, pointColor, pointSetters }: { points: THREE.Vector3[]; pointSize: number; pointColor:string, pointSetters:pointSetters }) {
  const ref = useRef<THREE.InstancedMesh | null>(null)
  const count = points.length
  const [_reRender,setreRender] = useState<boolean>(false)
  const {setPointID, setPointLoc,setShowPointInfo} = pointSetters;
  const [zoom,setZoom] = useState<number>(1)

  const geometry = useMemo(() => new THREE.SphereGeometry(pointSize), [pointSize])
  const material = useMemo(()=> new THREE.MeshBasicMaterial({color:pointColor}),[pointColor])

  useEffect(() => {
    if (ref.current){
      const dummy = new THREE.Object3D()
      for (let i = 0 ; i< count; i++){
        const position = points[i].toArray()
        dummy.position.set(...position)
        dummy.scale.set(1/zoom,1/zoom,1/zoom)
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      }
      ref.current.instanceMatrix.needsUpdate = true
    }
  }, [points,zoom,geometry, material])

  useFrame(({camera})=>{
    if (camera.zoom !== zoom){
      setZoom(camera.zoom)
    }
  })

  function scalePoint(e: any) {
    if (ref.current) {
      const dummy = new THREE.Object3D();
      const matrix = new THREE.Matrix4();
      ref.current.getMatrixAt(e.instanceId, matrix);
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(matrix);
      dummy.scale.set(3/zoom, 3/zoom, 3/zoom);
      dummy.position.copy(position);
      dummy.updateMatrix();
      ref.current.setMatrixAt(e.instanceId, dummy.matrix);
      ref.current.instanceMatrix.needsUpdate = true;
      setreRender((x) => !x);
      setPointID(e.instanceId)
      setPointLoc([e.clientX,e.clientY])
      setShowPointInfo(true)
    }
  }

  function restorePoint(){
    if (ref.current){
      const dummy = new THREE.Object3D();
      const matrix = new THREE.Matrix4()
      const position = new THREE.Vector3()
      for (let i=0; i<count;i++){
        ref.current.getMatrixAt(i,matrix)
        position.setFromMatrixPosition(matrix)
        dummy.scale.set(1/zoom,1/zoom,1/zoom)
        dummy.position.copy(position)
        dummy.updateMatrix()
        ref.current.setMatrixAt(i,dummy.matrix)
      }
      ref.current.instanceMatrix.needsUpdate = true
      setreRender(x=>!x)
      setShowPointInfo(false)
    }
  }

  return (
    <>
    <mesh onPointerEnter={scalePoint} onPointerLeave={restorePoint}>
    <instancedMesh ref={ref} args={[geometry, material, count]} />
    </mesh>
    </>
  )
}


export const PlotLine = ({ 
  height,
  pointSetters,
  yScale,
  xScale
}: PlotLineProps) => {

  const [showPoints,setShowPoints] = useState<boolean>(false)

  const paneContainer = createPaneContainer("line-plot-pane");

  const pane = useTweakpane(
    {
      pointColor: "#777777",
      interpolation: "linear"
    },
    {
      title: 'Line',
      container: paneContainer ?? undefined,
      expanded: true,
    }
  );

  useButtonBlade(pane,{
    title:`${showPoints ? "Hide" : "Show"} Points`

  },()=>setShowPoints(x=>!x))

  const [pointColor] = usePaneInput(pane, 'pointColor', {
    label: 'Point Color',
    value: '#2d4967'
  })

  const [pointSize] = useSliderBlade(pane, {
    label:"Point Size",
    value:5,
    min:1,
    max:20,
    step:1
  })

  const [interpolation] = usePaneInput(pane, 'interpolation', {
    label: "Line Interpolation",
    options:[
      {
        text:"Linear",
        value:'linear'
      },
      {
        text: "Curved",
        value:"curved"
      }
    ]
  })

  const [lineWidth] = useSliderBlade(pane, {
    label:"Line Width",
    value:5,
    min:1,
    max:20,
    step:1
  })

  const {values} = useGlobals()
  const {timeSeries} = values;
  const {scaling} = useContext(plotContext)
  const data = timeSeries
  console.log(data)
  //LinSpace to take up entire extent
  function linspace(start: number, stop: number, num: number): number[] {
    const step = (stop - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => start + step * i);
  }

  const {maxVal,minVal,colormap} = scaling;

  function duplicateArray(arr:number[], times:number) {
    return arr.flatMap(item => Array(times).fill(item));
  }

  const [points,normed] = useMemo(()=>{
    if (!data || data.length === 0) return [[new THREE.Vector3(0,0,0)],[0]];
    const viewWidth = window.innerWidth;
    const viewHeight = (window.innerHeight-height); //The 50 here is the footer at the bottom
    const xCoords = linspace(-viewWidth*xScale/2,viewWidth*xScale/2,data.length)
    const normed = data.map((i) => (i - minVal) / (maxVal - minVal));
    const points = normed.map((val,idx) => new THREE.Vector3(xCoords[idx], (val-.5)*viewHeight*yScale, 5)); 
    return [points,normed]
  }, [data, interpolation, height, yScale,xScale])

  const geometry = useMemo(() => {
    if (!data || data.length === 0) return null;
   // Choose interpolation method
    if (interpolation === 'curved') {
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(normed.length*5-1));
      geometry.setAttribute('normed', new THREE.Float32BufferAttribute(duplicateArray(normed,5), 1)); 
      return geometry;
  } else {
    // Linear interpolation - just connect the points directly
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setAttribute('normed', new THREE.Float32BufferAttribute(normed, 1));
    return geometry
  }
}, [points]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
                    glslVersion: THREE.GLSL3,
                    uniforms: {
                        cmap:{value: colormap},
                    },
                    vertexShader:`
                    varying float vNormed;
                    attribute float normed;

                    void main() {
                        vNormed = normed;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                    `,
                    fragmentShader:`
                    out vec4 Color;
                    uniform sampler2D cmap;
                    varying float vNormed;

                    void main() {
                        vec4 texColor = texture(cmap, vec2(vNormed, 0.5));
                        texColor.a = 2.;
                        // Color = vec4(1.,0.0,0.,1.);
                        Color = texColor;
                    }
                    `,
                    linewidth:lineWidth,
                    depthWrite: false,
        });
  }, [lineWidth]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <group>
      {geometry && <primitive object={new THREE.Line(geometry, material)}  />}
      {showPoints && <PlotPoints points={points} pointSize={pointSize} pointColor={pointColor} pointSetters={pointSetters}/>}
    </group>
  );
};