import { useState } from "react"
export default function Img({ srci, clickHandler }) {
    const [active, setActive] = useState(false);
    const g = () => {
        setActive((prev) => !prev);
    }
    const style = {
        height: "25px",
        width: "25px",
        marginLeft: "5px",
        marginTop: "1px",
        border: (active) ? "solid 1px rgba(0,0,0,1)" : "solid 1px rgba(0,0,0,0)"
    }
    return <img src={srci}
        style={style}
        onPointerEnter={g}
        onPointerLeave={g}
        onClick={clickHandler}
    />
}