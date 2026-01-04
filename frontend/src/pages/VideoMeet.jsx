import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { motion, AnimatePresence } from 'framer-motion';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import BlockIcon from '@mui/icons-material/Block';

import SelfVideo from '../components/SelfVideo';
import ChatPanel from '../components/ChatPanel';
import ControlButton from '../components/ControlButton';
import Input from '../components/Input';
import Button from '../components/Button';
import OptionsDrawer from '../components/OptionsDrawer';
import EmojiPicker from '../components/EmojiPicker';
import EmojiBubble from '../components/EmojiBubble';
import FloatingCubes from '../components/3d/FloatingCubes';

import { useNavigate, useParams } from 'react-router-dom';
import server from '../environment';

const server_url = server;

// Peer Config
const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {
    const { url: meetingId } = useParams();
    const navigate = useNavigate();

    // Refs
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    const videoRef = useRef([]);
    const connections = useRef({}).current;

    // State
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

    // Grid & Participants
    let [videos, setVideos] = useState([]); // Remote videos
    let [participantNames, setParticipantNames] = useState({}); // socketId -> username
    let [participantsMuted, setParticipantsMuted] = useState({}); // socketId -> boolean
    let [raisedHands, setRaisedHands] = useState({});

    // UI State
    let [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
    let [showEmojiPicker, setShowEmojiPicker] = useState(false);
    let [reactions, setReactions] = useState([]);
    let [showMeetingInfo, setShowMeetingInfo] = useState(false);
    let [callStartTime] = useState(Date.now());
    let [isSocketConnected, setIsSocketConnected] = useState(false);

    // Menu State for Host Actions
    const [activeMenu, setActiveMenu] = useState(null); // socketId of user whose menu is open

    // --- Init & Permissions ---
    useEffect(() => {
        getPermissions();
    }, []);

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoAvailable(!!videoPermission);
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioAvailable(!!audioPermission);
            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

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
        if (video !== undefined) {
            // Only run getUserMedia on video toggle or init, not audio
            getUserMedia();
        }
    }, [video]);

    // --- Media Handling ---
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({
                video: video ? { facingMode: facingMode } : false,
                audio: audio ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false
            })
                .then(getUserMediaSuccess)
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        if (localVideoref.current) localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue
            // Replace legacy addStream with new tracks logic if needed, but keeping simple for now
            // Actually re-negotiation logic should be here ideally, but this works for basic track replacement usually
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

    // Helpers
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

    // --- Socket Logic ---
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
            socketRef.current.emit('join-call', window.location.href, username)
            socketIdRef.current = socketRef.current.id
            setIsSocketConnected(true);
            setParticipantNames(prev => ({ ...prev, [socketRef.current.id]: username }));

            // Host Actions: Kicked
            socketRef.current.on('kicked', () => {
                console.log("Received kicked event");
                alert("You have been kicked from the meeting by the host.");
                window.location.href = '/';
            });

            // Host Actions: Muted
            socketRef.current.on('muted-by-host', () => {
                console.log("Received muted-by-host event");
                // If audio is on, turn it off
                setAudio(false);
                // We should also disable the track to be sure
                try {
                    window.localStream.getAudioTracks().forEach(track => track.enabled = false);
                } catch (e) { }
                socketRef.current.emit('user-mute-status', true); // Confirm mute
                alert("You have been muted by the host.");
            });

            // Listeners
            socketRef.current.on('chat-message', addMessage)

            // Raise Hand
            socketRef.current.on('raise-hand', (socketId, username) => {
                if (socketId !== socketIdRef.current) {
                    setRaisedHands(prev => ({ ...prev, [socketId]: username }));
                    setTimeout(() => {
                        setRaisedHands(prev => {
                            const newHands = { ...prev };
                            delete newHands[socketId];
                            return newHands;
                        });
                    }, 5000);
                }
            });
        });

        // Reactions
        socketRef.current.on('reaction', (senderId, emoji) => {
            const newReaction = { id: Date.now() + Math.random(), emoji, senderId };
            setReactions(prev => [...prev, newReaction]);
        });

        // User Left
        socketRef.current.on('user-left', (id) => {
            setVideos((videos) => videos.filter((video) => video.socketId !== id))
            // Clean up map
            setParticipantNames(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        })



        socketRef.current.on('user-mute-status', (socketId, muted) => {
            setParticipantsMuted(prev => ({ ...prev, [socketId]: muted }));
        });


        // User Joined
        socketRef.current.on('user-joined', (id, clients, usernamesList) => {
            // Determine Host (meeting creator logic could be here, or just first user logic in UI)

            // Update names
            if (usernamesList && Array.isArray(usernamesList)) {
                const namesMap = {};
                usernamesList.forEach(item => { if (item.socketId && item.username) namesMap[item.socketId] = item.username });
                setParticipantNames(prev => ({ ...prev, ...namesMap }));
                // Update existing videos with names
                setVideos(prev => prev.map(v => ({ ...v, username: namesMap[v.socketId] || v.username })));
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

                    setParticipantNames(prevNames => {
                        const participantName = prevNames[socketListId] || `Participant ${videos.length + 1}`;
                        if (videoExists) {
                            setVideos(videos => {
                                const updated = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream, username: participantName } : video
                                );
                                videoRef.current = updated;
                                return updated;
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
                                const updated = [...videos, newVideo];
                                videoRef.current = updated;
                                return updated;
                            });
                        }
                        return prevNames;
                    })
                };

                // Add local stream
                if (window.localStream !== undefined && window.localStream !== null) {
                    connections[socketListId].addStream(window.localStream)
                } else {
                    let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                    window.localStream = blackSilence()
                    connections[socketListId].addStream(window.localStream)
                }
            });

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
    }

    // --- Control Handlers ---
    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let handleVideo = () => setVideo(!video);
    let handleAudio = () => {
        const newAudioState = !audio;
        setAudio(newAudioState);
        try {
            window.localStream.getAudioTracks().forEach(track => track.enabled = newAudioState);
        } catch (e) { }

        if (socketRef.current) {
            socketRef.current.emit('user-mute-status', !newAudioState); // Emit true if muted (audio false)
        }
    };

    // Updated Switch Camera Logic
    const switchCamera = async () => {
        try {
            // Cycle: user -> environment -> user
            const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
            console.log(`Switching camera to: ${newFacingMode}`);

            let stream;
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacingMode }
            });


            if (stream) {
                const newVideoTrack = stream.getVideoTracks()[0];
                setFacingMode(newFacingMode);

                if (window.localStream) {
                    const oldVideoTrack = window.localStream.getVideoTracks()[0];
                    if (oldVideoTrack) {
                        oldVideoTrack.stop();
                        window.localStream.removeTrack(oldVideoTrack);
                    }
                    window.localStream.addTrack(newVideoTrack);
                }

                if (localVideoref.current) {
                    localVideoref.current.srcObject = window.localStream;
                }

                // Replace track for peers
                for (let id in connections) {
                    const sender = connections[id].getSenders().find(s => s.track && s.track.kind === 'video');
                    if (sender) sender.replaceTrack(newVideoTrack);
                }
            }
        } catch (error) {
            console.error("Camera switch failed:", error);
            // Fallback: try to just get any other camera if exact constraints failed
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(d => d.kind === 'videoinput');
                if (videoDevices.length > 1) {
                    // Just try getting the second one if we are currently on the first, etc. 
                    // Simplified: just alert user for now if direct switch fails.
                    alert("Could not switch camera. Ensure you have permissions.");
                }
            } catch (e) { }
        }
    };

    // Screen Share logic (simplified)
    const getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => {
                        console.log(e);
                        setScreen(false); // Revert switch if failed
                    })
            }
        } else {
            // Stop screen share
            try {
                // Find screen track and stop it
                if (window.localStream) {
                    window.localStream.getVideoTracks().forEach(track => track.stop());
                }
            } catch (e) { }
            getUserMedia(); // Revert to camera
        }
    }
    const getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getVideoTracks().forEach(track => track.stop())
        } catch (e) { }

        // We only want to replace video track, keep audio if possible or replace it too
        // For simplicity, we just use the new stream's tracks

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        // Replace tracks for peers
        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            const videoTrack = stream.getVideoTracks()[0];
            const sender = connections[id].getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender && videoTrack) {
                sender.replaceTrack(videoTrack).catch(e => console.log(e));
            } else {
                // Fallback if no sender or other issues
                connections[id].addStream(window.localStream); // Legacy or just add
                // Renegotiate
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                })
            }
        }

        stream.getVideoTracks()[0].onended = () => {
            setScreen(false);
            // Revert to camera will be handled by useEffect or explicit call
            getUserMedia();
        }
    }
    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen]);
    let handleScreen = () => setScreen(!screen);


    let handleRaiseHand = () => {
        // Emit raise hand
        if (socketRef.current) socketRef.current.emit('raise-hand', username);
        // Local feedback
        setRaisedHands(prev => ({ ...prev, 'local': username }));
        setTimeout(() => {
            setRaisedHands(prev => {
                const n = { ...prev }; delete n['local']; return n;
            });
        }, 5000);
    }

    let handleSendReaction = (emoji) => {
        if (socketRef.current) socketRef.current.emit('reaction', emoji, username || 'Anonymous');
        const newReaction = { id: Date.now() + Math.random(), emoji, senderId: 'local' };
        setReactions(prev => [...prev, newReaction]);
    }

    let handleSendMessage = (text) => {
        if (socketRef.current) socketRef.current.emit('chat-message', text, username)
    }
    const addMessage = (data, sender, socketIdSender) => {
        setMessages(prev => [...prev, { sender, data, timestamp: Date.now() }]);
        if (socketIdSender !== socketIdRef.current) setNewMessages(prev => prev + 1);
    }

    // Host Actions
    const handleKickUser = (targetSocketId) => {
        console.log("Requesting kick for:", targetSocketId);
        if (window.confirm("Are you sure you want to kick this user?")) {
            socketRef.current.emit('kick-user', targetSocketId);
            setActiveMenu(null);
        }
    }
    const handleMuteUser = (targetSocketId) => {
        console.log("Requesting mute for:", targetSocketId);
        socketRef.current.emit('mute-user', targetSocketId);
        setActiveMenu(null);
        alert("Mute command sent.");
    }


    // --- Render ---
    if (askForUsername) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
                <FloatingCubes />
                <motion.div className="w-full max-w-lg bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative z-10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Ready to join?</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden border border-white/5 shadow-inner">
                            <video ref={localVideoref} autoPlay muted playsInline className="w-full h-full object-cover mirror-mode" />
                        </div>
                        <Input label="Your Name" value={username} onChange={(e) => setUsername(e.target.value)} icon={PersonIcon} autoFocus />
                        <Button variant="primary" size="lg" fullWidth onClick={() => { if (username.trim()) { setAskForUsername(false); getMedia(); } }} disabled={!username.trim()}>Join Meeting</Button>
                    </div>
                </motion.div>
            </div>
        );
    }


    // Grid Calculation
    const totalParticipants = videos.length + 1; // +1 for self
    // Determine grid columns based on count
    let gridClass = "grid-cols-1";
    if (totalParticipants > 1) gridClass = "grid-cols-1 md:grid-cols-2";
    if (totalParticipants > 4) gridClass = "grid-cols-2 md:grid-cols-3";
    if (totalParticipants > 9) gridClass = "grid-cols-3 md:grid-cols-4";

    return (
        <div className="h-dvh w-screen bg-[#202124] text-white overflow-hidden relative font-sans flex flex-col">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                <button onClick={() => window.location.href = '/'} className="p-2 -ml-2 text-white/90 pointer-events-auto"><ArrowBackIcon /></button>
                <div className="bg-[#202124]/80 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/10 flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => setShowMeetingInfo(true)}>
                    <span>{meetingId}</span>
                </div>
                <div className="flex items-center gap-1 -mr-2 pointer-events-auto">
                    <button onClick={switchCamera} className="p-2 text-white/90"><CameraswitchIcon /></button>
                </div>
            </div>

            {/* Grid Container - Scrollable if too many, but fixed height to leave room for controls */}
            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
                <div className={`grid ${gridClass} gap-4 w-full h-full max-h-full place-content-center`}>

                    {/* Self Video (Always present) */}
                    <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video border border-white/10 shadow-lg w-full h-full">
                        <video ref={localVideoref} autoPlay muted playsInline className="w-full h-full object-cover mirror-mode" />
                        <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded-md text-xs font-medium backdrop-blur-md">
                            You {raisedHands['local'] && "✋"}
                        </div>
                    </div>

                    {/* Remote Videos */}
                    {videos.map((v) => (
                        <div key={v.socketId} className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video border border-white/10 shadow-lg group w-full h-full">
                            <video
                                data-socket={v.socketId}
                                ref={ref => { if (ref && v.stream) ref.srcObject = v.stream; }}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded-md text-xs font-medium backdrop-blur-md flex items-center gap-2">
                                {v.username || "Participant"}
                                {participantsMuted[v.socketId] && <MicOffIcon fontSize="inherit" className="text-red-500" />}
                                {raisedHands[v.socketId] && <span className="text-lg">✋</span>}
                            </div>

                            {/* Host Controls Menu Trigger */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === v.socketId ? null : v.socketId)}
                                    className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white"
                                >
                                    <MoreVertIcon fontSize="small" />
                                </button>

                                {/* Menu */}
                                {activeMenu === v.socketId && (
                                    <div className="absolute right-0 top-8 bg-[#3C4043] rounded-lg shadow-xl border border-white/10 py-1 w-32 z-50">
                                        <button onClick={() => handleMuteUser(v.socketId)} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
                                            <KeyboardVoiceIcon fontSize="small" className="text-gray-400" /> Mute
                                        </button>
                                        <button onClick={() => handleKickUser(v.socketId)} className="w-full text-left px-3 py-2 text-sm hover:bg-red-500/20 text-red-400 flex items-center gap-2">
                                            <BlockIcon fontSize="small" /> Kick
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Controls */}
            <motion.div className="sticky bottom-0 left-0 right-0 z-50 bg-[#202124] border-t border-white/10 px-4 py-4 safe-area-inset-bottom" initial={{ y: 100 }} animate={{ y: 0 }}>
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <ControlButton icon={CallEndIcon} onClick={handleEndCall} variant="danger" className="!bg-red-600 !hover:bg-red-700 !w-12 !h-12 !rounded-full" />
                    <ControlButton icon={video ? VideocamIcon : VideocamOffIcon} onClick={handleVideo} active={video} className={`!w-12 !h-12 !rounded-full !bg-[#3C4043] ${!video ? '!bg-white !text-black' : '!text-white'}`} />
                    <ControlButton icon={audio ? MicIcon : MicOffIcon} onClick={handleAudio} active={audio} className={`!w-12 !h-12 !rounded-full !bg-[#3C4043] ${!audio ? '!bg-white !text-black' : '!text-white'}`} />
                    <ControlButton icon={EmojiEmotionsIcon} onClick={() => setShowEmojiPicker(!showEmojiPicker)} active={showEmojiPicker} className={`!w-12 !h-12 !rounded-full ${showEmojiPicker ? '!bg-blue-600 !text-white' : '!bg-[#3C4043] !text-white'}`} />
                    <ControlButton icon={MoreVertIcon} onClick={() => setShowOptionsDrawer(true)} className="!bg-[#3C4043] !text-white !w-12 !h-12 !rounded-full" />
                </div>
            </motion.div>

            {/* Overlays */}
            <AnimatePresence>
                {showEmojiPicker && <EmojiPicker onSelect={(emoji) => { handleSendReaction(emoji); setShowEmojiPicker(false); }} onClose={() => setShowEmojiPicker(false)} />}
            </AnimatePresence>
            {reactions.map((reaction) => (
                <EmojiBubble key={reaction.id} emoji={reaction.emoji} onComplete={() => setReactions(prev => prev.filter(r => r.id !== reaction.id))} />
            ))}
            <OptionsDrawer
                isOpen={showOptionsDrawer}
                onClose={() => setShowOptionsDrawer(false)}
                onRaiseHand={() => { handleRaiseHand(); setShowOptionsDrawer(false); }}
                isHandRaised={raisedHands[socketIdRef.current]}
                onChat={() => { setShowChat(true); setShowOptionsDrawer(false); }}
                onScreenShare={() => { handleScreen(); setShowOptionsDrawer(false); }}
                isScreenSharing={screen}
                onFullScreen={() => { !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen(); setShowOptionsDrawer(false); }}
            />
            <ChatPanel isOpen={showChat} onClose={() => setShowChat(false)} messages={messages} onSendMessage={handleSendMessage} currentUsername={username} newMessagesCount={newMessages} />
            <AnimatePresence>
                {showMeetingInfo && (
                    <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMeetingInfo(false)}>
                        <motion.div className="bg-[#202124] border border-white/10 rounded-2xl p-5" onClick={e => e.stopPropagation()}>
                            <h2 className="text-xl font-bold mb-4">Meeting details</h2>
                            <div className="font-mono text-lg font-bold text-white mb-2">{window.location.href}</div>
                            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="text-blue-400">Copy Info</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
