export default function TrafficLight({ f, color }) {
    const style = {
        height: "12px",
        width: "12px",
        borderRadius: "50%",
        border: "none",
        backgroundColor: color,
        marginTop: "10px",
        marginLeft: "10px",
        cursor: "pointer",
        boxShadow: "0px 0px 3px rgba(0, 0, 0, 0.5)",
    };

    const hoverStyle = {
        ...style,
        opacity: 0.8,
    };

    return (
        <button style={style} onClick={f} className="traffic-light-button">
        </button>
    );
}