export interface WsPacket
{
    command : string;


};
export interface PingPong extends WsPacket
{
    count : number;


};

