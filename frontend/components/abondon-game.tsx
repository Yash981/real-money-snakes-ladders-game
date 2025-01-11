"use client"
import { useTransitionRouter } from "next-view-transitions";
import { Button } from "./ui/button";
import {  useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useWebSocket } from "@/hooks/use-socket-hook";
import { EventTypes } from "@/lib/types/event-types";
import { usePathname } from "next/navigation";
const AbondonGame = () => {
    const [openAlertDialog, setOpenAlertDialog] = useState(false)
    const { sendMessage} = useWebSocket()
    const pathname = usePathname()
    const router = useTransitionRouter()
    const handleEndGame = () => {
        setOpenAlertDialog(true)
    }
    const handleConfirmEnd = () =>{
        const gameId = pathname.split('/').slice(-1)[0]
        sendMessage({
            event:EventTypes.ABANDON_GAME,
            payload:{
                gameId:gameId 

            }
        })
        router.push('/lobby')
        sessionStorage.removeItem('gameId')
        setOpenAlertDialog(false);

    }
    return (
        <>
            <div className="flex items-center mt-6 justify-center w-full max-w-4xl m-2">
                <Button className="" variant={"destructive"} onClick={handleEndGame}>End Game</Button>
            </div>
            <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. You game would end and you lose the money.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel >Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmEnd}>End Game</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default AbondonGame;