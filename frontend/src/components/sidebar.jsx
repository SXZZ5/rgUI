import { useEffect, useState } from "react";
import { usePaneState } from "../state/panestore"
import { useFFState } from "../state/filefolderstore"
import { GetConfigData } from "../../wailsjs/go/backend/Config";
import Card from "../ui/card";
import BottomActions from "./bottomActions";
import { useRerenderTrigger } from "../state/rerenderTrigger";

export default function Sidebar() {
    const { sidebarWidth } = usePaneState();
    const { 
        sidebarRerender
    } = useRerenderTrigger();
    const { setSidebarState } = useFFState();
    useEffect(() => {
        const g = async () => {
            const res = await GetConfigData();
            console.log(res);
            setSidebarState(res);
        };
        g();
    }, [sidebarRerender])
    const style = {
        position: "fixed",
        width: `${sidebarWidth}vw`,
        maxWidth: `${sidebarWidth}vw`,
        overflowX: 'clip',
        top: "5vh",
        height: "95vh",
        backgroundColor: "rgba(255,255,255,0.4)",
    }
    const val = 30
    return (
        <div style={style} className="Sidebar" >
            <Card height={60} content={"Pinned"} />
            <Card height={30} content={"Drives"} />
            <AdjustWidth />
        </div>
    )
}

var pixelsum = 0;
function AdjustWidth() {
    const [active, setActive] = useState(false);
    const { setSidebarWidth } = usePaneState();
    // const { primarybarState_path } = useFFState();

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

