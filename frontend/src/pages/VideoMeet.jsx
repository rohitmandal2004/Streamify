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
import PanToolIcon from '@mui/icons-material/PanTool';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import SelfVideo from '../components/SelfVideo';
import ChatPanel from '../components/ChatPanel';
import ControlButton from '../components/ControlButton';
import MeetingInfo from '../components/MeetingInfo';
import Input from '../components/Input';
import Button from '../components/Button';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
    let [raisedHands, setRaisedHands] = useState({});
    let [showParticipants, setShowParticipants] = useState(false);
    let [showMeetingInfo, setShowMeetingInfo] = useState(false);
    let [callStartTime] = useState(Date.now());
    let [participants, setParticipants] = useState([]);
    let [isSocketConnected, setIsSocketConnected] = useState(false);
    let [participantNames, setParticipantNames] = useState({}); // socketId -> username mapping

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
            console.log('Socket connected:', socketRef.current.id);
            // Emit join-call with username
            socketRef.current.emit('join-call', window.location.href, username)
            socketIdRef.current = socketRef.current.id
            setIsSocketConnected(true);
            
            // Store own username
            setParticipantNames(prev => ({ ...prev, [socketRef.current.id]: username }));

            // Set up event listeners (only once per connection)
            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('raise-hand', (socketId, username) => {
                console.log('Received raise-hand event:', socketId, username, 'Current socketId:', socketIdRef.current);
                // Don't update if it's our own hand (we already updated locally)
                if (socketId !== socketIdRef.current) {
                    setRaisedHands(prev => {
                        const updated = { ...prev, [socketId]: username };
                        console.log('Updated raised hands from other user:', updated);
                        return updated;
                    });
                    setTimeout(() => {
                        setRaisedHands(prev => {
                            const newHands = { ...prev };
                            delete newHands[socketId];
                            console.log('Auto-dismissed raise hand from other user:', socketId);
                            return newHands;
                        });
                    }, 5000);
                } else {
                    console.log('Ignoring own raise-hand event (already handled locally)');
                }
            });

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                setRaisedHands(prev => {
                    const newHands = { ...prev };
                    delete newHands[id];
                    return newHands;
                });
                // Remove from participant names
                setParticipantNames(prev => {
                    const newNames = { ...prev };
                    delete newNames[id];
                    return newNames;
                });
            })

            socketRef.current.on('user-joined', (id, clients, usernamesList) => {
                console.log('User joined event:', id, clients, usernamesList);
                
                    // Update participant names from server
                if (usernamesList && Array.isArray(usernamesList)) {
                    const namesMap = {};
                    usernamesList.forEach(item => {
                        if (item.socketId && item.username) {
                            namesMap[item.socketId] = item.username;
                        }
                    });
                    setParticipantNames(prev => {
                        const updated = { ...prev, ...namesMap };
                        console.log('Updated participant names:', updated);
                        return updated;
                    });
                    
                    // Update video objects with usernames
                    setVideos(prevVideos => {
                        return prevVideos.map(video => ({
                            ...video,
                            username: namesMap[video.socketId] || video.username
                        }));
                    });
                    
                    setParticipants(usernamesList.map(item => ({
                        id: item.socketId,
                        name: item.username
                    })));
                } else {
                    // Fallback if usernamesList not provided
                    setParticipants(clients.map((clientId, idx) => ({
                        id: clientId,
                        name: clientId === socketIdRef.current ? username : participantNames[clientId] || `Participant ${idx + 1}`
                    })));
                }
                
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);
                        
                        // Get username from state using functional update
                        setParticipantNames(prevNames => {
                            const participantName = prevNames[socketListId] || `Participant ${videos.length + 1}`;
                            
                            if (videoExists) {
                                setVideos(videos => {
                                    const updatedVideos = videos.map(video =>
                                        video.socketId === socketListId ? { ...video, stream: event.stream, username: participantName } : video
                                    );
                                    videoRef.current = updatedVideos;
                                    return updatedVideos;
                                });
                            } else {
                                let newVideo = {
                                    socketId: socketListId,
                                    stream: event.stream,
                                    username: participantName,
                                    autoplay: true,
                                    playsinline: true
                                };

                                setVideos(videos => {
                                    const updatedVideos = [...videos, newVideo];
                                    videoRef.current = updatedVideos;
                                    return updatedVideos;
                                });
                            }
                            
                            return prevNames; // Return unchanged state
                        });
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

    let handleRaiseHand = () => {
        // Always update local state for immediate visual feedback
        const currentSocketId = socketIdRef.current || 'local';
        const currentUsername = username || 'You';
        
        console.log('Raising hand - Username:', currentUsername, 'SocketId:', currentSocketId);
        
        // Update local state immediately for visual feedback
        setRaisedHands(prev => {
            const updated = { ...prev, [currentSocketId]: currentUsername };
            console.log('Updated raised hands (local):', updated);
            return updated;
        });
        
        // Try to emit to server if socket is available
        if (socketRef.current && socketIdRef.current && username) {
            try {
                console.log('Emitting raise-hand event to server');
                socketRef.current.emit('raise-hand', username);
            } catch (error) {
                console.error('Error emitting raise-hand:', error);
            }
        } else {
            console.warn('Socket not ready, showing local raise hand only');
        }
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setRaisedHands(prev => {
                const newHands = { ...prev };
                delete newHands[currentSocketId];
                console.log('Auto-dismissed raise hand');
                return newHands;
            });
        }, 5000);
    }

    const formatDuration = (startTime) => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    let handleSendMessage = (messageText) => {
        if (socketRef.current) {
            socketRef.current.emit('chat-message', messageText, username)
        }
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data, timestamp: Date.now() }
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
                    className="w-full max-w-lg bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative z-10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Ready to join?</h2>
                        <p className="text-sm sm:text-base text-gray-400">Enter your name to let others know who you are</p>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <div className="relative aspect-video bg-black/50 rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 shadow-inner group">
                            <video ref={localVideoref} autoPlay muted playsInline className="w-full h-full object-cover mirror-mode" />
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

    // Main Video Call Room - Google Meet Style
    const mainVideo = videos.length > 0 ? videos[0] : null;
    const otherVideos = videos.slice(1);

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden relative">
            {/* Main Video Feed - Google Meet Style */}
            <div className="absolute inset-0 flex items-center justify-center">
                {mainVideo ? (
                    <motion.div
                        className="relative w-full h-full bg-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <video
                            data-socket={mainVideo.socketId}
                            ref={ref => {
                                if (ref && mainVideo.stream) {
                                    ref.srcObject = mainVideo.stream;
                                }
                            }}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                        />
                        
                        {/* Name Label - Bottom Left */}
                        <div className="absolute bottom-20 sm:bottom-24 left-4 sm:left-6 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-2 z-10">
                            <span className="text-sm sm:text-base font-medium text-white">
                                {mainVideo.username || participantNames[mainVideo.socketId] || 'Participant'}
                            </span>
                            {raisedHands[mainVideo.socketId] && (
                                <motion.span
                                    className="text-yellow-400 text-lg"
                                    animate={{ rotate: [0, 14, -8, 14, -8, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                >
                                    ✋
                                </motion.span>
                            )}
                        </div>
                        
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <div className="w-32 h-32 rounded-full bg-surface/20 animate-pulse flex items-center justify-center">
                            <PersonIcon style={{ fontSize: 64, opacity: 0.3 }} />
                        </div>
                        <p className="text-xl sm:text-2xl font-medium">Waiting for others to join...</p>
                        <p className="text-sm sm:text-base">Share the meeting link to invite people</p>
                    </div>
                )}
            </div>

            {/* Self Video - Fixed Bottom Right */}
            {video || audio ? (
                <SelfVideo 
                    videoRef={localVideoref} 
                    username={username || 'You'}
                    audioEnabled={audio}
                    videoEnabled={video}
                />
            ) : null}

            {/* Meeting Info - Bottom Left (Google Meet Style) */}
            <div className="absolute bottom-20 sm:bottom-24 left-4 sm:left-6 z-30">
                <div className="flex flex-col gap-1 text-white/80 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-white/40">•</span>
                        <span className="font-mono">{meetingId}</span>
                    </div>
                </div>
            </div>

            {/* Right Side Panel - Participants, Chat, etc. */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                <motion.button
                    onClick={() => setShowMeetingInfo(!showMeetingInfo)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <InfoIcon style={{ fontSize: 20 }} />
                </motion.button>
                
                <motion.button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <PeopleIcon style={{ fontSize: 20 }} />
                    {videos.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-xs font-bold flex items-center justify-center">
                            {videos.length + 1}
                        </span>
                    )}
                </motion.button>

                <motion.button
                    onClick={() => {
                        setShowChat(!showChat);
                        setNewMessages(0);
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ChatIcon style={{ fontSize: 20 }} />
                    {newMessages > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-xs font-bold flex items-center justify-center">
                            {newMessages}
                        </span>
                    )}
                </motion.button>
            </div>

            {/* Control Bar - Google Meet Style - Mobile Optimized */}
            <motion.div
                className="fixed bottom-2 sm:bottom-4 md:bottom-6 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 bg-black/80 backdrop-blur-xl px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-2xl sm:rounded-full shadow-2xl max-w-full sm:max-w-none"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ bottom: 'max(8px, calc(env(safe-area-inset-bottom, 0px) + 8px))' }}
            >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto scrollbar-hide">
                    <ControlButton
                        icon={audio ? MicIcon : MicOffIcon}
                        onClick={handleAudio}
                        tooltip={audio ? 'Mute microphone' : 'Unmute microphone'}
                        active={audio}
                        variant={audio ? 'default' : 'danger'}
                        className="flex-shrink-0"
                    />
                    <ControlButton
                        icon={video ? VideocamIcon : VideocamOffIcon}
                        onClick={handleVideo}
                        tooltip={video ? 'Turn off camera' : 'Turn on camera'}
                        active={video}
                        variant={video ? 'default' : 'danger'}
                        className="flex-shrink-0"
                    />
                    {screenAvailable && (
                        <ControlButton
                            icon={screen ? StopScreenShareIcon : ScreenShareIcon}
                            onClick={handleScreen}
                            tooltip={screen ? 'Stop sharing' : 'Share screen'}
                            active={screen}
                            className="flex-shrink-0"
                        />
                    )}
                    <ControlButton
                        icon={PanToolIcon}
                        onClick={handleRaiseHand}
                        tooltip="Raise hand"
                        active={raisedHands[socketIdRef.current] !== undefined || raisedHands['local'] !== undefined}
                        className="flex-shrink-0"
                    />
                    <ControlButton
                        icon={ChatIcon}
                        onClick={() => {
                            setShowChat(!showChat);
                            setNewMessages(0);
                        }}
                        tooltip="Open chat"
                        active={showChat}
                        badge={newMessages > 0 ? newMessages : null}
                        className="flex-shrink-0"
                    />

                    <div className="w-px h-6 sm:h-8 bg-white/20 mx-1 sm:mx-2 flex-shrink-0"></div>

                    <ControlButton
                        icon={CallEndIcon}
                        onClick={handleEndCall}
                        tooltip="Leave call"
                        variant="danger"
                        className="flex-shrink-0"
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

            {/* Participants Panel - Google Meet Style */}
            <AnimatePresence>
                {showParticipants && (
                    <motion.div
                        className="fixed inset-y-0 right-0 w-full sm:w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
                            <h2 className="font-semibold text-lg">People ({videos.length + 1})</h2>
                            <button
                                onClick={() => setShowParticipants(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {username ? username[0].toUpperCase() : 'Y'}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-white">{username || 'You'}</div>
                                    <div className="text-xs text-gray-400">You</div>
                                </div>
                                <span className="text-xs text-green-400">●</span>
                            </div>
                            {videos.map((video, index) => {
                                const participantName = participantNames[video.socketId] || `Participant ${index + 1}`;
                                return (
                                    <div key={video.socketId} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                            {participantName[0]?.toUpperCase() || String.fromCharCode(65 + index)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-white">{participantName}</div>
                                            <div className="text-xs text-gray-400">Connected</div>
                                        </div>
                                        {raisedHands[video.socketId] && (
                                            <span className="text-xl animate-bounce">✋</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Meeting Info Modal */}
            <AnimatePresence>
                {showMeetingInfo && (
                        <motion.div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 safe-area-inset"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMeetingInfo(false)}
                        >
                            <motion.div
                                className="bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold">Meeting Information</h2>
                                <button
                                    onClick={() => setShowMeetingInfo(false)}
                                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wider">Meeting Code</label>
                                    <div className="mt-1 font-mono text-lg font-bold text-white">{meetingId}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wider">Duration</label>
                                    <div className="mt-1 text-lg font-semibold text-white">{formatDuration(callStartTime)}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wider">Participants</label>
                                    <div className="mt-1 text-lg font-semibold text-white">{videos.length + 1} person{videos.length !== 0 ? 's' : ''}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wider">Meeting Link</label>
                                    <div className="mt-2 flex items-center gap-2 bg-white/5 rounded-xl p-3">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${window.location.origin}/${meetingId}`}
                                            className="flex-1 bg-transparent text-sm text-white font-mono"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/${meetingId}`);
                                            }}
                                            className="p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-colors"
                                        >
                                            <ContentCopyIcon fontSize="small" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
