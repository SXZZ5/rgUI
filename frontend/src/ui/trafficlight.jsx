export default function TrafficLight({ f, color }) {
    const style = {
        height: "1.2vw",
        width: "1.2vw",
        maxHeight: "12px",
        maxWidth: "12px",
        borderRadius: "2vw",
        borderStyle: "solid",
        borderWidth: "0px",
        borderColor: "rgba(137, 138, 138, 0.3)",
        backgroundColor: color,
        marginTop: "10px",
        marginLeft: "10px",
    }

    return (
        <button style={style} onClick={f}></button>
    )
} 