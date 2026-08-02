import { io } from "socket.io-client";
const API_URL = import.meta.env.VITE_API_URL || "/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

// Initialize socket connection to the backend
const socket = io(SOCKET_URL || "/", {
  autoConnect: true,
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Connected to real-time updates socket:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from real-time updates");
});

export default socket;
