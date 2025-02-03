import { usePaneState } from "../state/panestore"
import { LogPrint } from "../../wailsjs/runtime/runtime";
import {  Drivescheck } from "../../wailsjs/go/main/Config";
import { Button } from "../ui/button";
import { useFFState } from "../state/filefolderstore";
import { useEffect, useState } from "react";
import { GetDir } from "../../wailsjs/go/main/Fops";

export default function Primary() {
    const { primarybarWidth } = usePaneState();
    const { primarybarState_path } = useFFState();
    const [contents, setContents] = useState([]);
    const g = () => {
        console.log("hehu");
        LogPrint("pane button clicked");
        Userdir();
    }
    
    useEffect(()=>{
       async function f() {
            const res = await GetDir(primarybarState_path);
            console.log("res in Primarybar Component", res);
            setContents(res);
        }
        f();
        console.log("useEffect callback exec-ing");
    }, [primarybarState_path])
    
    
    const style = {
        flexBasis: `${primarybarWidth}vw`,
        height: "100vh",
        backgroundColor: 'whitesmoke',
    }

    return (
        <div style={style}>
            <Button clickCallback={Drivescheck} txt={"Drives Check"} />
            {contents.map((z)=> <Comp str={z}/>)}
        </div>
    )
}

function Comp({str}){
    return (
        <div>{str}</div>
    )
}