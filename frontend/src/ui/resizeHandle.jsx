import { useState } from "react";

export default function ResizeHandle() {
    const [hovered, setHovered] = useState(false);

    const style = {
        position: "fixed",
        left: "50%",
        top: "0%",
        transform: "translate(-50%,0%)",
        height: "5%",
        width: "10%",
        maxHeight: "20px",
        maxWidth: "80px",
        backgroundColor: "rgba(0,0,0,0.1)",
        borderRadius: "8px",
        boxShadow: hovered ? "0px 2px 5px rgba(0,0,0,0.3)" : "0px 0px 3px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out",
        cursor: "grab",
        zIndex: 10,
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
        />
    );
}