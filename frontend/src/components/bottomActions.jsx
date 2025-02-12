import { BeginDeletion, BeginTransfer, CopyCommand, CutCommand } from "../../wailsjs/go/backend/Fops";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import copy from "../assets/images/copy.png"
import paste from "../assets/images/paste.png"
import del from "../assets/images/delete.png"
import cut from "../assets/images/cut.png"
import { useState, useEffect } from "react";
import { useFFState } from "../state/filefolderstore";
import ProgressBar from "../ui/progressbar";
import { useRerenderTrigger } from "../state/rerenderTrigger";

export default function BottomActions() {
    const { 
        primarybarState_path, 
        transferring, 
        setTransferring, 
        setPrimarybarState 
    } = useFFState();
    
    const [completion, setCompletion] = useState(0);

    useEffect(() => {
        const cancelFunc = EventsOn("progress", (data) => {
            // console.log("progress event: data: ", data)
            const pbarpath = useFFState.getState().primarybarState_path;
            setCompletion(data)
            if (data === 100) {
                setTransferring(false)
                setPrimarybarState(pbarpath)
            }
        });
        return () => {
            cancelFunc();
        }
    }, [])

    const copyHandler = () => {
        CopyCommand();
        console.log("clicked copy button");
    }
    const cutHandler = () => {
        CutCommand();
    }
    const pasteHandler = () => {
        setTransferring(true);
        BeginTransfer(primarybarState_path);
        console.log("clicked paste button");
    }

    const deleteHandler = (e) => {
        if (e.shiftKey) {
            BeginDeletion(false);
        } else {
            BeginDeletion(true);
        }

        setTransferring(true);
        console.log("delete button pressed");
        console.log("pbar path in deleteHandler: ", primarybarState_path)
    }

    if (!transferring) {
        return (
            <>
                <Img srci={copy} clickHandler={copyHandler} />
                <Img srci={cut} clickHandler={cutHandler} />
                <Img srci={paste} clickHandler={pasteHandler} />
                <Img srci={del} clickHandler={deleteHandler} />

            </>
        )
    } else {
        return (
            <ProgressBar completion={completion} />
        )
    }
}

function Img({ srci, clickHandler }) {
    const [active, setActive] = useState(false);
    
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
        onPointerEnter={()=>{setActive(true)}}
        onPointerLeave={()=>{setActive(false)}}
        onClick={clickHandler}
    />
}