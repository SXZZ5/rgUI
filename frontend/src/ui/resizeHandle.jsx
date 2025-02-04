export default function ResizeHandle () {
    return (
        <div style={{
            position: "fixed", 
            left: "50%", 
            top: "0%",
            transform: "translate(-50%,0%)",
            height: "3%",
            width: "10%",
            maxHeight: "20px",
            maxWidth: "80px",
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: "8px",
            boxShadow: "10px black",
            transofrm: "translate(-50%,0%)"
        }}></div>
    )
}