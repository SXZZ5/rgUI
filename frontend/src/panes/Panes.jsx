import { usePaneState } from "../state/panestore";
import Sidebar from "../components/sidebar";
import Primary from "../components/primary";
import ContextMenu from "../components/contextMenu";
export default function Panes() {
    const style = { display: 'flex', flexDirection: 'row' }
    return (
        <div className="Panes">
            <Sidebar />
            <Primary />
        </div>
    )
}

