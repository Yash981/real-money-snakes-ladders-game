import { getRandomSnakesAndLadders } from "../utils/constants";
import { createBoard, movePlayer } from "./utils";
import {randomUUID} from 'crypto'

class Game {
    private board: number[];
    private players: { [key: string]: number };
    public gameId:string;
    private currentTurn: number;
    private gameIdIndex:number;

    constructor() {
        const { board,index } = getRandomSnakesAndLadders();
        this.board = createBoard(board);
        this.players = {};
        this.gameId = randomUUID();
        this.currentTurn = 0;
        this.gameIdIndex = index

    }

    addPlayer(playerId: string,position?:number) {
        if (position) {
            if (!(playerId in this.players)) {
                this.players[playerId] = position;
            }
        }
        else if (!this.players[playerId]) {
            this.players[playerId] = 0;
        }
        console.log(`Player added: ${playerId}, Position: ${this.players[playerId]} ${JSON.stringify(this.players)}`);

    }
    setJoinedUserGameId(gameId:string){
        this.gameId = gameId
    }
    getBoardIndex(){
        return this.gameIdIndex
    }
    rollDice(playerId: string): {currentPosition:number,diceResults:number,nextPosition:number,nextPlayerTurn:number} | number {
        if(playerId !== this.getCurrentTurn()){
            return -1
        }
        const nextPos = movePlayer(this.players[playerId],this.board)
        this.players[playerId] = 0
        this.players[playerId] = nextPos.newPosition
        const nextPlayer = this.nextTurn()
        console.log(`Player ${playerId} moved to position ${nextPos.newPosition}. Next turn: ${nextPlayer}`);
        return { currentPosition:nextPos.currentPosition,diceResults: nextPos.diceRoll,nextPosition: nextPos.newPosition,nextPlayerTurn:nextPlayer }

    }
    getPlayerPosition(playerId: string): number {
        console.log(`this.players[playerId]: ${JSON.stringify(this.players)}`);
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
    getUsernameAndPlayerTurnIndex(){
        const currPlayerTurnIndex:any = []
        let i=0;
        for(const key in this.players){
            currPlayerTurnIndex.push({username:key,turnIndex:i})
            i = i+1
        }
        return currPlayerTurnIndex
    }
    
}

export default Game;


// import { createBoard, movePlayer } from "./utils";
// import { randomUUID } from 'crypto';

// interface Player {
//     position: number;
//     username: string;
//     turnIndex: number;
// }

// interface DiceRollResult {
//     currentPosition: number;
//     diceResults: number;
//     nextPosition: number;
//     nextPlayerTurn: number;
// }

// class Game {
//     private readonly board: number[];
//     private players: Map<string, Player>;
//     public readonly gameId: string;
//     private currentTurn: number;
//     private static readonly WINNING_POSITION = 100;
//     private static readonly MAX_PLAYERS = 2;

//     constructor() {
//         this.board = createBoard();
//         this.players = new Map();
//         this.gameId = randomUUID();
//         this.currentTurn = 0;
//     }

//     addPlayer(playerId: string, position: number = 0): void {
//         if (this.players.size >= Game.MAX_PLAYERS) {
//             throw new Error('Maximum players reached');
//         }

//         if (!this.players.has(playerId)) {
//             this.players.set(playerId, {
//                 position,
//                 username: playerId,
//                 turnIndex: this.players.size
//             });
//         }

//         console.log(`Player added: ${playerId}, Position: ${position}`, 
//             Array.from(this.players.entries()));
//     }

//     setJoinedUserGameId(gameId: string): void {
//         // Consider making this private or removing if gameId should be immutable
//         this.gameId = gameId;
//     }

//     rollDice(playerId: string): DiceRollResult | -1 {
//         if (playerId !== this.getCurrentTurn()) {
//             return -1;
//         }

//         const player = this.players.get(playerId);
//         if (!player) {
//             throw new Error('Player not found');
//         }

//         const nextPos = movePlayer(player.position, this.board);
//         player.position = nextPos.newPosition;
//         const nextPlayer = this.nextTurn();

//         console.log(`Player ${playerId} moved to position ${nextPos.newPosition}. Next turn: ${nextPlayer}`);
        
//         return {
//             currentPosition: nextPos.currentPosition,
//             diceResults: nextPos.diceRoll,
//             nextPosition: nextPos.newPosition,
//             nextPlayerTurn: nextPlayer
//         };
//     }

//     getPlayerPosition(playerId: string): number {
//         const player = this.players.get(playerId);
//         if (!player) {
//             throw new Error('Player not found');
//         }
//         return player.position;
//     }

//     isGameOver(playerId: string): boolean {
//         const player = this.players.get(playerId);
//         return player?.position === Game.WINNING_POSITION;
//     }

//     getPlayers(): Map<string, Player> {
//         return new Map(this.players);
//     }

//     private nextTurn(): number {
//         this.currentTurn = (this.currentTurn + 1) % Game.MAX_PLAYERS;
//         return this.currentTurn;
//     }

//     getCurrentTurn(): string {
//         return Array.from(this.players.keys())[this.currentTurn];
//     }

//     getUsernameAndPlayerTurnIndex(): Array<{ username: string; turnIndex: number }> {
//         return Array.from(this.players.values()).map(player => ({
//             username: player.username,
//             turnIndex: player.turnIndex
//         }));
//     }
// }

// export default Game;