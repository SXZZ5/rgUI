export default function ProgressBar({ completion }) {
    const style = {
        width: `${completion}%`,
        height: "100%",
        backgroundColor: "green",
        // transition: "width 0.5s ease-in-out",
    };

    const containerStyle = {
        width: "100%",
        height: "100%",
        backgroundColor: "lightgray",
        borderRadius: "3px",
        overflow: "hidden",
        padding: "2px"
    };

    return (
        <div style={containerStyle}>
            <div style={style}></div>
        </div>
    );
}