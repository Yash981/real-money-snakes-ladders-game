import { verifyGameId } from "@/actions/verify-game-route-action";
import GameBoard from "@/components/game-board";
import { Button } from "@/components/ui/button";
import { MessageCircleWarningIcon } from "lucide-react";
import { Link } from "next-view-transitions";

type Params = Promise<{ gameId: string }>

const GamePage = async ({ params }: { params: Params }) => {
    const { gameId } = await params
    const response = await verifyGameId(gameId)
    if (!response.success) {
        return <div className="flex justify-center items-center h-screen gap-2 flex-col">
        <div className="flex gap-2"> <MessageCircleWarningIcon /> Error: Game not found or you do not have access.</div>
        <div className="">
            <Link href={'/lobby'}>
            <Button variant={"default"} >Go to Lobby</Button>
            </Link>
        </div>
        </div>;

    }
    return (
        <>
            <GameBoard />
        </>
    );
}
export default GamePage