import express, { Response } from "express";
import { UserRouter } from "./routes/user-router";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { setupWebSocketServer } from "./websocket/websocket-server";
import http from "http";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", UserRouter);

const server = http.createServer(app);
setupWebSocketServer(server);

server.listen(9000, () => {
  console.log("Server is running on 9000");
});


process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
});
