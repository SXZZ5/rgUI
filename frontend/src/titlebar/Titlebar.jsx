import { LogPrint, Quit, WindowMinimise, WindowToggleMaximise } from "../../wailsjs/runtime/runtime.js"
import TrafficLight from "../ui/trafficlight.jsx"
import ResizeHandle from "../ui/resizeHandle.jsx"
import Img from "../ui/img.jsx"
import { usePaneState } from "../state/panestore.js"
import backicon from "../assets/images/icon-back.png"
import fwdicon from "../assets/images/icon-fwd.png"
import upicon from "../assets/images/icon-up.png"
import { useFFState } from "../state/filefolderstore.js"
import { GetParent } from "../../wailsjs/go/main/Fops.js"
export default function Titlebar() {
    const style = {
        position: "fixed",
        display: "flex",
        // zIndex: "1000",
        backgroundColor: "rgba(0,0,0,0)",
    }
    return <>
        <div style={style} className="Titlebar">
            <Side_Titlebar />
            <Primary_Titlebar />
        </div>
    </>
}

function Side_Titlebar() {
    const { sidebarWidth } = usePaneState();
    const style = {
        // position: "sticky",
        display: "flex",
        width: `${sidebarWidth}vw`,
        maxWidth: `${sidebarWidth}vw`,
        height: "5vh",
        backgroundColor: "rgba(0,0,0,0)",
        // overflow: "hidden"
    }
    return (
        <div style={style} className="Side_titlebar">
            <TrafficLight color="red" f={Quit} />
            <TrafficLight color="limegreen" f={WindowToggleMaximise} />
            <TrafficLight color="gold" f={WindowMinimise} />
        </div>
    )
}

function Primary_Titlebar() {
    const { primarybarWidth } = usePaneState();
    const style = {
        // position: "sticky",
        width: `${primarybarWidth}vw`,
        backgroundColor: "whitesmoke",
        height: "5vh",
        // maxHeight: "5vh"
    }
    return (
        <div style={style} className="Primary_titlebar">
            <NavButtons />
            <ResizeHandle />
        </div>
    )
}

function NavButtons() {
    const {
        primarybarState_path,
        revertPrimarybarState,
        advancePrimarybarState,
        setPrimarybarState
    } = useFFState();

    const upnav = async () => {
        const res = await GetParent(primarybarState_path)
        setPrimarybarState(res)
    }

    return <div className="navbuttons">
        <Img srci={backicon} clickHandler={revertPrimarybarState} />
        <Img srci={fwdicon} clickHandler={advancePrimarybarState} />
        <Img srci={upicon} clickHandler={upnav} />
    </div>
}


