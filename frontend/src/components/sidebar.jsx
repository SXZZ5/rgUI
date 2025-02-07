import { useEffect, useState } from "react";
import { usePaneState } from "../state/panestore"
import { useFFState } from "../state/filefolderstore"
import { GetConfigData } from "../../wailsjs/go/main/Config";
import { LogPrint } from "../../wailsjs/runtime/runtime";
import Card from "../ui/card";
import { BeginTransfer } from "../../wailsjs/go/main/Fops";
import BottomActions from "./bottomActions";

export default function Sidebar() {
    const { sidebarWidth } = usePaneState();
    const { Skrerender, setSidebarState } = useFFState();
    useEffect(() => {
        const g = async () => {
            const res = await GetConfigData();
            console.log(res);
            setSidebarState(res);
        };
        g();
    }, [Skrerender])
    const style = {
        position: "fixed",
        width: `${sidebarWidth}vw`,
        maxWidth: `${sidebarWidth}vw`,
        overflowX: 'clip',
        top: "5vh",
        height: "95vh",
        backgroundColor: "rgba(255,255,255,0.4)",
    }
    const separatorStyle = {
        height: "2px",
        backgroundColor: "rgba(109, 108, 108, 0.9)",
        marginLeft: "10px",
        marginRight: "10px",
        borderRadius: "6px"
    }
    const val = 30
    return (
        <div style={style} className="Sidebar" >
            <Card height={60} content={"Pinned"} />
            {/* <div style={separatorStyle}></div> */}
            <Card height={30} content={"Drives"} />
            <AdjustWidth />
        </div>
    )
}

var pixelsum = 0;
function AdjustWidth() {
    const [active, setActive] = useState(false);
    const { sidebarWidth, setSidebarWidth } = usePaneState();
    const { primarybarState_path } = useFFState();

    const style = {
        position: "absolute",
        top: "100%",
        left: "0%",
        color: "black",
        height: "5%",
        width: "100%",
        padding: "2px",
        // border: "solid 1px black",
        transform: "translate(0%,-100%)",
        display: "flex",
        justifyContent: "space-evenly",
    }

    const whConstant = 20;
    const wheelHandler = (e) => setTimeout(() => {
        const wdth = - e.deltaX;
        pixelsum = pixelsum + wdth;
        if (pixelsum > whConstant) {
            pixelsum -= whConstant;
            setSidebarWidth(1);
        } else if (pixelsum < (0 - whConstant)) {
            pixelsum += whConstant;
            setSidebarWidth(-1);
        }
    }, 10)
    return (
        <div id="ssk" style={style} onWheel={wheelHandler}>
            <BottomActions />
        </div>
    )
}

