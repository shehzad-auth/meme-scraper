import { Server as NetServer, Socket } from "net";
import { Server as SocketServer } from "socket.io";
import { NextApiResponse } from "next";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io?: SocketServer;
    };
  };
};
