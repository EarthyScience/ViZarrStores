import './Analysis.css'
import * as React from 'react'
import { variables } from '../ZarrLoaderLRU'

const axis = [0,1,2]
const operations = [
    'Max','Min','Mean','StDev'
]

interface Analysis{
    setters:{
        setAxis:React.Dispatch<React.SetStateAction<number>>;
        setOperation:React.Dispatch<React.SetStateAction<string>>;
        setExecute:React.Dispatch<React.SetStateAction<boolean>>;
        setSecondVar:React.Dispatch<React.SetStateAction<string>>;
    }
}


const AnalysisWindow = ({setters}:Analysis)=> {
    const {setAxis, setOperation, setExecute, setSecondVar} = setters;

    return(
        <div className="analysis-container">
            <label htmlFor="axis">Axis</label>
            <select name="axis" id="" onChange={(e)=>setAxis(parseInt(e.target.value))}>
                {
                axis.map((val)=>(
                    <option value={val}>{val}</option>
                ))
                }
            </select>
            <br/>
            <label htmlFor="operation">Operation</label>
            <select name="operation" id="" 
                defaultValue={'Mean'}
            onChange={(e)=>setOperation(e.target.value)}>
            {
                operations.map((val)=>(
                    <option value={val}>{val}</option>
                ))
                }
            </select>

            <br/>
            <button onClick={()=>setExecute(x=>!x)}>Calculate</button>
            <br/>
            <b>Correlation</b>
            <br/>

            <label htmlFor="second-var">Second Var</label>
            <select name="second-var" id="" onChange={(e)=>setSecondVar(e.target.value)}>
                {
                variables.map((val)=>(
                    <option value={val}>{val}</option>
                ))
                }
            </select>


        </div>
    )
}

export default AnalysisWindow