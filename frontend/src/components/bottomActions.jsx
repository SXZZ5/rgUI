import { BeginTransfer, CopyCommand, GetPercentageCompletion } from "../../wailsjs/go/main/Fops";
import { LogPrint, WindowSetBackgroundColour } from "../../wailsjs/runtime/runtime";
import copy from "../assets/images/copy.png"
import paste from "../assets/images/paste.png"
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
    const pasteHandler = () => {
        BeginTransfer(primarybarState_path);
        setTransferring(true);
        console.log("clicked paste button");
    }

    if (!transferring) {
        return (
            <>
                <Img srci={copy} clickHandler={copyHandler} />
                <Img srci={paste} clickHandler={pasteHandler} />
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
        }, 10)

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
        boxShadow: (active) ? "2px 2px rgba(0,0,0,0.5)" : "none"
    }
    return <img src={srci}
        style={style}
        onPointerEnter={g}
        onPointerLeave={g}
        onClick={clickHandler}
    />
}