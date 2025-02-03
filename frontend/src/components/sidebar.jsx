import { useEffect, useState } from "react";
import { usePaneState } from "../state/panestore"
import { useFFState } from "../state/filefolderstore"
import { GetConfigData } from "../../wailsjs/go/main/Config";
import { LogPrint } from "../../wailsjs/runtime/runtime";
import Card from "../ui/card";

export default function Sidebar() {
    const { sidebarWidth } = usePaneState();
    const { uid, incrementUid,  setSidebarState } = useFFState();
    useEffect(()=> {
        const g = async () => {
            const res =  await GetConfigData();
            console.log(res);
            setSidebarState(res);
        };
        g();
    }, [])
    const style = {
        flexBasis: `${sidebarWidth}vw`,
        marginTop: "5vh",
        height: "95vh",
        backgroundColor: "rgba(255,255,255,0.2)"
    }
    const val = 30
    return (
        <div style={style} >
            <Card height={60} content={"Pinned"} />
            <Card height={30} content={"Drives"} />
            <AdjustWidth />
        </div>
    )
}

var pixelsum = 0;
function AdjustWidth() {
    const [active, setActive] = useState(false);
    const { sidebarWidth, setSidebarWidth } = usePaneState();

    const style = {
        position: "fixed",
        top: "100%",
        left: "0%",
        color: "black",
        height: "fit-content",
        width: "fit-content",
        padding: "2px",
        border: "solid 1px black",
        transform: "translate(0%,-100%)"
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
            {sidebarWidth}
        </div>
    )
}
