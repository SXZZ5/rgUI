import { usePaneState } from "../state/panestore";
import Sidebar from "../components/sidebar";
import Primary from "../components/primary";
export default function Panes() {
    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Sidebar />
            <Primary />
        </div>
    )
}

