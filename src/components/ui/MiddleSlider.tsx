'use client';

import React from 'react'
import { useState, useEffect } from 'react';
import './css/MiddleSlider.css'

interface MiddleParams{
    canvasWidth:number;
    setCanvasWidth:React.Dispatch<React.SetStateAction<number>>;
}

const MiddleSlider = ({canvasWidth,setCanvasWidth}:MiddleParams) => {
    const [screenWidth, setScreenWidth] = useState<number>(0);
    const [isResizing, setIsResizing] = useState<boolean>(false);

    useEffect(() => {
        setScreenWidth(window.innerWidth);
    }, []);
        
          // Start resizing on mousedown
        const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
          e.preventDefault(); // Prevent text selection
          setIsResizing(true);// Record starting height
        };
        
          // Adjust height on mousemove
          const handleMouseMove = (e: MouseEvent) => {
            if (isResizing) {
              e.preventDefault();
              setCanvasWidth(e.clientX)
            }
          };
        
          // Stop resizing on mouseup
          const handleMouseUp = () => {
            if (canvasWidth < screenWidth*0.2){
                setCanvasWidth(0)
            }
            if (canvasWidth > screenWidth*0.8){
                setCanvasWidth(screenWidth-10) //This 10 is the width of the middleslider. MAy need to adjust
            }
            setIsResizing(false);
          };
        
          // Add/remove document event listeners based on resizing state
          useEffect(() => {
            if (isResizing) {
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }
            return () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
          }, [isResizing]);
  return (
    <div className='middle-slider' 
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            style={{
              left:`${canvasWidth}px`,
            }}  
    />
  )
}

export {MiddleSlider}
