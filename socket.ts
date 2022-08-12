import http from "http";
import {Server,Socket} from "socket.io";
import { SOCKET_ACTIONS } from "./utils/socketAction";
let IO:any;
const userSocketMap = {}

export default(server:http.Server)=>{
    const io = new Server(server,{
        pingTimeout:12000,
        cors:{origin:process.env.CLIENT_APP_URL}
    })
    const allConnectedClients = (roomId:string)=>{
        return Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    }
    IO = io.on("connection",(socket:Socket)=>{
        console.log(`connected to socket io on ms-editor`)
        socket.emit(SOCKET_ACTIONS.SERVER_UP,{message:`Server is up at port ${process.env.PORT} `})
        socket.on(SOCKET_ACTIONS.CLIENT_UP,({message}:{message:string})=>{
            console.log(message)
        })
        socket.on(SOCKET_ACTIONS.JOIN,({roomId,userName}:{roomId:string;userName:string})=>{
            socket.join(roomId);
            userSocketMap[userName] = socket.id;
            const clients = allConnectedClients(roomId);
        })
        return io;
    })
}
export { IO }