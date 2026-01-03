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
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SelfVideo from '../components/SelfVideo';
import ChatPanel from '../components/ChatPanel';
import ControlButton from '../components/ControlButton';
import MeetingInfo from '../components/MeetingInfo';
import Input from '../components/Input';
import Button from '../components/Button';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // 3 dots
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import OptionsDrawer from '../components/OptionsDrawer';
import EmojiPicker from '../components/EmojiPicker';
import EmojiBubble from '../components/EmojiBubble';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
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
    const [facingMode, setFacingMode] = useState('user');
    const [isFullScreen, setIsFullScreen] = useState(false);
    let [username, setUsername] = useState("");
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);
    let [raisedHands, setRaisedHands] = useState({});
    let [showParticipants, setShowParticipants] = useState(false);
    let [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
    let [showEmojiPicker, setShowEmojiPicker] = useState(false);
    let [reactions, setReactions] = useState([]); // { id, emoji, senderId }
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
                    video: videoAvailable ? { facingMode: 'user' } : false,
                    audio: audioAvailable ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false
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
            navigator.mediaDevices.getUserMedia({
                video: video ? { facingMode: facingMode } : false,
                audio: audio ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false
            })
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

            socketRef.current.on('reaction', (senderId, emoji) => {
                const newReaction = {
                    id: Date.now() + Math.random(),
                    emoji,
                    senderId
                };
                setReactions(prev => [...prev, newReaction]);
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

    let handleSendReaction = (emoji) => {
        // Emit to server
        if (socketRef.current) {
            socketRef.current.emit('reaction', emoji, username || 'Anonymous');
        }

        // Add locally immediately
        const newReaction = {
            id: Date.now() + Math.random(),
            emoji,
            senderId: socketRef.current ? socketRef.current.id : 'local'
        };
        setReactions(prev => [...prev, newReaction]);
    };

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

    const switchCamera = async () => {
        try {
            const newFacingMode = facingMode === 'user' ? 'environment' : 'user';

            // Log for debugging
            console.log(`Attempting to switch camera to: ${newFacingMode}`);

            let stream;
            try {
                // First try with exact constraint
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: newFacingMode } }
                });
            } catch (err) {
                console.warn("Exact facingMode failed, trying loose constraint...", err);
                // Fallback to loose constraint
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: newFacingMode }
                });
            }

            if (stream) {
                const newVideoTrack = stream.getVideoTracks()[0];

                // Update State
                setFacingMode(newFacingMode);

                // Stop old video track
                if (window.localStream) {
                    const oldVideoTrack = window.localStream.getVideoTracks()[0];
                    if (oldVideoTrack) {
                        oldVideoTrack.stop();
                        window.localStream.removeTrack(oldVideoTrack);
                    }
                    window.localStream.addTrack(newVideoTrack);
                }

                // Update Local Video Ref
                if (localVideoref.current) {
                    localVideoref.current.srcObject = null; // Clear first
                    localVideoref.current.srcObject = window.localStream;
                }

                // Replace track in all peer connections
                for (let id in connections) {
                    const sender = connections[id].getSenders().find(s => s.track && s.track.kind === 'video');
                    if (sender) {
                        console.log(`Replacing track for connection ${id}`);
                        sender.replaceTrack(newVideoTrack);
                    }
                }
            }
        } catch (error) {
            console.error("Error switching camera:", error);
            alert("Could not switch camera. Please ensure you have multiple cameras and permissions are granted.");
        }
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullScreen(true)).catch(e => console.log(e));
        } else {
            document.exitFullscreen().then(() => setIsFullScreen(false)).catch(e => console.log(e));
        }
    };

    return (
        <div className="h-dvh w-screen bg-[#202124] text-white overflow-hidden relative font-sans">
            {/* Top Bar - Mobile Style */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 safe-area-inset-top flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                <button onClick={() => window.location.href = '/'} className="p-2 -ml-2 text-white/90 pointer-events-auto">
                    <ArrowBackIcon />
                </button>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="bg-[#202124]/80 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/10 flex items-center gap-2 cursor-pointer" onClick={() => setShowMeetingInfo(true)}>
                        <span>{meetingId.substring(0, 3)}-{meetingId.substring(3, 7)}...</span>
                        <span className="w-px h-3 bg-white/20"></span>
                        <span className="text-xs text-white/60">{formatDuration(callStartTime)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 -mr-2 pointer-events-auto">
                    <button className="p-2 text-white/90">
                        <VolumeUpIcon />
                    </button>
                    <button onClick={switchCamera} className="p-2 text-white/90">
                        <CameraswitchIcon />
                    </button>
                </div>
            </div>

            {/* Main Video Feed */}
            <div className="absolute inset-0 flex items-center justify-center">
                {mainVideo ? (
                    <div className="relative w-full h-full bg-[#202124]">
                        <video
                            data-socket={mainVideo.socketId}
                            ref={ref => {
                                if (ref && mainVideo.stream) {
                                    ref.srcObject = mainVideo.stream;
                                }
                            }}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {/* Name Label - Floating Pill */}
                        <div className="absolute bottom-32 left-4 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-2 z-10">
                            <span className="text-sm font-medium text-white">
                                {mainVideo.username || participantNames[mainVideo.socketId] || 'Participant'}
                            </span>
                            {raisedHands[mainVideo.socketId] && (
                                <span className="text-lg">✋</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-4xl text-blue-600 font-medium">
                                {username ? username[0].toUpperCase() : 'Y'}
                            </span>
                        </div>
                        <p className="text-lg font-google-sans">Waiting for others...</p>
                        <p className="text-sm text-gray-500">Share this code: {meetingId}</p>
                    </div>
                )}
            </div>

            {/* Self Video - Adjusted for new layout */}
            {video || audio ? (
                <SelfVideo
                    videoRef={localVideoref}
                    username={username || 'You'}
                    audioEnabled={audio}
                    videoEnabled={video}
                />
            ) : null}

            {/* Bottom Control Bar - Simplified */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 bg-[#202124] border-t border-white/10 px-4 py-4 safe-area-inset-bottom"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
            >
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <ControlButton
                        icon={CallEndIcon}
                        onClick={handleEndCall}
                        variant="danger"
                        className="!bg-red-600 !hover:bg-red-700 !w-12 !h-12 !rounded-full"
                    />

                    <ControlButton
                        icon={video ? VideocamIcon : VideocamOffIcon}
                        onClick={handleVideo}
                        active={video}
                        className={`!w-12 !h-12 !rounded-full !bg-[#3C4043] ${!video ? '!bg-white !text-black' : '!text-white'}`}
                    />

                    <ControlButton
                        icon={audio ? MicIcon : MicOffIcon}
                        onClick={handleAudio}
                        active={audio}
                        className={`!w-12 !h-12 !rounded-full !bg-[#3C4043] ${!audio ? '!bg-white !text-black' : '!text-white'}`}
                    />

                    <ControlButton
                        icon={EmojiEmotionsIcon} // Reaction placeholder
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        active={showEmojiPicker}
                        className={`!w-12 !h-12 !rounded-full ${showEmojiPicker ? '!bg-blue-600 !text-white' : '!bg-[#3C4043] !text-white'}`}
                    />

                    <ControlButton
                        icon={MoreVertIcon}
                        onClick={() => setShowOptionsDrawer(true)}
                        className="!bg-[#3C4043] !text-white !w-12 !h-12 !rounded-full"
                    />
                </div>
            </motion.div>

            {/* Emoji Picker */}
            <AnimatePresence>
                {showEmojiPicker && (
                    <EmojiPicker
                        onSelect={(emoji) => {
                            handleSendReaction(emoji);
                            setShowEmojiPicker(false);
                        }}
                        onClose={() => setShowEmojiPicker(false)}
                    />
                )}
            </AnimatePresence>

            {/* Floating Reactions */}
            {reactions.map((reaction) => (
                <EmojiBubble
                    key={reaction.id}
                    emoji={reaction.emoji}
                    onComplete={() => {
                        setReactions(prev => prev.filter(r => r.id !== reaction.id));
                    }}
                />
            ))}

            {/* Options Drawer */}
            <OptionsDrawer
                isOpen={showOptionsDrawer}
                onClose={() => setShowOptionsDrawer(false)}
                onRaiseHand={() => {
                    handleRaiseHand();
                    setShowOptionsDrawer(false);
                }}
                isHandRaised={raisedHands[socketIdRef.current] !== undefined || raisedHands['local'] !== undefined}
                onChat={() => {
                    setShowChat(true);
                    setShowOptionsDrawer(false);
                }}
                onScreenShare={() => {
                    handleScreen();
                    setShowOptionsDrawer(false);
                }}
                isScreenSharing={screen}
                onFullScreen={() => {
                    toggleFullScreen();
                    setShowOptionsDrawer(false);
                }}
                isFullScreen={isFullScreen}
            />

            {/* Chat Panel - Full screen on mobile usually, keeping side panel for now but can be improved */}
            <ChatPanel
                isOpen={showChat}
                onClose={() => setShowChat(false)}
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUsername={username}
                newMessagesCount={newMessages}
            />

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
                            className="bg-[#202124] border border-white/10 rounded-2xl p-5 max-w-sm w-full shadow-2xl"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Meeting details</h2>
                                <button
                                    onClick={() => setShowMeetingInfo(false)}
                                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wider">Joining Info</label>
                                    <div className="mt-1 font-mono text-lg font-bold text-white">{window.location.href}</div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                        }}
                                        className="mt-2 flex items-center gap-2 text-blue-400 font-medium text-sm"
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                        Copy joining info
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
