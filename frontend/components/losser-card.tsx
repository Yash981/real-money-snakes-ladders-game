import { useWebSocket } from "@/hooks/use-socket-hook";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"; // Update the path to match your ShadCN setup
import { EventTypes } from "@/lib/types/event-types";
import useDialogStore from "@/state-management/dialog-state";
import { useTransitionRouter } from "next-view-transitions";

const LoserDialog = () => {
    const { payload } = useWebSocket();
    const { openDialog ,setOpenDialog} = useDialogStore()
    const router = useTransitionRouter()

    if (!payload || payload.event !== EventTypes.GAME_LOSSER) {
        return null;
    }
    return (
        <Dialog open={openDialog} onOpenChange={()=>{setOpenDialog(false);router.push('/lobby')}}>
            <DialogContent className="bg-gray-200">
                <DialogHeader>
                    <DialogTitle className="text-red-600 text-center text-2xl font-bold">
                        😞 Better Luck Next Time! 😞
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        You gave it your best shot, <span className="font-semibold">{payload?.payload as string}</span>! Keep trying, and you might win the next one!
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default LoserDialog;
