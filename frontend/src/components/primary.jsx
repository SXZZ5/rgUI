import { usePaneState } from "../state/panestore"
import { LogPrint } from "../../wailsjs/runtime/runtime";
import {  Drivescheck } from "../../wailsjs/go/main/Config";
import { Button } from "../ui/button";
import FolderContent from "./foldercontent";
import ContextMenu from "./contextMenu";

export default function Primary() {
    const { primarybarWidth, sidebarWidth } = usePaneState();

    const style = {
        position: "fixed",
        left: `${sidebarWidth}vw`, 
        width: `${primarybarWidth}vw`,
        top: "5vh",
        height: "95vh",
        backgroundColor: "whitesmoke",
        overflowY: "scroll",
        scrollbarWidth: "none"
    }

    return <>
        <div id="primarybar" style={style}>
            <ContextMenu />
            <FolderContent/>
        </div>
    </>
}
