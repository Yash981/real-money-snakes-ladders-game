import { getRandomSnakesAndLadders } from "../utils/constants";
import { createBoard, movePlayer } from "./utils";
import { randomUUID } from 'crypto';
import redisService from "../services/redis-service";

interface PlayerState {
    position: number;
    email: string;
}

interface GameState {
    gameId: string;
    players: Record<string, PlayerState>;
    board: number[];
    currentTurn: string;
    status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
    boardIndex: number;
    winner: string | null;
    betAmount: number;
    state: Record<string, any>;
    currentPlayerIndex: number;
}

class Game {
    private _gameId: string;
    private _boardIndex: number;
    private _board: number[];
    private _players: Record<string, PlayerState>;
    private _currentPlayerIndex: number = 0;
    private _status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' = 'WAITING';
    private _winner: string | null = null;
    private _betAmount: number = 0.0;
    
    constructor(existingGameId?: string) {
        this._gameId = existingGameId || randomUUID();
        const { board, index } = getRandomSnakesAndLadders();
        this._board = createBoard(board);
        this._boardIndex = index;
        this._players = {};
        
        this.initializeFromRedis();
    }
    
    private async initializeFromRedis(): Promise<void> {
        try {
            if (await redisService.exists(`game:${this._gameId}`)) {
                const gameState = await redisService.getGameState(this._gameId);
                if (gameState) {
                    this._players = gameState.players || {};
                    this._boardIndex = gameState.boardIndex || this._boardIndex;
                    this._status = gameState.status || 'WAITING';
                    this._winner = gameState.winner || null;
                    this._betAmount = gameState.betAmount || 0.0;
                    this._currentPlayerIndex = gameState.currentPlayerIndex || 0;
                    
                    if (gameState.board && gameState.board.length > 0) {
                        this._board = gameState.board;
                    }
                }
            } else {
                await this.saveStateToRedis();
            }
        } catch (error) {
            console.error('Error initializing game from Redis:', error);
        }
    }
    
    private async saveStateToRedis(): Promise<void> {
        try {
            const gameState: GameState = {
                gameId: this._gameId,
                players: this._players,
                board: this._board,
                currentTurn: this.getCurrentTurn(),
                status: this._status,
                boardIndex: this._boardIndex,
                winner: this._winner,
                betAmount: this._betAmount,
                state: this.getGameState(),
                currentPlayerIndex: this._currentPlayerIndex
            };
            
            await redisService.saveGameState(this._gameId, gameState);
        } catch (error) {
            console.error('Error saving game state to Redis:', error);
        }
    }
    
    private getGameState(): Record<string, any> {
        const playerPositions: Record<string, number> = {};
        
        for (const [email, player] of Object.entries(this._players)) {
            playerPositions[email] = player.position;
        }
        
        return {
            playerPositions,
            boardIndex: this._boardIndex,
            currentPlayerIndex: this._currentPlayerIndex
        };
    }

    public get gameId(): string {
        return this._gameId;
    }
    
    public get status(): 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' {
        return this._status;
    }
    
    public set status(value: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED') {
        this._status = value;
        this.saveStateToRedis();
    }
    
    public get betAmount(): number {
        return this._betAmount;
    }
    
    public set betAmount(value: number) {
        this._betAmount = value;
        this.saveStateToRedis();
    }
    
    public getBoardIndex(): number {
        return this._boardIndex;
    }

    public async addPlayer(email: string, position: number = 0): Promise<void> {
        if (Object.keys(this._players).length >= 2) {
            throw new Error('Game already has maximum players');
        }
        
        if (!this._players[email]) {
            this._players[email] = {
                position,
                email
            };
            
            if (Object.keys(this._players).length === 2) {
                this._status = 'IN_PROGRESS';
            }
            
            await this.saveStateToRedis();
        }
    }

    public async rollDice(email: string): Promise<{ 
        currentPosition: number,
        diceResults: number,
        nextPosition: number,
        nextPlayerTurn: string
    } | null> {
        if (email !== this.getCurrentTurn()) {
            return null;
        }
        
        const player = this._players[email];
        if (!player) {
            return null;
        }
        
        const nextPos = movePlayer(player.position, this._board);
        player.position = nextPos.newPosition;
        
        // Check if this move results in a win
        if (player.position === 100) {
            this._winner = email;
            this._status = 'COMPLETED';
            await redisService.markGameCompleted(this._gameId);
        }
        
        this.nextTurn();
        const nextPlayerEmail = this.getCurrentTurn();
        
        await this.saveStateToRedis();
        
        return {
            currentPosition: nextPos.currentPosition,
            diceResults: nextPos.diceRoll,
            nextPosition: nextPos.newPosition,
            nextPlayerTurn: nextPlayerEmail
        };
    }

    public getPlayerPosition(email: string): number {
        return this._players[email]?.position || 0;
    }

    public isGameOver(): boolean {
        return this._status === 'COMPLETED';
    }

    public getPlayers(): Record<string, number> {
        const result: Record<string, number> = {};
        
        for (const [email, player] of Object.entries(this._players)) {
            result[email] = player.position;
        }
        
        return result;
    }

    private nextTurn(): number {
        this._currentPlayerIndex = (this._currentPlayerIndex + 1) % Object.keys(this._players).length;
        return this._currentPlayerIndex;
    }

    public getCurrentTurn(): string {
        const emails = Object.keys(this._players);
        if (emails.length === 0) return '';
        return emails[this._currentPlayerIndex];
    }

    public getUsernameAndPlayerTurnIndex(): [Array<{ username: string, turnIndex: number }>, number] {
        const result = Object.entries(this._players).map(([email, _], index) => ({
            username: email,
            turnIndex: index
        }));
        
        return [result, this._currentPlayerIndex];
    }
    
    public get winner(): string | null {
        return this._winner;
    }
    
    public static async loadFromRedis(gameId: string): Promise<Game | null> {
        try {
            if (await redisService.exists(`game:${gameId}`)) {
                return new Game(gameId);
            }
            return null;
        } catch (error) {
            console.error('Error loading game from Redis:', error);
            return null;
        }
    }
}

export default Game;