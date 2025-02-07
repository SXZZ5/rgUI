import { AddSelected, BeginTransfer, CopyCommand, CutCommand, GetParent, RemoveAllSelected } from "../../wailsjs/go/main/Fops";
import { Executor } from "../../wailsjs/go/main/RegistryOptions";
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
        console.log("popover's useEffect executing");
        const parent = document.getElementById('primarybar');
        const menu = document.getElementById('contextmenu');

        const parentbottom = parent.offsetTop + parent.offsetHeight;
        const parentright = parent.offsetLeft + parent.offsetWidth;
        const menubottom = menu.offsetTop + menu.offsetHeight;
        const menuright = menu.offsetLeft + menu.offsetWidth;

        console.log("parentbottom:", parentbottom, " menubottom:", menubottom);
        console.log("parentright:", parentright, " menuright:", menuright)
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

    const menu_cutHandler = () => {
        console.log("menu_cutHandler");
        RemoveAllSelected();
        AddSelected(contextMenuActivePath)
        CutCommand()
        hider();
    }

    const menu_copyHandler = () => {
        console.log("menu_copyHandler");
        RemoveAllSelected();
        AddSelected(contextMenuActivePath);
        CopyCommand();
        hider();
    }

    const menu_pasteHandler = async () => {
        console.log("menu_pasteHandler");
        setTransferring(true);
        BeginTransfer(await GetParent(contextMenuActivePath));
        hider();
    }

    return <>
        <style>
            {css}
        </style>
        <div id="contextmenu" popover="auto">
            <ContextMenuItemWithClickHandler str={"Cut"} f={menu_cutHandler} />
            <ContextMenuItemWithClickHandler str={"Copy"} f={menu_copyHandler} />
            <ContextMenuItemWithClickHandler str={"Paste"} f={menu_pasteHandler} />
            <hr style={{ margin: "5px 0" }} />
            {contextMenuNames.map((z, idx) => {
                const key = z + String(idx)
                return <ContextMenuItem str={z} key={key} id={idx} />
            })}
        </div>
    </>
}

import { useState } from 'react';

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
