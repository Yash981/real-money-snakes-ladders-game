import express from "express";
import { UserRouter } from "./routes/user-router";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { setupWebSocketServer } from "./websocket/websocket-server";
import http from "http";
import cors from "cors";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:8080"], credentials: true }) );
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", UserRouter);
const server = http.createServer(app);
setupWebSocketServer(server);

server.listen(port, () => {
  console.log("Server is running on 5000");
});


process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
});
