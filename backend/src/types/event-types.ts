export enum EventTypes{
    ROLL_DICE = "ROLL_DICE",
    ABANDON_GAME ="ABANDON_GAME",
    BOARD_STATE = 'BOARD_STATE',
    GAME_FINISHED ='GAME_FINISHED',
    JOIN_GAME='JOIN_GAME',
    ERROR='ERROR',
    GAME_ADDED='GAME_ADDED',
    GAME_STARTED='GAME_STARTED',
    DICE_RESULTS='DICE_RESULTS',
    INIT_GAME='INIT_GAME',
    GAME_RESUME='GAME_RESUME',
    USER_STATUS='USER_STATUS',
    GAME_WINNER='GAME_WINNER',
    GAME_LOSSER='GAME_LOSSER',
    GAME_STATE_RESTORED='GAME_STATE_RESTORED',
    PLAYER_RECONNECTED='PLAYER_RECONNECTED'
    
  };
export interface ClientMessage {
    event:EventTypes;
    payload:any;
}
export interface userJwtClaims{
  userId:string,
  exp?:number,
  iat?:number
}