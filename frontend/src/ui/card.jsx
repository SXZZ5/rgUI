import { useFFState } from "../state/filefolderstore";
import { useState } from "react";
export default function Card ({height, content}) {
    // const {uid, incrementUid, sidebarState} = useFFState();
    const {sidebarState} = useFFState();

    const style = {
        height: `${height}%`,
        borderRadius: "5px",
        margin: "5px",
        border: "solid 1px black",
    }
        
    if (sidebarState[content] != null && sidebarState[content].length > 0) {
        return (
            <div style={style}>
                {sidebarState[content].map((z)=>{
                    console.log("mapping ", z)
                    console.log(typeof(z));
                    // incrementUid();
                    return (<Item str={z} key={z} />)
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

function Item({str}){
    console.log("inside Item", str);
    const [hover, setHover] = useState(false);
    
    const style={
        margin: "5px",
        marginLeft: "3px",
        fontFamily: "Nunito Sans",
        fontWeight: "600",
        backgroundColor: (hover) ? "rgba(95, 189, 248, 0.5)" : "rgba(0,0,0,0)",
        borderRadius: "10px",
        paddingLeft: "10px",
        paddingRight: "10px"
    }
    
    const g = () => {
        setHover((prev) => !prev);
    }
    
    return (
        <div style={style} onMouseEnter={g} onMouseLeave={g}>
            {str}
        </div>
    )
}