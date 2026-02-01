import { Server } from "socket.io"


	// State
	let connections = {}
	let messages = {}
	let timeOnline = {}
	let userNames = {} // socketId -> username
	let roomHosts = {} // roomPath -> socketId (The Host)
	let waitingRoom = {} // roomPath -> [socketIds]
	let bannedUsers = {} // roomPath -> [strings (username or IP or socketId)] - simplistic ban list

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
			console.log("User connected:", socket.id);

			socket.on("join-call", (path, username) => {
				console.log("Join request:", socket.id, "username:", username, "path:", path);

				// 1. Check if banned
				if (bannedUsers[path] && bannedUsers[path].includes(username)) {
					socket.emit("kicked"); // Re-use kicked event or specific 'banned' event
					return;
				}

				// Initialize room if not exists
				if (connections[path] === undefined) {
					connections[path] = []
					waitingRoom[path] = []
				}

				// Check if room has a host
				if (!roomHosts[path]) {
					// First user becomes host
					roomHosts[path] = socket.id;
					joinRoom(socket, path, username);
					// Notify they are host
					socket.emit("listen-monitor", true); // Reusing/abusing this, or better emit 'you-are-host'
					socket.emit("host-status", true);
				} else {
					// Host exists, put in waiting room
					waitingRoom[path].push(socket.id);
					userNames[socket.id] = username; // Store name so host knows who is waiting
					
					// Notify Host
					io.to(roomHosts[path]).emit("waiting-list", {
						socketId: socket.id,
						username: username
					});
					
					// Notify User they are waiting
					socket.emit("room-status", "WAITING");
				}
			})

			const joinRoom = (socket, path, username) => {
				if(!connections[path]) connections[path] = [];
				if(connections[path].includes(socket.id)) return; // Already joined

				connections[path].push(socket.id);
				timeOnline[socket.id] = new Date();
				if (username) userNames[socket.id] = username;
				
				socket.emit("room-status", "JOINED");

				// Broadcast to existing participants
				for (let a = 0; a < connections[path].length; a++) {
					const participantId = connections[path][a];
					
					// Send full list to the new guy (or everyone to be safe/simple)
					// Actually, standard logic:
					// 1. Tell everyone else "User X joined"
					// 2. Send "All Users" to User X
					
					const usernamesInRoom = connections[path].map(id => ({
						socketId: id,
						username: userNames[id] || "Participant",
						isHost: roomHosts[path] === id
					}));

					io.to(participantId).emit("user-joined", socket.id, connections[path], usernamesInRoom);
				}

				if (messages[path] !== undefined) {
					for (let a = 0; a < messages[path].length; ++a) {
						io.to(socket.id).emit("chat-message", messages[path][a]['data'],
							messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
					}
				}
			}

			// Host admits user
			socket.on("admit-user", (targetSocketId) => {
				// Find room logic (simplified, assuming socket is in one room)
				// In production store socket->room mapping
				// Search for the room where this socket is the host
				
				const roomPath = Object.keys(roomHosts).find(key => roomHosts[key] === socket.id);
				
				if (roomPath && waitingRoom[roomPath] && waitingRoom[roomPath].includes(targetSocketId)) {
					console.log(`Host ${socket.id} admitting ${targetSocketId} to ${roomPath}`);
					
					// Remove from waiting
					waitingRoom[roomPath] = waitingRoom[roomPath].filter(id => id !== targetSocketId);
					
					// Execute join
					const targetSocket = io.sockets.sockets.get(targetSocketId);
					if (targetSocket) {
						joinRoom(targetSocket, roomPath, userNames[targetSocketId]);
						
						// Notify host to update their waiting list UI
						socket.emit("waiting-list-update", waitingRoom[roomPath].map(id => ({socketId: id, username: userNames[id]})));
					}
				}
			});

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
					connections[matchingRoom].forEach((elem) => {
						io.to(elem).emit("chat-message", data, sender, socket.id)
					})
				}
			})

			socket.on("raise-hand", (username) => {
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
							io.to(elem).emit("raise-hand", socket.id, username)
						}
					})
				}
			})

			socket.on("reaction", (emoji, username) => {
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

            // Captions
            socket.on("caption-message", (text, username) => {
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
                            io.to(elem).emit("caption-message", text, username);
                        }
                    })
                }
            })

			// Host Permissions
			socket.on("kick-user", (targetSocketId) => {
				// Find room
				const roomPath = Object.keys(connections).find(key => connections[key].includes(socket.id));
				if (roomPath) {
					// Add to ban list (using username if available, else socketId is futile but illustrative)
					const targetUsername = userNames[targetSocketId];
					if (targetUsername) {
						if (!bannedUsers[roomPath]) bannedUsers[roomPath] = [];
						bannedUsers[roomPath].push(targetUsername);
					}
				}
				
				io.to(targetSocketId).emit("kicked");
				// Disconnect socket logic handled by client leaving, or force here:
				// io.sockets.sockets.get(targetSocketId)?.disconnect();
			})

			socket.on("mute-user", (targetSocketId) => {
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

							// Host Disconnect Logic
							if (roomHosts[key] === socket.id) {
								console.log("Host left room:", key);
								// Assign new host
								if (connections[key].length > 0) {
									const newHostId = connections[key][0];
									roomHosts[key] = newHostId;
									io.to(newHostId).emit("host-status", true);
									io.to(key).emit("system-message", `${userNames[newHostId] || 'Someone'} is now the host.`);
								} else {
									delete roomHosts[key];
								}
							}

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

