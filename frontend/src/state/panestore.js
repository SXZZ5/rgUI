import { create } from 'zustand'
import { LogPrint } from '../../wailsjs/runtime/runtime';
const usePaneState = create((set) => ({
    sidebarWidth: 14,
    setSidebarWidth: (wdth) => {
        set((state) => {
            // console.log("setSidebarWidth called", wdth);
            // LogPrint("setSidebarWidth called", wdth);
            let tmp1 = Math.min(state.sidebarWidth + wdth, 40);
            tmp1 = Math.max(10, tmp1);
            return {
                sidebarWidth: tmp1,
                primarybarWidth: 100 - tmp1,
            }
        })
    },
    primarybarWidth: 86,
}))


export { usePaneState }