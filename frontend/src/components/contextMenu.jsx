import { PinALocation } from "../../wailsjs/go/backend/Config";
import { AddSelected, BeginDeletion, BeginTransfer, CopyCommand, CutCommand, GetParent, RemoveAllSelected } from "../../wailsjs/go/backend/Fops";
import { Executor } from "../../wailsjs/go/backend/RegistryOptions";
import { useFFState } from "../state/filefolderstore";
import { usePaneState } from "../state/panestore"
import { useEffect } from "react";

export default function ContextMenu() {
    const {
        contextMenuActivePath,
        contextMenuStyle,
        setContextMenuStyle,
        contextMenuNames,
    } = usePaneState();

    const {
        setTransferring,
        primarybarState_path
    } = useFFState();


    const css = `
        #contextmenu:popover-open {
            position: fixed;
            top: ${contextMenuStyle.top}px;
            left: ${contextMenuStyle.left}px;
            background-color: #fff; /* White background */
            border: 1px solid rgba(0, 0, 0, 0.15); /* Light gray border */
            border-radius: 8px; /* Rounded corners */
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow */
            margin: 0px;
            padding: 5px 0; /* Add some padding */
            overflow: hidden; /* Hide scrollbars */
            text-wrap: nowrap;
            z-index: 1000; /* Ensure it's on top */
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; /* Use system font */
        }
    `
    useEffect(() => {
        // console.log("popover's useEffect executing");
        const parent = document.getElementById('primarybar');
        const menu = document.getElementById('contextmenu');

        const parentbottom = parent.offsetTop + parent.offsetHeight;
        const parentright = parent.offsetLeft + parent.offsetWidth;
        const menubottom = menu.offsetTop + menu.offsetHeight;
        const menuright = menu.offsetLeft + menu.offsetWidth;

        // console.log("parentbottom:", parentbottom, " menubottom:", menubottom);
        // console.log("parentright:", parentright, " menuright:", menuright)
        let newtop = menu.offsetTop, newleft = menu.offsetLeft
        let flag = false;
        if (menubottom > parentbottom) {
            const delta = menubottom - parentbottom;
            newtop -= delta;
            flag = true;
        }
        if (menuright > parentright) {
            const delta = menuright - parentright;
            newleft -= delta;
            flag = true;
        }
        if (flag) {
            console.log("Will have to readjust the context menu");
            setContextMenuStyle({ top: newtop, left: newleft })
        }
        //dangerous as fuck but god bless us.
    }, [contextMenuStyle])

    const hider = () => {
        document.getElementById('contextmenu').hidePopover()
    }

    const menu_cutHandler = async () => {
        // e.preventDefault()
        console.log("menu_cutHandler");
        await RemoveAllSelected();
        await AddSelected(contextMenuActivePath)
        await CutCommand()
        hider();
    }

    const menu_copyHandler = async () => {
        // e.preventDefault();
        console.log("menu_copyHandler");
        await RemoveAllSelected();
        await AddSelected(contextMenuActivePath);
        await CopyCommand();
        hider();
    }

    const menu_pasteHandler = async () => {
        // e.preventDefault();
        console.log("menu_pasteHandler");
        setTransferring(true);
        const shiftPressed = window.event?.shiftKey;
        if(shiftPressed){
            BeginTransfer(await GetParent(contextMenuActivePath), true);
        } else {
            BeginTransfer(await GetParent(contextMenuActivePath), false);
        }
        hider();
    }

    const menu_renameHandler = () => {
        // e.preventDefault();
        const z = document.getElementById('renamepopup');
        console.log("rename button clicked");
        z.showPopover();
    }

    const menu_deleteHandler = async () => {
        // e.preventDefault();
        console.log("menu_deleteHandler");
        RemoveAllSelected();
        AddSelected(contextMenuActivePath);
        //hack to not have to define this item separately.
        const shiftPressed = window.event?.shiftKey;
        setTransferring(true);
        await BeginDeletion(!shiftPressed);
        console.log(primarybarState_path)
        hider();
    }

    const menu_pinHandler = async () => {
        // e.preventDefault();
        await PinALocation(contextMenuActivePath)
        triggerSidebarRerender();
        hider()
    }

    return <>
        <style>
            {css}
        </style>
        <div id="contextmenu" popover="auto">
            <ContextMenuItemWithClickHandler str={"Pin"} f={menu_pinHandler}/>
            <ContextMenuItemWithClickHandler str={"Cut"} f={menu_cutHandler} />
            <ContextMenuItemWithClickHandler str={"Copy"} f={menu_copyHandler} />
            <ContextMenuItemWithClickHandler str={"Paste"} f={menu_pasteHandler} />
            <ContextMenuItemWithClickHandler str={"Rename"} f={menu_renameHandler}/>
            <ContextMenuItemWithClickHandler str={"Delete"} f={menu_deleteHandler}/>
            <hr style={{ margin: "5px 0" }} />
            {contextMenuNames.map((z, idx) => {
                const key = z + String(idx)
                return <ContextMenuItem str={z} key={key} id={idx} />
            })}
        </div>
    </>
}

import { useState } from 'react';
import { useRerenderTrigger } from "../state/rerenderTrigger";

function ContextMenuItem({ str, id }) {
    const [isHovering, setIsHovering] = useState(false);

    const menuItemStyle = {
        padding: "4px 12px",
        fontSize: "14px",
        // color: "#333",
        cursor: "pointer",
        transition: "background-color 0.15s ease",
        borderRadius: "4px",
        backgroundColor: isHovering ? "rgba(49, 124, 229, 0.2)" : "transparent",
        color: isHovering ? "#000" : "#333",
    }

    const clickHandler = () => {
        Executor(id)
    }

    return (
        <div
            style={menuItemStyle}
            onClick={clickHandler}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {str}
        </div>
    )
}

function ContextMenuItemWithClickHandler({ str, id, f }) {
    const [isHovering, setIsHovering] = useState(false);

    const menuItemStyle = {
        padding: "4px 12px",
        fontSize: "14px",
        // color: "#333",
        cursor: "pointer",
        transition: "background-color 0.15s ease",
        borderRadius: "4px",
        backgroundColor: isHovering ? "rgba(49, 124, 229, 0.2)" : "transparent",
        color: isHovering ? "#000" : "#333",
    }

    const clickHandler = () => {
        f();
    }

    return (
        <div
            style={menuItemStyle}
            onClick={clickHandler}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {str}
        </div>
    )
}
