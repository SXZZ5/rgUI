import { create } from 'zustand'

const usePaneState = create((set) => ({
    sidebarWidth: 14,
    primarybarWidth: 86,
    setSidebarWidth: (wdth) => set((state) => {
        // console.log("setSidebarWidth called", wdth);
        // LogPrint("setSidebarWidth called", wdth);
        let tmp1 = Math.min(state.sidebarWidth + wdth, 40);
        tmp1 = Math.max(10, tmp1);
        return {
            sidebarWidth: tmp1,
            primarybarWidth: 100 - tmp1,
        }
    }),

    contextMenuActivePath: "null",
    contextMenuActiveDivId: null,
    contextMenuNames: [],
    contextMenuStyle: {},
    setContextMenuStyle: (z) => set((state) => {
        console.log("updating popover style object");
        return {
            ...state,
            contextMenuStyle: z
        }
    }),
    setContextMenuNames: (z) => set((state) => {
        console.log("updating context Menu items");
        console.log(z)
        return {
            ...state,
            contextMenuNames: z
        }
    }),
    setContextMenuActivePath: (z) => set((state) => {
        return {
            ...state,
            contextMenuActivePath: z
        }
    }),
    setContextMenuActiveDivId: (z) => set({contextMenuActiveDivId: z})
}))


export { usePaneState }