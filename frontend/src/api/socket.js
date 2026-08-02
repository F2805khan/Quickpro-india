import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/urls.js";

// Initialize socket connection to the backend
const socket = io(API_BASE_URL, {
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
