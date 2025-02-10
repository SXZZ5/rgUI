import { useState, useEffect, useRef } from "react";
import { useFFState } from "../state/filefolderstore";
import { AddSelected, GetDir, GetDirHTML, RemoveAllSelected, RemoveSelected } from "../../wailsjs/go/backend/Fops"
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
    const { contents, setContents } = useContentStore();
    // const [contents, setContents] = useState([]);
    const [ignoring, setIgnoring] = useState(false);
    const sksum = useRef(0);

    // useEffect(() => {
    //     // RENDER HTML TAKEN FROM THE BACKEND
    //     async function f() {
    //         // debugger;
    //         const res = await GetDirHTML(primarybarState_path);
    //         const parent = document.getElementById('foldercontents');
    //         const old = document.getElementById("sk-container");
    //         if (old !== null){
    //             parent.removeChild(old);
    //         }
    //         const elem = document.createElement("div");
    //         elem.id="sk-container"
    //         elem.innerHTML = res;
    //         document.getElementById('foldercontents').appendChild(elem);
            
    //     }
    //     sksum.current = 0;
    //     RemoveAllSelected();
    //     f();
    // }, [primarybarState_path, Skrerender])

    useEffect(() => {
        // JUST TRYING TO VERIFY THE FACT THAT THE DOM ELEMENT IS ADDED IMMEDIATELY
        async function f() {
            // debugger;
            const res = await GetDir(primarybarState_path);
            let i = 0;
            ivl = setInterval(()=> {
                if (i >= res.length) {
                    clearInterval(ivl);
                    return;
                }
                const elem=document.createElement("div");
                elem.innerText=res[i];
                document.getElementById('foldercontents').appendChild(elem);
                ++i;
            },100)
        }
        f();
        sksum.current = 0;
        RemoveAllSelected();
    }, [primarybarState_path, Skrerender])

    // useEffect(() => {
    //     // RENDER DOM NODES MANUALLY AS SOON AS THEY ARE HERE
    //     async function f() {
    //         const res = await GetDir(primarybarState_path);
    //         const parent = document.getElementById('foldercontents');
    //         const childlist = parent.childNodes
    //         let i = 0;
    //         let j = 0;
    //         for (; j < childlist.length; ++j) {
    //             if (i < res.length) {
    //                 const curid = "folder-item" + String(j);
    //                 const old = childlist[j];
    //                 const newchild = document.createElement('div');
    //                 newchild.innerText = res[i];
    //                 newchild.id = curid;
    //                 let sum = 0;
    //                 const start = performance.now();
    //                 parent.replaceChild(newchild, old);
    //                 if (j <= 2) {
    //                     LogPrint("FIRST CHILDREN RENDERED");
    //                 }
    //                 i++;
    //             } else {
    //                 break;
    //             }
    //         }
            
    //         let k = childlist.length - 1;
    //         while(k >= j) {
    //             parent.removeChild(childlist[k])
    //             k--;
    //         }
            
    //         while (i < res.length) {
    //             const curid = "folder-item" + String(i);
    //             const newchild = document.createElement('div');
    //             newchild.id = curid;
    //             newchild.innerText = res[i];
    //             parent.appendChild(newchild);
    //             i++;
    //         }
    //     }
    //     f();
    //     sksum.current = 0;
    //     RemoveAllSelected();
    // }, [primarybarState_path, Skrerender])
    
    // useEffect(()=>{
    //     async function f () {
    //         const res = await GetDir(primarybarState_path)
    //         setContents(res);
    //     }
    //     sksum.current = 0;
    //     RemoveAllSelected();
    //     f();
    // },[primarybarState_path, Skrerender])
    

    let wheelEventEndTimeout = null;
    const handleWheel = (e) => {
        const delx = e.deltaX;
        if (delx == 0) return;
        clearTimeout(wheelEventEndTimeout);
        sksum.current += delx
        console.log("wheel event", delx, "sksum:", sksum.current);
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

    const renderlist = () => {
        const items = contents.map((z, index) => {
            //using simply index as the key did not work because when list changes,
            //and ith item was marked green, new ith item will also have the leftover
            //green color on it.
            const key = z + String(index)
            return <SimpleItem str={z} key={key} />
        })
        LogPrint("mapping array done");
        LogPrint(items.length);
        // console.log("mapping array done");
        return items
    }

    const style = { height: "100%" }
    return (
        <div
            id="foldercontents"
            style={style}
            className="foldercontents"
            onWheel={handleWheel}
            onMouseUp={g}
            onMouseLeave={g}
            onPointerUp={g}
            onPointerLeave={g}
        >
            
        </div>
    )
}

function SimpleItem({str}) {
    return (
        <div>
            {str}
        </div>
    )
}


function Item({ object, index }) {
    const [hovering, setHovering] = useState(false);
    const [selected, setSelected] = useState(false);
    const { triggerSkrerender, setPrimarybarState } = useFFState();
    const [isRenaming, setIsRenaming] = useState(false)
    const {
        setContextMenuNames,
        setContextMenuStyle,
        setContextMenuActivePath
    } = usePaneState();

    useEffect(() => {
        // console.log("done mounting")
        return () => {
            // console.log("cleanup of ", object.Name);
            setSelected((prev) => false);
        }
    }, []);

    // this basically sets greenish color if selected, and if not selected then sets light blue or gray depending on parity of serial number.
    const bgcolor = (selected) ? "rgba(127, 255, 212,0.8)" : ((index % 2 == 0) ? "rgba(70, 130, 180,0.2)" : "rgba(220, 220, 220,0.4)")

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

    const h = (e) => {
        console.log(typeof (e.target), e.target);
        if (e.altKey) {
            console.log("Pinning action done");
            LogPrint("Pinning action done");
            PinALocation(object.Path)
            triggerSkrerender()
        } else if (e.ctrlKey) {
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

        console.log("context menu called at coord:", e.clientX, e.clientY);
        setContextMenuStyle({ top: e.clientY, left: e.clientX })
        document.getElementById('contextmenu').showPopover()
        const res = await MenuInfoProvider(object.Path)
        setContextMenuActivePath(object.Path)
        setContextMenuNames(res)
    }

    const dblClickHandler = () => {
        setPrimarybarState(object.Path)
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