import { NextRequest } from "next/server";
import { Server as NetServer } from "http";
import { Server as SocketServer } from "socket.io";

const ioHandler = (req: NextRequest) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
    });
  }

  const globalWithSocket = global as typeof global & { io?: SocketServer };

  if (!globalWithSocket.io) {
    console.log("🆕 Initializing Socket.IO Server...");
    
    const httpServer = (req as any).socket?.server as NetServer;
    const io = new SocketServer(httpServer, {
      path: "/api/socket",
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("✅ New client connected:", socket.id);

      socket.on("message", (data) => {
        console.log("📩 Message received:", data);
        io.emit("message", data); // Broadcast to all clients
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    globalWithSocket.io = io;
  } else {
    console.log("⚡ Socket.IO Server already running.");
  }

  return new Response(null, { status: 200 });
};

export { ioHandler as GET };
