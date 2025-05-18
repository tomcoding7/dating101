import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const initSocket = (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-chat", (chatId: string) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat: ${chatId}`);
      });

      socket.on("leave-chat", (chatId: string) => {
        socket.leave(chatId);
        console.log(`User ${socket.id} left chat: ${chatId}`);
      });

      socket.on(
        "send-message",
        async (data: {
          chatId: string;
          message: string;
          senderId: string;
          receiverId: string;
        }) => {
          // Broadcast the message to all users in the chat
          io.to(data.chatId).emit("new-message", {
            ...data,
            timestamp: new Date(),
          });
        }
      );

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  return res.socket.server.io;
};
