import { useState, useEffect, useRef } from "react";
import { useFFState } from "../state/filefolderstore";
import { AddSelected, GetDirEvents, RemoveAllSelected, RemoveSelected } from "../../wailsjs/go/backend/Fops"
import { PinALocation } from "../../wailsjs/go/backend/Config";
import { MenuInfoProvider } from "../../wailsjs/go/backend/RegistryOptions"
import { EventsOn, LogPrint } from "../../wailsjs/runtime/runtime";
import { usePaneState } from "../state/panestore";
import "./styles/foldercontent.css"
import { useRerenderTrigger } from "../state/rerenderTrigger";

const dirsymbol = '📁'
const filesymbol = '📄'


//gi is related to number of items that have to be rendered for current folder. Increases with more events and is initialised to 1 in Effect(primarybar_state_path)
//oldlen is supposed to statically record the number of children of old folder so that we can use replace child instead of remove-add. Also,helps at the end int removing any leftover old nodes.

var gi = 1, oldlen = 0; 
function indirectGetter_gi () {
    return gi;
}
function indirectGetter_oldlen () {
    return oldlen;
}
function indirectSetter_gi(val){
    gi = val;
}
function indirectSetter_oldlen(val) {
    oldlen = val;
}

var cancel = EventsOn("dirdata", function domHandler(data) {
    // console.log("heard an event", indirectGetter_gi(), indirectGetter_oldlen());
    // console.log("data received with event:",data);
    const parent = document.getElementById('foldercontents')
    //if data is empty consider it to be a THE END MESSAGE
    if (data.length > 0) {
        for (let i = 0; i < data.length; ++i) {
            const z = data[i].slice(1);
            const str = data[i].startsWith('(') ? dirsymbol + z : filesymbol + z;
            const idstr = "ff" + String(indirectGetter_gi());
            const elem = document.createElement('div');
            elem.id = idstr
            elem.innerText = str;
            elem.className = "folder-item"
            // elem.addEventListener("click", (e) => genericClicker(e,z))
            if (indirectGetter_gi() > oldlen) {
                // console.log(indirectGetter_gi(), "appending child");
                // elem.innerText += "-appendedChild"
                parent.appendChild(elem);
            } else {
                // console.log(indirectGetter_gi(), "replacing child");
                const oldchild = document.getElementById(idstr);
                // elem.innerText += "-replacedChild"
                parent.replaceChild(elem, oldchild)
            }
            indirectSetter_gi(indirectGetter_gi()+1)
        }
    } else {
        for (let i = indirectGetter_gi(); i <= oldlen ; ++i) {
            // console.log(i, "extra child removing")
            const idstr = "ff" + String(i);
            parent.removeChild(document.getElementById(idstr));
            indirectSetter_gi(indirectGetter_gi()+1)
        }
        
        indirectSetter_gi(1);
        indirectSetter_oldlen(document.getElementById('foldercontents').childElementCount);
    }
});


export default function FFolderContent() {
    const {
        primarybarState_path,
        revertPrimarybarState,
        advancePrimarybarState,
        setPrimarybarState,
        primarybarRerenderTrigger
    } = useFFState();

    const {
        triggerSidebarRerender,
    } = useRerenderTrigger();

    const {
        setContextMenuNames,
        setContextMenuActivePath,
        setContextMenuStyle,
        setContextMenuActiveDivId,
    } = usePaneState();

    const [ignoring, setIgnoring] = useState(false);
    const sksum = useRef(0);

    function genericClicker (e) {
        e.preventDefault();
        // let idx = e.target.innerText.indexOf("-replacedChild");
        // if (idx === -1) idx = e.target.innerText.indexOf("-appendedChild");
        // const name = e.target.innerText.slice(2,idx);
        const name = e.target.innerText.slice(2)
        console.log(primarybarState_path);
        if (e.altKey) {
            console.log("Pinning action done");
            LogPrint("Pinning action done");
            PinALocation(primarybarState_path + "/" + name)
            triggerSidebarRerender()
        } else if (e.ctrlKey) {
            console.log("selecting item");
            if (e.target.className === "folder-item selected") {
                RemoveSelected(primarybarState_path + "/" + name)
                e.target.className = "folder-item";
            } else {
                AddSelected(primarybarState_path + "/" + name);
                e.target.className = "folder-item selected";
            }
        }
    }
    
    function genericDoubleClicker(e) {
        e.preventDefault();
        const name = e.target.innerText.slice(2);
        setPrimarybarState(primarybarState_path + "/" + name);
    }

    async function genericContextMenuHandler (e) {
        e.preventDefault();
        const name = e.target.innerText.slice(2)
        console.log("context menu called at coord:", e.clientX, e.clientY);
        setContextMenuStyle({ top: e.clientY, left: e.clientX })
        document.getElementById('contextmenu').showPopover()
        const res = await MenuInfoProvider(primarybarState_path + "/" + name)
        setContextMenuActivePath(primarybarState_path + "/" + name)
        setContextMenuNames(res)
        setContextMenuActiveDivId(e.target.id)
    }

    useEffect(() => {
        console.log("useEffect big called in fFolderContent");
        indirectSetter_gi(1);
        const parent = document.getElementById('foldercontents')
        parent.addEventListener("click", genericClicker);
        parent.addEventListener("dblclick", genericDoubleClicker)
        parent.addEventListener("contextmenu", genericContextMenuHandler)
        
        indirectSetter_oldlen(document.getElementById('foldercontents').childElementCount);   
        sksum.current = 0;
        RemoveAllSelected();
        console.log("on UEB exit: ", indirectGetter_gi(), indirectGetter_oldlen())
        GetDirEvents(primarybarState_path)
        return () => {
            parent.removeEventListener("click", genericClicker);
            parent.removeEventListener("dblclick", genericDoubleClicker);
            parent.addEventListener("contextmenu", genericContextMenuHandler)
        }
    }, [primarybarRerenderTrigger])

    // useEffect(() => {
        
    //     return () => {
    //         // Cleanup the event listener when the component unmounts
    //         LogPrint("fFolder component unmounted");
    //         cancel();
    //     };
    // }, []);

    let wheelEventEndTimeout = null;
    const handleWheel = (e) => {
        const delx = e.deltaX;
        if (delx == 0) return;
        clearTimeout(wheelEventEndTimeout);
        sksum.current += delx
        // console.log("wheel event", delx, "sksum:", sksum.current);
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
            // console.log("end of swipe", sksum.current)
        }, Number(100))
    }

    const g = () => {
        sksum.current = 0;
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