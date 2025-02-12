import { EventsOn } from "../../wailsjs/runtime/runtime";
import { useEffect, useRef, useState } from "react";

// import { usePaneState } from "../state/panestore"
import success from "../assets/images/success.svg"

export default function Results() {
    // const {resultStyle} = usePaneState(); 
    const [status, setStatus] = useState("success");

    const [contents, setContents] = useState({
        IOErrors: [],
        StatErrors: [],
    })

    //set up event listener for the results.
    useEffect(() => {
        console.log("Results.jsx Component Function called");
        const cancelfunc = EventsOn("transfer_results", (data) => {
            console.log("result data received", data);
            if (data.Status == "success") {
                setStatus("success");
                setContents(data.Contents)
                // contents.current = data.Contents
                document.getElementById("success-component").showPopover();

            } else {
                setStatus("problems");
                setContents(data.Contents);
                // contents.current = data.Contents
                document.getElementById("problems-component").showPopover();
            }
        })

        return () => {
            cancelfunc()
        }
    }, [])


    return (
        <div>
            <style>
                {css}
            </style>

            <SuccessComponent />
            <ProblemComponent list={contents} />
        </div>
    )

}

function SuccessComponent() {
    console.log("SuccessComponent called");
    return (
        <div id="success-component" popover="auto">
            <img src={success} width={"100px"} />
        </div>
    )
}

function ProblemComponent({ list }) {
    if (list.IOErrors === null && list.StatErrors === null) {
        return null
    }
    console.log("ProblemComponent called", list);
    return (
        <div id="problems-component" popover="auto">
            {list.IOErrors.map((z) => z)}
            {list.StatErrors.map((z) => {
                return <ul>{z.Src + " " + z.Err}</ul>;
            })}
        </div>
    )
}

const css =
    `
#success-component:popover-open,
#problems-component:popover-open {
    position: absolute;
    top: 50%;
    left: 50%;
    background-color: #fff; /* White background */
    border: 1px solid rgba(0, 0, 0, 0.15); /* Light gray border */
    border-radius: 8px; /* Rounded corners */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow */
    margin: 0px;
    padding: 3px ; /* Add some padding */
    overflow-y: auto; /* Hide scrollbars */
    scrollbar-width: 2px;
    text-wrap: nowrap;
    z-index: 1000; /* Ensure it's on top */
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; /* Use system font */
    transform: translate(-50%,-50%);
    max-height: 30%;
}
`