import { Server } from "socket.io"


let connections = {}
let messages = {}
let timeOnline = {}
let userNames = {} // Store socketId -> username mapping

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED")

        socket.on("join-call", (path, username) => {
            console.log("User joining:", socket.id, "username:", username, "path:", path);

            if (connections[path] === undefined) {
                connections[path] = []
            }
            connections[path].push(socket.id)

            // Store username
            if (username) {
                userNames[socket.id] = username;
            }

            timeOnline[socket.id] = new Date();

            // Broadcast to all participants in the room
            for (let a = 0; a < connections[path].length; a++) {
                // Send list of all usernames in the room
                const usernamesInRoom = connections[path].map(id => ({
                    socketId: id,
                    username: userNames[id] || `Participant ${connections[path].indexOf(id) + 1}`
                }));
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path], usernamesInRoom)
            }

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }

        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {


                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        })

        socket.on("raise-hand", (username) => {
            console.log("Raise hand received from:", socket.id, "username:", username);
            
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                console.log("Broadcasting raise-hand to room:", matchingRoom, "participants:", connections[matchingRoom]);
                connections[matchingRoom].forEach((elem) => {
                    if (elem !== socket.id) {
                        console.log("Sending raise-hand to:", elem);
                        io.to(elem).emit("raise-hand", socket.id, username)
                    }
                })
            } else {
                console.log("Room not found for socket:", socket.id);
            }
        })

        socket.on("reaction", (emoji, username) => {
            console.log("Reaction received:", emoji, "from:", socket.id, "username:", username);
            
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                connections[matchingRoom].forEach((elem) => {
                    if (elem !== socket.id) {
                        io.to(elem).emit("reaction", socket.id, emoji, username)
                    }
                })
            }
        })

        socket.on("user-mute-status", (muted) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                connections[matchingRoom].forEach((elem) => {
                    if (elem !== socket.id) {
                        io.to(elem).emit("user-mute-status", socket.id, muted)
                    }
                })
            }
        })

        // Host Permissions
        socket.on("kick-user", (targetSocketId) => {
            console.log(`Kick request from ${socket.id} to kick ${targetSocketId}`);
            // In a real app, verify if socket.id is actually the host. 
            // For now, we allow any participant to kick (as per requested simplicity or relying on UI hiding).
            io.to(targetSocketId).emit("kicked");
            
            // Also notify others so they can update their UI
            // The 'disconnect' logic handles cleanup, but 'kicked' forces the client to leave.
        })

        socket.on("mute-user", (targetSocketId) => {
            console.log(`Mute request from ${socket.id} to mute ${targetSocketId}`);
            io.to(targetSocketId).emit("muted-by-host");
        })

        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)
                        
                        // Remove username mapping
                        delete userNames[socket.id]


                        if (connections[key].length === 0) {
                            delete connections[key]
                        }
                    }
                }

            }


        })


    })


    return io;
}

