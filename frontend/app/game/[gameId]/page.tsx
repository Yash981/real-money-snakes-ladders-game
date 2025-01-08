import { verifyGameId } from "@/actions/verify-game-route-action";
import GameBoard from "@/components/game-board";
import { MessageCircleWarningIcon } from "lucide-react";

type Params = Promise<{ gameId: string }>

const GamePage = async ({ params }: { params: Params }) => {
    const { gameId } = await params
    const response = await verifyGameId(gameId)
    if(!response.success){
        return <div className="flex justify-center items-center h-screen gap-2"> <MessageCircleWarningIcon/> Error: Game not found or you do not have access.</div>;
    }
    return (
        <>
            <GameBoard />
        </>
    );
}
export default GamePage