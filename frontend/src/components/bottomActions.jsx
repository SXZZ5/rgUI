import { BeginDeletion, BeginTransfer, CopyCommand, CutCommand, GetPercentageCompletion } from "../../wailsjs/go/backend/Fops";
import { LogPrint, WindowSetBackgroundColour } from "../../wailsjs/runtime/runtime";
import copy from "../assets/images/copy.png"
import paste from "../assets/images/paste.png"
import del from "../assets/images/delete.png"
import cut from "../assets/images/cut.png"
import { useState, useEffect } from "react";
import { useFFState } from "../state/filefolderstore";
import ProgressBar from "../ui/progressbar";

export default function BottomActions() {
    const { primarybarState_path, transferring, setTransferring, triggerSkrerender } = useFFState();
    const [completion, setCompletion] = useState(0);
    const copyHandler = () => {
        CopyCommand();
        console.log("clicked copy button");
    }
    const cutHandler = () => {
        CutCommand();
    }
    const pasteHandler = () => {
        BeginTransfer(primarybarState_path);
        setTransferring(true);
        console.log("clicked paste button");
    }
    
    const deleteHandler = () => {
        BeginDeletion(true);
        setTransferring(true);
        console.log("delete button pressed");
    }

    if (!transferring) {
        return (
            <>
                <Img srci={copy} clickHandler={copyHandler} />
                <Img srci={cut} clickHandler={cutHandler}/>
                <Img srci={paste} clickHandler={pasteHandler} />
                <Img srci={del} clickHandler={deleteHandler}/>
                
            </>
        )
    } else {
        const ivl = setInterval(async ()=>{
            const res = await GetPercentageCompletion();
            console.log("res value", res);
            setCompletion(res);
            if (res == 100) {
                setTransferring(false);
                setCompletion(0);
                clearInterval(ivl)
                triggerSkrerender();
            }
        }, 200)

        return (
            <ProgressBar completion={completion}/>
        )
    }
}

function Img({ srci, clickHandler }) {
    const [active, setActive] = useState(false);
    const g = () => {
        setActive((prev) => !prev);
    }
    const style = {
        height: "80%",
        // width: "5%",
        maxHeight: "22px",
        maxWidth: "22px",
        marginLeft: "4px",
        padding: "2px",
        // marginBottom: "1px",
        border: (active) ? "solid 1px rgba(0,0,0,1)" : "solid 1px rgba(0,0,0,0)",
        borderRadius: "5px",
        boxShadow: (active) ? "2px 2px rgba(0,0,0,0.5)" : "none",
        cursor: "pointer"
    }
    return <img src={srci}
        style={style}
        onPointerEnter={g}
        onPointerLeave={g}
        onClick={clickHandler}
    />
}