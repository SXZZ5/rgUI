import { usePaneState } from "../state/panestore"
import { LogPrint } from "../../wailsjs/runtime/runtime";
import {  Drivescheck } from "../../wailsjs/go/main/Config";
import { Button } from "../ui/button";

export default function Primary() {
    const { primarybarWidth } = usePaneState();
    const g = () => {
        console.log("hehu");
        LogPrint("pane button clicked");
        Userdir();
    }
    const style = {
        flexBasis: `${primarybarWidth}vw`,
        height: "100vh",
        backgroundColor: 'whitesmoke',
    }

    return (
        <div style={style}>
            {/* <Button clickCallback={Userdir} txt={"User Directory Check"} /> */}
            <Button clickCallback={Drivescheck} txt={"Drives Check"} />
        </div>
    )
}