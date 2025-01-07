import { useWebSocket } from "@/hooks/use-socket-hook";
import { useWindowSize } from "usehooks-ts";
import Confetti from "react-confetti";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import useDialogStore from "@/state-management/dialog-state";
import { EventTypes } from "@/lib/types/event-types";
import { useTransitionRouter } from "next-view-transitions";

const WinnerDialog = () => {
    const { payload } = useWebSocket();
    const { width, height } = useWindowSize();
    const { openDialog,setOpenDialog } = useDialogStore()
    const router = useTransitionRouter()

    if (!payload || payload.event !== EventTypes.GAME_WINNER) {
        return null;
    }

    return (
        <>
            <Confetti width={width} height={height} />
            <Dialog open={openDialog} onOpenChange={()=>{setOpenDialog(false);router.push('/lobby')}}>
                <DialogContent className="bg-white shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="text-green-600 text-center text-2xl font-bold">
                            🎉 Winner! 🎉
                        </DialogTitle>
                        <DialogDescription className="text-center text-lg mt-2">
                            Congratulations,{" "}
                            <span className="font-semibold">
                                {payload.payload as string}
                            </span>!
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default WinnerDialog;
