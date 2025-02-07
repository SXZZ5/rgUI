import { useState } from "react";
import { useFFState } from "../state/filefolderstore";

export default function ResizeHandle() {
    const [hovered, setHovered] = useState(false);
    const { primarybarState_path } = useFFState();

    const style = {
        position: "fixed",
        left: "50%",
        top: "0%",
        transform: "translate(-50%,0%)",
        height: "5%",
        minWidth: "10%",
        width: "fit-content",
        maxHeight: "20px",
        // maxWidth: "80px",
        backgroundColor: "rgba(70, 130, 180, 0.3)",
        borderRadius: "8px",
        boxShadow: hovered ? "0px 2px 5px rgba(0,0,0,0.3)" : "0px 0px 3px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out",
        cursor: "grab",
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1em",
        color: "white",
        textShadow: "1px 1px 2px black",
        fontWeight: "bold",
    };

    const handleDragStart = (e) => {
        //because it the fucking HTML drag and drop api decides to step in and fuck
        //with dragging the window. 
        e.preventDefault();
    };

    return (
        <div
            style={style}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onDragStart={handleDragStart}
            draggable
        >
        <div style={{marginInline: "15px"}}>
            {(primarybarState_path == "null") ? "" : primarybarState_path}
        </div>
            
        </div>
    );
}