export enum EventTypes{
    ROLL_DICE = "ROLL_DICE",
    ABANDON_GAME ="ABANDON_GAME",
    DICE_RESULTS = "DICE_RESULTS",
    BOARD_STATE = 'BOARD_STATE',
    GAME_FINISHED ='GAME_FINISHED',
    JOIN_GAME='JOIN_GAME',
    ERROR='ERROR',
    GAME_ADDED='GAME_ADDED',
    GAME_STARTED='GAME_STARTED'
  };
export interface ClientMessage {
    event:EventTypes;
    payload:any;
}
export interface userJwtClaims{
  userId:string,
}