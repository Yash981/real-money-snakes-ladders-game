export enum EventTypes{
    ROLL_DICE = "ROLL_DICE",
    ABANDON_GAME ="ABANDON_GAME",
    DICE_RESULTS = "DICE_RESULTS",
    BOARD_STATE = 'BOARD_STATE',
    GAME_FINISHED ='GAME_FINISHED',
    JOIN_GAME='JOIN_GAME',
    ERROR='ERROR',
    GAME_STARTED='GAME_STARTED',
    GAME_ADDED='GAME_ADDED',
    INIT_GAME='INIT_GAME',
    USER_STATUS='USER_STATUS',
    GAME_WINNER='GAME_WINNER',
    GAME_LOSSER='GAME_LOSSER',
    GAME_RESUME='GAME_RESUME'
  };
export interface ClientMessage {
    event:EventTypes;
    payload?:{roomId?:string,gameId?:string,abondonedGameId?:string,winner?:string,losser?:string};
}
export interface Player{
  userId:string,
  position:number
}