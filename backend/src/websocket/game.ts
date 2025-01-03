import { createBoard, movePlayer } from "./utils";
import {randomUUID} from 'crypto'

class Game {
    private board: number[];
    private players: { [key: string]: number };
    public gameId:string;
    private currentTurn: number;

    constructor() {
        this.board = createBoard();
        this.players = {};
        this.gameId = randomUUID();
        this.currentTurn = 0;

    }

    addPlayer(playerId: string) {
        if (!this.players[playerId]) {
            this.players[playerId] = 0;
        }
        console.log(`Player added: ${playerId}, Position: ${this.players[playerId]}`);

    }

    rollDice(playerId: string): {diceResults:number,nextPosition:number} | number {
        if(playerId !== this.getCurrentTurn()){
            return -1
        }
        const nextPos = movePlayer(this.players[playerId],this.board)
        this.players[playerId] = 0
        this.players[playerId] = nextPos.newPosition
        const nextPlayer = this.nextTurn()
        console.log(`Player ${playerId} moved to position ${nextPos.newPosition}. Next turn: ${nextPlayer}`);
        return { diceResults: nextPos.diceRoll,nextPosition: nextPos.newPosition }

    }
    getPlayerPosition(playerId: string): number {
        if (!this.players[playerId]) {
            throw new Error("Player does not exist");
        }
        return this.players[playerId];
    }

    isGameOver(playerId: string): boolean {
        return this.players[playerId] === 100;
    }
    getPlayers(): { [key: string]: number } {
        return this.players;
    }
    nextTurn(){
        return this.currentTurn = (this.currentTurn + 1) % 2
    }
    getCurrentTurn():string{
        return Object.keys(this.players)[this.currentTurn]
    }
    
}

export default Game;