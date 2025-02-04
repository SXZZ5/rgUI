import { usePaneState } from "../state/panestore"
import { LogPrint } from "../../wailsjs/runtime/runtime";
import {  Drivescheck } from "../../wailsjs/go/main/Config";
import { Button } from "../ui/button";
import FolderContent from "./foldercontent";

export default function Primary() {
    const { primarybarWidth } = usePaneState();

    const style = {
        flexBasis: `${primarybarWidth}vw`,
        height: "100vh",
        backgroundColor: 'whitesmoke',
    }

    return (
        <div style={style}>
            <Button clickCallback={Drivescheck} txt={"Drives Check"} />
            <FolderContent/>
        </div>
    )
}
