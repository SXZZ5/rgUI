import { create } from "zustand";
import { GetDirEvents } from "../../wailsjs/go/backend/Fops";

const useFFState = create((set) => ({
    sidebarState: { Drives: [], Pinned: [] },
    setSidebarState: (z) => set((state) => {
        console.log(z);
        return {
            ...state,
            sidebarState: z,
        }
    }), 

    navigate_cnt: 0,
    primarybarRerenderTrigger: 0,
    primarybarState_history: [],
    _idx_primarybarState_history: 0,
    primarybarState_path: "null",
    setPrimarybarState: (z) => set((state) => {
        // debugger;
        console.log(z);
        let newhistory = [...state.primarybarState_history].filter((z,idx) => {
            return idx < state._idx_primarybarState_history;
        })
        newhistory.push(z);
        let new_idx = state._idx_primarybarState_history + 1
        if (newhistory.length > 20){ newhistory.shift(); new_idx -= 1}
        // GetDirEvents(z);
        const res = {
            ...state,
            primarybarState_path: z,
            primarybarState_history: newhistory,
            _idx_primarybarState_history: new_idx,
            primarybarRerenderTrigger: state.primarybarRerenderTrigger + 1,
        }
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
        const new_path = state.primarybarState_history[new_idx-1]
        // GetDirEvents(new_path)
        return  {
            ...state,
            primarybarState_path: new_path,
            _idx_primarybarState_history: new_idx,
            primarybarRerenderTrigger: state.primarybarRerenderTrigger + 1,
        }
    }),
    advancePrimarybarState: (z) => set((state) => {
        const curr = state._idx_primarybarState_history
        console.log("reverting Primary bar state");
        if(curr >= state.primarybarState_history.length) {
            console.log("nothing to forward to");
            return { ...state }
        }
        const new_idx = curr + 1;
        const new_path = state.primarybarState_history[new_idx-1]
        // GetDirEvents(new_path)
        return  {
            ...state,
            primarybarState_path: new_path,
            _idx_primarybarState_history: new_idx,
            primarybarRerenderTrigger: state.primarybarRerenderTrigger + 1,
        }
    }),

    transferring: false,
    setTransferring: (z) => set({transferring: z}),


}));

export { useFFState };