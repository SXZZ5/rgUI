import { usePaneState } from "../state/panestore"
import { useEffect } from "react";

export default function ContextMenu(){
    const {contextMenuStyle, setContextMenuStyle} = usePaneState();
    const css = `
        #contextmenu:popover-open {
            position: fixed;
            top: ${contextMenuStyle.top}px;
            left: ${contextMenuStyle.left}px;
            // transform: translate(-50%,-50%);
            background-color: pink;
            margin: 0px;
            overflow: visible;
            text-wrap: nowrap;
        }
    `
    useEffect(()=> {
        console.log("popover's useEffect executing");
        const parent = document.getElementById('primarybar');
        const menu = document.getElementById('contextmenu');
        
        const parentbottom = parent.offsetTop + parent.offsetHeight;
        const parentright = parent.offsetLeft + parent.offsetWidth;
        const menubottom = menu.offsetTop + menu.offsetHeight;
        const menuright = menu.offsetLeft + menu.offsetWidth;
        
        console.log("parentbottom:",parentbottom," menubottom:",menubottom);
        console.log("parentright:",parentright," menuright:",menuright)
        let newtop = menu.offsetTop, newleft = menu.offsetLeft
        let flag = false;
        if (menubottom > parentbottom) {
            const delta = menubottom - parentbottom;
            newtop -= delta;
            flag = true;
        }
        if(menuright > parentright) {
            const delta = menuright - parentright;
            newleft -= delta;
            flag = true;
        }
        if(flag) {
            console.log("Will have to readjust the context menu");
            setContextMenuStyle({top: newtop, left: newleft})
        }
        //dangerous as fuck but god bless us.
    },[contextMenuStyle])

    return <>
        <style>
            {css}
        </style>
        <div id="contextmenu" popover="auto">
            Hi This is a popover element with uselss characters like so ooooooooooooooooo
        </div>
    </>
}