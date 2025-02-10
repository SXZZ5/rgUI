import { usePaneState } from "../state/panestore"

// import FolderContent from "./foldercontent";
import ContextMenu from "./contextMenu";
import Rename from "../ui/rename";
import FFolderContent from "./fFoldercontent";

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
        scrollbarWidth: "1px"
    }

    return <>
        <div id="primarybar" style={style}>
            <Rename />
            <ContextMenu />
            <FFolderContent />
        </div>
    </>
}


// <FolderContent/>
// <Embedded />