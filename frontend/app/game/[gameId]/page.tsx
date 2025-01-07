import GameBoard from "@/components/game-board";

type Params = Promise<{ gameId: string }>

const GamePage = async ({ params }: { params: Params }) => {
    const { gameId } = await params
    return (
        <>
            <GameBoard />
        </>
    );
}
export default GamePage