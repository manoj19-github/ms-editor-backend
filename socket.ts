import http from "http";
import { stringify } from "querystring";
import { Server, Socket } from "socket.io";
import { SOCKET_ACTIONS } from "./utils/socketAction";
let IO: any;
const userSocketMap = {};
interface ILangOption {
  id: number;
  name: string;
  label: string;
  value: string;
}

export default (server: http.Server) => {
  const io = new Server(server, {
    pingTimeout: 12000,
    cors: { origin: process.env.CLIENT_APP_URL },
  });
  const allConnectedClients = (roomId: string, mySocketId: string) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
      (socketId) => {
        return {
          socketId,
          userName: userSocketMap[socketId],
        };
      }
    );
  };
  IO = io.on("connection", (socket: Socket) => {
    socket.emit(SOCKET_ACTIONS.SERVER_UP, {
      message: `Server is up at port ${process.env.PORT} `,
    });
    socket.on(
      SOCKET_ACTIONS.CLIENT_UP,
      ({ message }: { message: string }) => {}
    );

    socket.on(
      SOCKET_ACTIONS.JOIN,
      ({ roomId, userName }: { roomId: string; userName: string }) => {
        if (
          !Object.entries(userSocketMap)?.find(([key, value]) => {
            return value === userName;
          })
        ) {
          socket.join(roomId);

          userSocketMap[socket.id] = userName;

          const clients = allConnectedClients(roomId, socket.id);
          clients.forEach(({ socketId }) => {
            return io.to(socketId).emit(SOCKET_ACTIONS.JOINED, {
              _userName: userName,
              clients,
              socketId: socket.id,
            });
          });
        }
      }
    );
    socket.on(
      SOCKET_ACTIONS.SYNC_CODE,
      ({
        myCode,
        _userName,
        roomId,
      }: {
        myCode: string;
        _userName: string;
        roomId: string;
      }) => {
        socket
          .in(roomId)
          .emit(SOCKET_ACTIONS.CODE_CHANGED, { myCode, _userName });
      }
    );
    socket.on(
      SOCKET_ACTIONS.LANG_CHANGING,
      ({
        newLang,
        _userName,
        roomId,
      }: {
        newLang: ILangOption;
        _userName: string;
        roomId: string;
      }) => {
        socket
          .in(roomId)
          .emit(SOCKET_ACTIONS.LANG_CHANGED, { newLang, _userName });
      }
    );
    socket.on(
      SOCKET_ACTIONS.COMPILE_REQ,
      ({ roomId, _userName }: { roomId: string; _userName: string }) => {
        socket.in(roomId).emit(SOCKET_ACTIONS.COMPILING, { _userName });
      }
    );
    // disconnec the socket
    socket.on("disconnect", () => {
      const roomsArray = Array.from(socket.rooms);
      roomsArray.forEach((roomId) => {
        io.to(roomId).emit(SOCKET_ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          _userName: userSocketMap[socket.id],
          clientsData: allConnectedClients(roomId, socket.id),
        });
      });
      delete userSocketMap[socket.id];
      socket.leave(roomsArray[0]);
    });

    socket.on(SOCKET_ACTIONS.LEAVE, ({ roomId, _userName, userName }) => {
      socket.in(roomId).emit(SOCKET_ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        _userName,
        userName,
        clientsData: allConnectedClients(roomId, socket.id),
      });
    });
    return io;
  });
};
export { IO };
