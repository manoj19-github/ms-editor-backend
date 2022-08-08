import http from "http";
import {Server,Socket} from "socket.io";
import { SOCKET_ACTIONS } from "./utils/socketAction";
let IO:any;
export default(server:http.Server)=>{
    const io = new Server(server,{
        pingTimeout:12000,
        cors:{origin:process.env.CLIENT_APP_URL}
    })
    IO = io.on("connection",(socket:Socket)=>{
        console.log(`connected to socket io on ms-editor`)
        socket.emit(SOCKET_ACTIONS.SERVER_UP,{message:`Server is up at port ${process.env.PORT} `})
        socket.on(SOCKET_ACTIONS.CLIENT_UP,({message}:{message:string})=>{
            console.log(message)
        })
        socket.on(SOCKET_ACTIONS.JOIN,({roomId,userName}:{roomId:string;userName:string})=>{
            console.log("roomId : ",roomId);
            console.log("userName : ",userName);
        })
        return io;
    })
}
export { IO }