import { usePaneState } from "../state/panestore";
import Sidebar from "../components/sidebar";
import Primary from "../components/primary";
export default function Panes() {
    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Sidebar />
            <Primary />
{/*             <div style={{ flexBasis: "86vw", height: "100vh", backgroundColor: 'whitesmoke' }} >
                <Button clickCallback={Userdir} txt={"User Directory Check"} />
                <Button clickCallback={Drivescheck} txt={"Drives Check"} />
            </div> */}
        </div>
    )
}

