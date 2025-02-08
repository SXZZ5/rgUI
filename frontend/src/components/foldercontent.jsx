import { useState, useEffect, useRef } from "react";
import { useFFState } from "../state/filefolderstore";
import { AddSelected, GetDir, RemoveAllSelected, RemoveSelected } from "../../wailsjs/go/backend/Fops"
import { PinALocation } from "../../wailsjs/go/backend/Config";
import { MenuInfoProvider } from "../../wailsjs/go/backend/RegistryOptions"
import { LogPrint } from "../../wailsjs/runtime/runtime";
import { usePaneState } from "../state/panestore";

export default function FolderContent() {
    const { 
        primarybarState_path, 
        revertPrimarybarState, 
        advancePrimarybarState,
        Skrerender,
    } = useFFState();
    const [contents, setContents] = useState([]);
    const [ignoring, setIgnoring] = useState(false);
    const sksum = useRef(0);

    useEffect(() => {
        async function f() {
            const res = await GetDir(primarybarState_path);
            setContents(res);
        }
        sksum.current = 0;
        RemoveAllSelected();
        f();
    }, [primarybarState_path, Skrerender])

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
            {contents.map((z, index) => {
                //using simply index as the key did not work because when list changes,
                //and ith item was marked green, new ith item will also have the leftover
                //green color on it.
                const key = z.Name + String(index)
                return <Item object={z} id={index} key={key}/>})}
        </div>
    )
}

function Item({ object, id }) {
    const [hovering, setHovering] = useState(false);
    const [selected, setSelected] = useState(false);
    const { triggerSkrerender, setPrimarybarState } = useFFState();
    const [isRenaming, setIsRenaming] = useState(false)
    const { 
        setContextMenuNames, 
        setContextMenuStyle, 
        setContextMenuActivePath 
    } = usePaneState();

    useEffect(()=>{
        console.log("done mounting")
        return ()=>{
            console.log("cleanup of ", object.Name);
            setSelected((prev) => false);
        }
    },[]);

    // this basically sets greenish color if selected, and if not selected then sets light blue or gray depending on parity of serial number.
    const bgcolor = (selected) ? "rgba(127, 255, 212,0.8)" : ((id % 2 == 0) ? "rgba(70, 130, 180,0.2)" : "rgba(220, 220, 220,0.4)")

    const style = {
        marginLeft: "5px",
        marginRight: "5px",
        backgroundColor: bgcolor,
        border: (hovering) ? "solid 1px rgba(0,0,0,0.5)" : "solid 1px rgba(0,0,0,0)",
        cursor: 'default',
        fontSize: 'clamp(12px, 2vw, 16px)',
        // transform: hovering ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'transform 0.1s ease-in-out',
        boxShadow: hovering ? '2px 2px 5px rgba(0,0,0,0.2)' : 'none',
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
            triggerSkrerender()
        } else if(e.ctrlKey) {
            console.log("selecting item");
            if (selected) {
                RemoveSelected(object.Path)
            } else {
                AddSelected(object.Path)
            }
            setSelected((prev) => !prev)
            
        }
    }

    const contextMenuHandler = async (e) => {
        e.preventDefault();
        
        console.log("context menu called at coord:", e.clientX,e.clientY);
        setContextMenuStyle({top: e.clientY, left: e.clientX})
        document.getElementById('contextmenu').showPopover()
        const res = await MenuInfoProvider(object.Path)
        setContextMenuActivePath(object.Path)
        setContextMenuNames(res)
    }

    return (
        <div
            className="folder-item"
            style={style}
            onMouseEnter={toggle}
            onMouseLeave={toggle}
            onDoubleClick={dblClickHandler}
            onClick={h}
            onContextMenu={contextMenuHandler}
        >
            {(object.Isdir) ? '📁' : '📄'}{object.Name}
        </div>
    )
}