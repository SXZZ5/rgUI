export function Button({clickCallback, txt}) {
    const style={height: "100px", width: "100px", margin: "20px"}
    return (
        <button style={style} onClick={clickCallback}>
           {txt} 
        </button>
    )
}