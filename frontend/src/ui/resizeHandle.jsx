export default function ResizeHandle () {
    return (
        <div style={{
            position: "relative", left: "50%", top: "0%",
            transform: "translate(-50%,0%)",
            height: "25px",
            width: "80px",
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: "8px",
            boxShadow: "10px black",
        }}></div>
    )
}