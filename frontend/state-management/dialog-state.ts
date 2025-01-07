import { create } from "zustand";

type DialogTypes = {
    openDialog:boolean;
    setOpenDialog:(openDialog:boolean)=>void
}
const useDialogStore = create<DialogTypes>((set)=>({
    openDialog:false,
    setOpenDialog:(openDialog:boolean)=>set({openDialog})
}))
export default useDialogStore;