const { io } = require("socket.io-client");

const SERVER_URL = "http://localhost:8000";
const NUM_USERS = 5;

let clients = [];
for (let i = 0; i < NUM_USERS; i++) {
    const socket = io(SERVER_URL);
    clients.push(socket);
    socket.on("connect", () => {
        console.log(`Client ${i} connected with ID ${socket.id}`);
        socket.emit("join-call", "room1", `user${i}`);
    });
}

setTimeout(() => {
    console.log("Disconnecting client 0...");
    clients[0].disconnect();
}, 2000);

setTimeout(() => {
    console.log("Disconnecting all...");
    clients.forEach(c => c.disconnect());
    process.exit(0);
}, 4000);
