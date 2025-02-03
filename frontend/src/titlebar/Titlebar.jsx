import { LogPrint, Quit, WindowMinimise, WindowToggleMaximise } from "../../wailsjs/runtime/runtime.js"
import TrafficLight from "../ui/trafficlight.jsx"
import ResizeHandle from "../ui/resizeHandle.jsx"

export default function Titlebar() {
    return <>
        <div style={style}>
            <div style={{ display: "flex", margin: "10px" }}>
                <TrafficLight color="red" f={Quit} />
                <TrafficLight color="limegreen" f={WindowToggleMaximise} />
                <TrafficLight color="gold" f={WindowMinimise} />
            </div>
            <ResizeHandle />
        </div>
    </>
}

const style = {
    position: "absolute",
    height: "5vh",
    width: "100vw",
    display: "flex",
    zIndex: "1000",
    backgroundColor: "rgba(0,0,0,0)",
}