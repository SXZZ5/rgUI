import { UnpinALocation } from "../../wailsjs/go/backend/Config";
import { useFFState } from "../state/filefolderstore";
import { useState } from "react";

export default function Card ({height, content}) {
    const {sidebarState} = useFFState();

    const style = {
        height: `${height}%`,
        borderRadius: "5px",
        margin: "5px",
        // border: "solid 1px black",
        cursor: "default",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.9)",
        overflowY: "scroll",
        scrollbarWidth: "none",
    }
        
    if (sidebarState[content] != null && sidebarState[content].length > 0) {
        return (
            <div style={style}>
                {sidebarState[content].map((z,idx)=>{
                    return (<Item obj={z} key={idx} />)
                })}
            </div>
        )
    } else {
        const style2 = {...style, margin: '5px', fontFamily: "Nunito Sans", fontWeight: "600"}
        return (
            <div style={style2}>
                Nothing To show.
            </div>
        )
    }
}

function Item({obj}){
    const [hover, setHover] = useState(false);
    const { setPrimarybarState, triggerSkrerender } = useFFState();
    const style={
        margin: "3px",
        fontFamily: "Nunito Sans",
        fontWeight: "600",
        fontSize: "14px",
        backgroundColor: (hover) ? "rgba(135, 206, 250, 0.4)" : "rgba(0,0,0,0)",
        borderRadius: "10px",
        paddingLeft: "3px",
        cursor: "pointer",
        transform: hover ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'transform 0.1s ease-in-out',
        boxShadow: hover ? '2px 2px 5px rgba(0,0,0,0.2)' : 'none',
    }
    
    const g = () => {
        setHover((prev) => !prev);
    }

    const handleClick = (e) => {
        if (e.altKey) {
            UnpinALocation(obj.Path)
            triggerSkrerender()
            return;
        }
        setPrimarybarState(obj.Path);
    }
    
    return (
        <div style={style} onPointerEnter={g} onPointerLeave={g} onClick={handleClick}>
            {obj.Name}
        </div>
    )
}