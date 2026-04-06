import { io } from "socket.io-client";

const SOCKET_URL = "https://offerly-ijbn.onrender.com";
const socket = io(SOCKET_URL, {
    autoConnect: false, // We will connect manually after login or on dashboard mount
});

export default socket;
