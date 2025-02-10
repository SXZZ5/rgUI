import { useState } from "react";
import { FileRenamer } from "../../wailsjs/go/backend/Fops";
import { usePaneState } from "../state/panestore";
import { useFFState } from "../state/filefolderstore";
import { useRerenderTrigger } from "../state/rerenderTrigger";

export default function Rename() {
    const [text, setText] = useState("");
    const {contextMenuActivePath, contextMenuActiveDivId} = usePaneState();
    // const {triggerPrimarybarRerender} = useRerenderTrigger();

    const handleChange = (event) => {
        setText(event.target.value);
    };

    const attemptRename = async () => {
        const res = await FileRenamer(contextMenuActivePath,text)
        document.getElementById("renamepopup").hidePopover()
        if(res == true) {
            console.log("true result from FileRenamer");
            const elem = document.getElementById(contextMenuActiveDivId);
            const prefix = elem.innerText.slice(0,2)
            console.log(prefix, prefix + text);
            elem.innerText = prefix + text;
        }
    }

    const css = `
        #renamepopup:popover-open {
            position: fixed;
            background-color: #fff;
            border: 1px solid rgba(0, 0, 0, 0.15);
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            padding: 10px;
            z-index: 1000;
        }
    `

    return (
        <>
            <style>
                {css}
            </style>
            <div id="renamepopup" popover="auto">
                {contextMenuActivePath === "null" ? (
                    <div>No valid object selected</div>
                ) : (
                    <>
                        <input
                            type="text"
                            value={text}
                            onChange={handleChange}
                            placeholder="New name"
                        />
                        <button onClick={attemptRename}>Rename</button>
                    </>
                )}
            </div>
        </>
    );
}

