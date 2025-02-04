import { useState, useEffect } from "react";
import { useFFState } from "../state/filefolderstore";
import { GetDir } from "../../wailsjs/go/main/Fops"
export default function FolderContent () {
    const { primarybarState_path } = useFFState();
    const [contents, setContents] = useState([]);
    
    useEffect(()=>{
        async function f() {
             const res = await GetDir(primarybarState_path);
             console.log("res in Primarybar Component", res);
             setContents(res);
         }
         f();
         console.log("useEffect callback exec-ing");
     }, [primarybarState_path])

    // const style = { height: "100%", width: "100%" }
    const style = { }
     return (
        <div style={style}>
            {contents.map((z)=> <Item str={z}/>)}
        </div>
     )
}

function Item({str}){
    return (
        <div>{str}</div>
    )
}