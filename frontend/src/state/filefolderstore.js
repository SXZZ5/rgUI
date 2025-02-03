import { create } from "zustand";

const useFFState = create((set) => ({
    uid: 1,
    incrementUid: () => set((state) => {
        return {
            uid: state.uid + 1,
        }
    }),

    sidebarState: { Drives: [], Pinned: [] },
    setSidebarState: (z) => set((state) => {
        console.log(z);
        return {
            ...state,
            sidebarState: z,
        }
    }), 

    primarybarState_path: "null",
    setPrimarybarState: (z) => set((state) => {
        console.log(z);
        const resobj = {
            ...state,
            primarybarState_path: z
        }
        console.log(resobj);
        return resobj
    })

}));

export { useFFState };