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

    navigate_cnt: 0,
    primarybarState_history: [],
    _idx_primarybarState_history: 0,
    primarybarState_path: "null",
    setPrimarybarState: (z) => set((state) => {
        console.log(z);
        let newhistory = [...state.primarybarState_history].filter((z,idx) => {
            return idx < state._idx_primarybarState_history;
        })
        newhistory.push(z);
        let new_idx = state._idx_primarybarState_history + 1
        if (newhistory.length > 20){ newhistory.shift(); new_idx -= 1}
        const res = {
            ...state,
            primarybarState_path: z,
            primarybarState_history: newhistory,
            _idx_primarybarState_history: new_idx
        }
        console.log(res);
        return res;
    }),
    revertPrimarybarState: (z) => set((state) => {
        const curr = state._idx_primarybarState_history
        console.log("reverting Primary bar state");
        if(curr <= 1) {
            console.log("nothing to go back to");
            return { ...state }
        }
        const new_idx = curr - 1;
        return  {
            ...state,
            primarybarState_path: state.primarybarState_history[new_idx-1],
            _idx_primarybarState_history: new_idx,
        }
    }),
    advancePrimarybarState: (z) => set((state) => {
        const curr = state._idx_primarybarState_history
        if(curr >= state.primarybarState_history.length) {
            console.log("nothing to go forward in history");
            return {...state}
        }
        const new_idx = curr + 1;
        return {
            ...state,
            primarybarState_path: state.primarybarState_history[new_idx-1],
            _idx_primarybarState_history: new_idx,
        }
    })

}));

export { useFFState };