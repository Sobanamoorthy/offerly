import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
const socket = io(SOCKET_URL, {
    autoConnect: false, // We will connect manually after login or on dashboard mount
});

export default socket;
