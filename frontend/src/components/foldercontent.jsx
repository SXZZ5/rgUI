import { useState, useEffect, useRef } from "react";
import { useFFState } from "../state/filefolderstore";
import { GetDir } from "../../wailsjs/go/main/Fops"
import { PinALocation } from "../../wailsjs/go/main/Config";
import { LogPrint } from "../../wailsjs/runtime/runtime";

export default function FolderContent() {
    const { primarybarState_path, revertPrimarybarState, advancePrimarybarState } = useFFState();
    const [contents, setContents] = useState([]);
    const [ignoring, setIgnoring] = useState(false);
    const [cnt, setCnt] = useState(0);
    const sksum = useRef(0);

    useEffect(() => {
        async function f() {
            const res = await GetDir(primarybarState_path);
            setContents(res);
        }
        sksum.current = 0;
        f();
    }, [primarybarState_path])

    let wheelEventEndTimeout = null;
    const handleWheel = (e) => {
        const delx = e.deltaX;
        if(delx == 0) return;
        clearTimeout(wheelEventEndTimeout);
        sksum.current += delx
        console.log("wheel event", delx, "sksum:",sksum.current);
        if (!ignoring && Math.abs(sksum.current) > 600) {
            setIgnoring(true);
            if (sksum.current > 0) advancePrimarybarState();
            else revertPrimarybarState();
            sksum.current = 0
        }
        wheelEventEndTimeout = setTimeout(() => {
            console.log("Timeout called implies swipe gesture ended", sksum.current);
            if (sksum.current > 600 && !ignoring) {
                advancePrimarybarState();
            } else if (sksum.current < -600 && !ignoring) {
                revertPrimarybarState();
            }
            sksum.current = 0
            setIgnoring(false);
            console.log("end of swipe", sksum.current)
        }, Number(100))
    }

    const g = () => {
        sksum.current = 0;
    }

    const style = { height: "100%" }
    // debugger;
    return (
        <div
            style={style}
            className="foldercontents"
            onWheel={handleWheel}
            onMouseUp={g}
            onMouseLeave={g}
            onPointerUp={g}
            onPointerLeave={g}
        >
            {contents.map((z, index) => <Item object={z} id={index} key={index} />)}
        </div>
    )
}

function Item({ object, id }) {
    const [hovering, setHovering] = useState(false);
    const { incrementUid, setPrimarybarState } = useFFState();
    const style = {
        marginLeft: "5px",
        marginRight: "5px",
        backgroundColor: (id % 2 == 0) ? "rgba(70, 130, 180,0.2)" : "rgba(220, 220, 220,0.4)",
        border: (hovering) ? "solid 1px rgba(0,0,0,1)" : "solid 1px rgba(0,0,0,0)",
        cursor: 'default',
        fontSize: 'clamp(12px, 2vw, 16px)'
    }
    const toggle = () => {
        setHovering((prev) => !prev);
    }

    const dblClickHandler = () => {
        setPrimarybarState(object.Path)
    }

    const h = (e) => {
        if(e.altKey) {
            console.log("Pinning action done");
            LogPrint("Pinning action done");
            PinALocation(object.Path)
            incrementUid()
        }
    }

    return (
        <div
            className="folder-item"
            style={style}
            onMouseEnter={toggle}
            onMouseLeave={toggle}
            onDoubleClick={dblClickHandler}
            onClick={h}
            // onContextMenu={contextMenuHandler}
        >
            {(object.Isdir) ? '📁' : '📄'}{object.Name}
        </div>
    )
}