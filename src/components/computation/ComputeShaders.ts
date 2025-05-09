'use client';
import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/Addons.js'
import { MeanFrag, MaxFrag, MinFrag, StDevFrag } from './shaders'


interface Array{
    data:number[],
    shape:number[],
    stride:number[]
}

export class OneArrayCompute{
    private shape: number[];
    private renderer: THREE.WebGLRenderer;
    private GPUCompute: GPUComputationRenderer;
    private texture: THREE.Data3DTexture | null;
    private targetAxis: number;
    private renderTarget: THREE.WebGLRenderTarget<THREE.Texture>;
    private initTexture: THREE.DataTexture

    constructor(array: Array, webGL:THREE.WebGLRenderer, scales: {maxVal:number,minVal:number}){
        this.shape = array.shape;
        this.renderer = webGL
        this.GPUCompute = new GPUComputationRenderer(10,10,this.renderer)
        this.initTexture = this.GPUCompute.createTexture()
        this.targetAxis = 5;
        this.renderTarget = this.GPUCompute.createRenderTarget(10,10,THREE.ClampToEdgeWrapping,THREE.ClampToEdgeWrapping,1006,1006);

        const size = array.shape[0]*array.shape[1]*array.shape[2]
        const newArray = new Uint8Array(size)

        const {minVal ,maxVal} = scales
        for (let i = 0; i<size; i++){
            const newVal = ((array.data[i]-minVal)/(maxVal-minVal))*254
            newArray[i] = isNaN(array.data[i]) ? 255 : newVal
        }
        this.texture = new THREE.Data3DTexture(newArray,this.shape[2],this.shape[1],this.shape[0])
        this.texture.format = THREE.RedFormat;
        this.texture.minFilter = THREE.NearestFilter;
        this.texture.magFilter = THREE.NearestFilter;
        this.texture.needsUpdate = true;
    }
    private initAxis(axis:number){
        const resolution = this.shape.filter((_val,idx)=> idx !== axis)
        this.GPUCompute = new GPUComputationRenderer(resolution[0],resolution[1],this.renderer)
        this.targetAxis = axis;
        this.renderTarget = this.GPUCompute.createRenderTarget(resolution[0],resolution[1],THREE.ClampToEdgeWrapping,THREE.ClampToEdgeWrapping,1006,1006)
        this.renderTarget.texture.minFilter = THREE.NearestFilter;
        this.renderTarget.texture.magFilter = THREE.NearestFilter;
        this.renderTarget.texture.needsUpdate = true;
    }
    private performReduction(axis: number, fragShader: any): THREE.Texture {
        if (axis !== this.targetAxis) {
            this.initAxis(axis);
        }
        const reducer = this.GPUCompute.addVariable("reduction", fragShader, this.initTexture);
        reducer.material.uniforms["dataArray"] = { value: this.texture };
        reducer.material.uniforms["axisSize"] = { value: this.shape[this.targetAxis] };
        reducer.material.uniforms["axis"] = { value: this.targetAxis };
        
        this.GPUCompute.doRenderTarget(reducer.material, this.renderTarget);
        return this.renderTarget.texture;
    }

    Mean(axis: number): THREE.Texture {
        const result = this.performReduction(axis, MeanFrag);
        return result;
    }
    
    Max(axis: number): THREE.Texture {
        return this.performReduction(axis, MaxFrag);
    }
    
    Min(axis: number): THREE.Texture {
        return this.performReduction(axis, MinFrag);
    }
    
    StDev(axis: number): THREE.Texture {
        return this.performReduction(axis, StDevFrag);
    }
}

export class TwoArrayCompute{
    private shape: number[];
    private renderer: THREE.WebGLRenderer;
    private GPUCompute: GPUComputationRenderer;
    private textureOne: THREE.Data3DTexture | null;
    private textureTwo: THREE.Data3DTexture | null;
    private targetAxis: number;
    private renderTarget: THREE.WebGLRenderTarget<THREE.Texture>;
    private initTexture: THREE.DataTexture

    constructor(arrays: {firstArray:Array,secondArray:Array}, webGL:THREE.WebGLRenderer, scales: {maxVal:number,minVal:number}){
        const {firstArray,secondArray} = arrays;
        this.shape = firstArray.shape;
        this.renderer = webGL
        this.GPUCompute = new GPUComputationRenderer(10,10,this.renderer)
        this.initTexture = this.GPUCompute.createTexture()
        this.targetAxis = 5;
        this.renderTarget = this.GPUCompute.createRenderTarget(10,10,THREE.ClampToEdgeWrapping,THREE.ClampToEdgeWrapping,1006,1006);
        const size = firstArray.shape[0]*firstArray.shape[1]*firstArray.shape[2]
        const newArray = new Uint8Array(size)

        const {minVal ,maxVal} = scales
        for (let i = 0; i<size; i++){
            const newVal = ((firstArray.data[i]-minVal)/(maxVal-minVal))*254
            newArray[i] = isNaN(firstArray.data[i]) ? 255 : newVal
        }
        this.textureOne = new THREE.Data3DTexture(newArray,this.shape[2],this.shape[1],this.shape[0])
        this.textureOne.format = THREE.RedFormat;
        this.textureOne.minFilter = THREE.NearestFilter;
        this.textureOne.magFilter = THREE.NearestFilter;
        this.textureOne.needsUpdate = true;

        for (let i = 0; i<size; i++){
            const newVal = ((secondArray.data[i]-minVal)/(maxVal-minVal))*254
            newArray[i] = isNaN(secondArray.data[i]) ? 255 : newVal
        }
        this.textureTwo = new THREE.Data3DTexture(newArray,this.shape[2],this.shape[1],this.shape[0])
        this.textureTwo.format = THREE.RedFormat;
        this.textureTwo.minFilter = THREE.NearestFilter;
        this.textureTwo.magFilter = THREE.NearestFilter;
        this.textureTwo.needsUpdate = true;
    }
    
    private initAxis(axis:number){
        const resolution = this.shape.filter((_val,idx)=> idx !== axis)
        this.GPUCompute = new GPUComputationRenderer(resolution[0],resolution[1],this.renderer)
        this.targetAxis = axis;
        this.renderTarget = this.GPUCompute.createRenderTarget(resolution[0],resolution[1],THREE.ClampToEdgeWrapping,THREE.ClampToEdgeWrapping,1006,1006)
    }
    private performReduction(axis: number, fragShader: any): THREE.Texture {
        if (axis !== this.targetAxis) {
            this.initAxis(axis);
        }
        const reducer = this.GPUCompute.addVariable("reduction", fragShader, this.initTexture);
        reducer.material.uniforms["dataArray1"] = { value: this.textureOne };
        reducer.material.uniforms["dataArray2"] = { value: this.textureTwo };
        reducer.material.uniforms["axisSize"] = { value: this.shape[this.targetAxis] };
        reducer.material.uniforms["axis"] = { value: this.targetAxis };
        
        this.GPUCompute.doRenderTarget(reducer.material, this.renderTarget);
        return this.renderTarget.texture;
    }

    Mean(axis: number): THREE.Texture {
        const result = this.performReduction(axis, MeanFrag);
        return result;
    }
    
    Max(axis: number): THREE.Texture {
        return this.performReduction(axis, MaxFrag);
    }
    
    Min(axis: number): THREE.Texture {
        return this.performReduction(axis, MinFrag);
    }
    
    StDev(axis: number): THREE.Texture {
        return this.performReduction(axis, StDevFrag);
    }
}