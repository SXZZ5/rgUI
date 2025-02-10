import { create } from "zustand";
import { GetDirEvents } from "../../wailsjs/go/backend/Fops";

const useRerenderTrigger = create((set) => ({
    sidebarRerender: 1,
    triggerSidebarRerender: () => set((state) => {
        console.log("SidebarRerender triggerd");
        return {
            ...state,
            sidebarRerender: state.sidebarRerender + 1
        }
    }),

}))

export { useRerenderTrigger }
