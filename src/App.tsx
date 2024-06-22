import { Navbar, Footer, CanvasGeometry, } from './components';
import Overlays from "./components/Overlays";
import './App.css'
export function App() {
  return (
    <>
    <Overlays />
    <Navbar />
    <Footer />
    <CanvasGeometry />
    <div id="myPane" className='pane'></div>
    <div id="myPanePlugin" className='panePlugin'></div>
    </>
  )
}

export default App