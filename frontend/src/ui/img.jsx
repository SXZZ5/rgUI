import { useState } from "react"
export default function Img({ srci, clickHandler }) {
    const [active, setActive] = useState(false);
    const g = () => {
        setActive((prev) => !prev);
    }
    const style = {
        height: "70%",
        maxHeight: "22px",
        maxWidth: "22px",
        marginLeft: "5px",
        marginTop: "2px",
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