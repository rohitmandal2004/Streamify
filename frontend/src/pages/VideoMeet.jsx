import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { motion, AnimatePresence } from 'framer-motion';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import DraggableVideo from '../components/DraggableVideo';
import ChatPanel from '../components/ChatPanel';
import ControlButton from '../components/ControlButton';
import MeetingInfo from '../components/MeetingInfo';
import Input from '../components/Input';
import Button from '../components/Button';
import PersonIcon from '@mui/icons-material/Person';
import { useParams } from 'react-router-dom';
import server from '../environment';
const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {
    const { url: meetingId } = useParams();
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showChat, setShowChat] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);

    useEffect(() => {
        getPermissions();
    }, []);

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({
                    video: videoAvailable,
                    audio: audioAvailable
                });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio]);

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }

    let getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()
        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio)
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let handleSendMessage = (messageText) => {
        if (socketRef.current) {
            socketRef.current.emit('chat-message', messageText, username)
        }
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let connect = () => {
        if (!username.trim()) return;
        setAskForUsername(false);
        getMedia();
    }

    // Lobby Screen
    if (askForUsername) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    className="w-full max-w-lg bg-surface/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Ready to join?</h2>
                        <p className="text-gray-400">Enter your name to let others know who you are</p>
                    </div>

                    <div className="space-y-6">
                        <div className="relative aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/5 shadow-inner group">
                            <video ref={localVideoref} autoPlay muted playsInline className="w-full h-full object-cover mirror-mode" />
                            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Optional: Add mini controls here later */}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Your Name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                icon={PersonIcon}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        connect();
                                    }
                                }}
                                autoFocus
                            />
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={connect}
                                disabled={!username.trim()}
                                className="shadow-primary/20"
                            >
                                Join Meeting
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Main Video Call Room
    return (
        <div className="h-screen w-screen bg-background text-white overflow-hidden relative flex flex-col">
            {/* Meeting Info Header */}
            <div className="absolute top-4 left-4 z-40">
                <MeetingInfo meetingId={meetingId} />
            </div>

            {/* Video Grid */}
            <div className={`
                flex-1 p-4 grid gap-4 overflow-y-auto content-center
                ${videos.length === 0 ? 'grid-cols-1 md:grid-cols-1' : ''}
                ${videos.length === 1 ? 'grid-cols-1 md:grid-cols-2' : ''}
                ${videos.length >= 2 ? 'grid-cols-2 md:grid-cols-3' : ''}
            `}>
                {videos.map((video, index) => (
                    <motion.div
                        key={video.socketId}
                        className="relative bg-surface rounded-2xl overflow-hidden shadow-lg border border-white/5 aspect-video"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <video
                            data-socket={video.socketId}
                            ref={ref => {
                                if (ref && video.stream) {
                                    ref.srcObject = video.stream;
                                }
                            }}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-xs backdrop-blur-sm">
                            Participant
                        </div>
                    </motion.div>
                ))}

                {videos.length === 0 && (
                    <div className="col-span-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                        <div className="w-24 h-24 rounded-full bg-surface animate-pulse flex items-center justify-center">
                            <PersonIcon style={{ fontSize: 40, opacity: 0.2 }} />
                        </div>
                        <p className="text-xl font-medium">Waiting for others to join...</p>
                        <p className="text-sm">Share the meeting link to invite people</p>
                    </div>
                )}
            </div>

            {/* Draggable Self Video */}
            <DraggableVideo videoRef={localVideoref} username={username || 'You'} />

            {/* Control Bar */}
            <motion.div
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-surface/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
                <div className="flex items-center gap-4">
                    <ControlButton
                        icon={video ? VideocamIcon : VideocamOffIcon}
                        onClick={handleVideo}
                        tooltip={video ? 'Turn off camera' : 'Turn on camera'}
                        active={video}
                    />
                    <ControlButton
                        icon={audio ? MicIcon : MicOffIcon}
                        onClick={handleAudio}
                        tooltip={audio ? 'Mute microphone' : 'Unmute microphone'}
                        active={audio}
                    />
                    {screenAvailable && (
                        <ControlButton
                            icon={screen ? StopScreenShareIcon : ScreenShareIcon}
                            onClick={handleScreen}
                            tooltip={screen ? 'Stop sharing' : 'Share screen'}
                            active={screen}
                        />
                    )}
                    <ControlButton
                        icon={ChatIcon}
                        onClick={() => {
                            setShowChat(!showChat);
                            setNewMessages(0);
                        }}
                        tooltip="Open chat"
                        badge={newMessages > 0 ? newMessages : null}
                    />

                    <div className="w-px h-8 bg-white/20 mx-2"></div>

                    <ControlButton
                        icon={CallEndIcon}
                        onClick={handleEndCall}
                        tooltip="End call"
                        variant="danger"
                    />
                </div>
            </motion.div>

            {/* Chat Panel */}
            <ChatPanel
                isOpen={showChat}
                onClose={() => setShowChat(false)}
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUsername={username}
                newMessagesCount={newMessages}
            />
        </div>
    );
}
