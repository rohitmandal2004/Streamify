import React, { useEffect, useRef, useState, useContext } from 'react';
import io from "socket.io-client";
import { motion } from 'framer-motion';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import StopIcon from '@mui/icons-material/Stop';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import ScreenShareIcon from '@mui/icons-material/ScreenShare'; // Added ScreenShareIcon if missing, and Person/MoreVert
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import BlockIcon from '@mui/icons-material/Block';
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // Import Icon

import SelfVideo from '../components/SelfVideo';
import ChatPanel from '../components/ChatPanel';
import ControlButton from '../components/ControlButton';
import Input from '../components/Input';
import Button from '../components/Button';
import OptionsDrawer from '../components/OptionsDrawer';
import SettingsModal from '../components/SettingsModal'; // Import SettingsModal

import { Component as EtheralShadow } from '../components/ui/etheral-shadow';
import CallTimer from '../components/CallTimer';
import { AuthContext } from '../contexts/AuthContext';


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
    const { addToUserHistory, reportUser } = useContext(AuthContext); // Get reportUser

    // Refs
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    const videoRef = useRef([]);
    const connections = useRef({}).current;

    // State
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);
    let [screen, setScreen] = useState(false);
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

    let [showMeetingInfo, setShowMeetingInfo] = useState(false);
    let [callStartTime] = useState(Date.now());
    let [isSocketConnected, setIsSocketConnected] = useState(false);

    // Menu State for Host Actions
    const [activeMenu, setActiveMenu] = useState(null); // socketId of user whose menu is open

    // Waiting Room State
    const [isWaiting, setIsWaiting] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [waitingList, setWaitingList] = useState([]);
    const [settingsOpen, setSettingsOpen] = useState(false); // Define settingsOpen state
    const [history, setHistory] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [showCaptions, setShowCaptions] = useState(false);
    const [captionText, setCaptionText] = useState({ text: '', username: '' });
    const recognitionRef = useRef(null);

    // Report State
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [activeReportTarget, setActiveReportTarget] = useState(null); // { socketId, username }

    const [chatInput, setChatInput] = useState('');

    // --- Init & Permissions ---
    useEffect(() => {
        // Simple permission check (optional, or just rely on the main getUserMedia to fail if denied)
        // We actually don't need to ask permission twice. One stream request is enough to prompt.
        // So we can just let the 'video' effect handle it.
        // However, to set "videoAvailable" capability, we can assume true or check enumerateDevices.
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const videoInput = devices.find(d => d.kind === 'videoinput');
            const audioInput = devices.find(d => d.kind === 'audioinput');
            setVideoAvailable(!!videoInput);
            setAudioAvailable(!!audioInput);
        });

        // Cleanup function for unmounting
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
            stopRecognition(); // Stop speech recognition on unmount
        };
    }, []);

    useEffect(() => {
        if (video) {
            getUserMedia();
        } else {
            // If video is turned off, we might want to stop tracks or show black frame
            // The getUserMediaSuccess logic handles 'black' frame replacement when video is toggled off
            // But if we just toggled state, we need to trigger the black frame logic:
            try {
                // If we have a stream, stop it?
                // Actually the current getUserMediaSuccess logic creates a black frame ONLY when called.
                // We should probably explicitly call a helper to stop video.
                let tracks = localVideoref.current?.srcObject?.getVideoTracks();
                if (tracks) tracks.forEach(t => t.enabled = false);
            } catch (e) { }
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

            // Add to history
            addToUserHistory(meetingId);

            // Host Actions: Kicked
            socketRef.current.on('kicked', () => {
                console.log("Received kicked event");
                alert("You have been kicked from the meeting by the host.");
                navigate('/');
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

            // Waiting Room Logic
            socketRef.current.on('room-status', (status) => {
                if (status === 'WAITING') {
                    setIsWaiting(true);
                } else if (status === 'JOINED') {
                    setIsWaiting(false);
                }
            });

            socketRef.current.on('host-status', (status) => {
                setIsHost(status);
            });

            socketRef.current.on('waiting-list', (user) => {
                setWaitingList(prev => [...prev, user]);
            });

            socketRef.current.on('waiting-list-update', (list) => {
                setWaitingList(list);
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

            socketRef.current.on("user-mute-status", (socketId, muted) => {
                setParticipantsMuted(prev => ({ ...prev, [socketId]: muted }));
            })

            socketRef.current.on("caption-message", (text, senderName) => {
                setCaptionText({ text, username: senderName });
                // Auto hide after 5 seconds
                setTimeout(() => setCaptionText({ text: '', username: '' }), 5000);
            })
        });



        // User Left
        socketRef.current.on('user-left', (id) => {
            // FIX: Explicitly close the connection to stop the video stream immediately on other clients
            if (connections[id]) {
                connections[id].close();
                delete connections[id];
            }

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
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        navigate('/');
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
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => {
                        console.log(e);
                        setScreen(false); // Revert switch if failed
                        // Check if it's a mobile specific error or user cancelled
                        if (e.name === 'NotAllowedError') {
                            // User denied permission
                        } else {
                            alert("Screen sharing functionality is often limited or not supported on mobile browsers or this specific device.");
                        }
                    })
            } else {
                setScreen(false);
                alert("Screen sharing is not supported on this device/browser.");
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

    const handleAdmitUser = (socketId) => {
        if (socketRef.current) {
            socketRef.current.emit('admit-user', socketId);
        }
    }


    const handleReportUser = (socketId, username) => {
        setActiveReportTarget({ socketId, username });
        setActiveMenu(null);
        setReportModalOpen(true);
    };


    // --- Recording Logic ---
    const handleStartRecording = async () => {
        try {
            // We use getDisplayMedia to record the screen. 
            // NOTE: Browsers FORCE a popup to choose what to share/record for security. We cannot bypass this.
            // We set 'preferCurrentTab' to encourage recording the meeting itself.
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "browser", // Prefer browser tab
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                },
                preferCurrentTab: true, // Chrome specific: Default to current tab
                selfBrowserSurface: "include",
                systemAudio: "include"
            });

            // If user wants to record mic audio as well, we'd need to mix streams, 
            // but for simplicity getDisplayMedia captures system audio which is usually what's wanted for meetings.

            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `recording-${new Date().toISOString()}.webm`;
                a.click();
                setRecordedChunks([]);
                setIsRecording(false);

                // Stop tracks
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);

            // Handle user stopping share from browser UI
            stream.getVideoTracks()[0].onended = () => {
                if (recorder.state !== 'inactive') recorder.stop();
            };

        } catch (err) {
            console.error("Error starting recording:", err);
            alert("Could not start recording. Permission denied or not supported.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    };

    // --- Captions Logic ---
    const handleToggleCaptions = () => {
        const newState = !showCaptions;
        setShowCaptions(newState);

        if (newState) {
            startRecognition();
        } else {
            stopRecognition();
            setCaptionText({ text: '', username: '' });
        }
    };

    // --- Captions Overlay Component --- (Moved inline logic to here for clarity if needed, but keeping simple for now)

    const startRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            setShowCaptions(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript;

            // Send to socket ONLY if final (to avoid flooding network with partials)
            if (event.results[current].isFinal) {
                if (socketRef.current) {
                    socketRef.current.emit('caption-message', transcript, username);
                }
            }

            // ALWAYS show local transcript immediately (interim or final)
            // This fixes "not showing" issue as user speaks
            setCaptionText({ text: transcript, username: 'You' });

            // Clear after silence
            if (window.captionTimeout) clearTimeout(window.captionTimeout);
            window.captionTimeout = setTimeout(() => setCaptionText({ text: '', username: '' }), 5000);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    const stopRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
    };

    // --- Render ---
    if (askForUsername) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <EtheralShadow
                        color="rgba(128, 128, 128, 1)"
                        animation={{ scale: 100, speed: 90 }}
                        noise={{ opacity: 1, scale: 1.2 }}
                        sizing="fill"
                        showTitle={false}
                    />
                </div>
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

    if (isWaiting) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden text-center text-white">
                <div className="absolute inset-0 z-0">
                    <EtheralShadow
                        color="rgba(128, 128, 128, 1)"
                        animation={{ scale: 100, speed: 90 }}
                        noise={{ opacity: 1, scale: 1.2 }}
                        sizing="fill"
                        showTitle={false}
                    />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="z-10 bg-surface/30 backdrop-blur-xl p-8 rounded-2xl border border-white/10 max-w-md w-full"
                >
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold mb-2">Waiting for Host</h2>
                    <p className="text-gray-300">The host will let you in shortly.</p>
                </motion.div>
            </div>
        )
    }

    const handleChatSubmit = (e) => {
        if(e.key === 'Enter' || e.type === 'click') {
            if(chatInput.trim()) {
                handleSendMessage(chatInput);
                setChatInput('');
            }
        }
    };

    // Grid Calculation
    const totalParticipants = videos.length + 1; // +1 for self

    // Separate active speaker from others for the layout
    // We can assume local user is active if alone, otherwise the first remote user
    const activeVideo = videos.length > 0 ? videos[0] : null;
    const remainingVideos = videos.length > 0 ? videos.slice(1) : [];

    return (
<div className="bg-video-surface text-video-on-surface overflow-hidden h-screen flex flex-col font-body">
  {/* Scanline effect layer */}
  <div className="fixed inset-0 scanline z-[60] pointer-events-none opacity-50"></div>
  
  {/* Top Bar Component */}
  <header className="w-full top-0 sticky z-50 bg-video-background/80 backdrop-blur-md flex justify-between items-center px-6 py-4 border-b border-video-primary/10">
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-headline font-bold text-video-primary tracking-tighter uppercase italic">Streamify <span className="text-white/90">HQ</span></h1>
      <div className="h-4 w-[1px] bg-video-primary/20"></div>
      <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-video-surface-container-high border border-video-primary/20">
        <span className="w-1.5 h-1.5 rounded-full bg-video-primary animate-pulse shadow-[0_0_8px_#ccff00]"></span>
        <span className="font-label text-[10px] font-bold tracking-[0.2em] text-video-primary"><CallTimer startTime={callStartTime} /></span>
      </div>
      <div className="bg-[#202124]/80 px-3 py-1 rounded-full text-xs font-medium border border-white/10 ml-2 text-white">
        M-ID: {meetingId}
      </div>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="flex -space-x-2">
         {/* Render up to 3 avatars based on total participants */}
         {[...Array(Math.min(3, totalParticipants))].map((_, i) => (
             <div key={i} className="w-8 h-8 rounded-full border-2 border-video-background bg-video-surface-container-highest flex items-center justify-center text-xs text-video-primary font-bold">
                 {(() => {
                    const keys = Object.keys(participantNames);
                    return participantNames[keys[i]]?.charAt(0) || "U";
                 })()}
             </div>
         ))}
         {totalParticipants > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-video-background bg-video-surface-container-highest flex items-center justify-center text-[10px] font-bold text-video-primary">
              +{totalParticipants - 3}
            </div>
         )}
      </div>
      <div className="flex items-center gap-2">
        {isHost && waitingList.length > 0 && (
          <button onClick={() => setShowOptionsDrawer(true)} className="px-3 py-1 text-xs bg-blue-600 rounded-full animate-pulse text-white font-bold">
            {waitingList.length} Waiting
          </button>
        )}
        <button onClick={switchCamera} className="p-2 rounded hover:bg-video-primary/10 transition-colors text-video-on-surface-variant hover:text-video-primary">
          <CameraswitchIcon fontSize="small"/>
        </button>
        <button className="p-2 rounded hover:bg-video-primary/10 transition-colors text-video-on-surface-variant hover:text-video-primary">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 rounded hover:bg-video-primary/10 transition-colors text-video-on-surface-variant hover:text-video-primary">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </div>
  </header>
  
  <main className="flex-1 flex overflow-hidden p-6 gap-6 bg-[radial-gradient(circle_at_center,_#0d140c_0%,_#050805_100%)]">
    {/* Video Grid: Responsive Asymmetric Layout */}
    <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-4 h-full relative">
      
      {/* Active Speaker (Prominent Card) */}
      <div className="col-span-8 row-span-4 relative rounded-xl overflow-hidden bg-video-surface-container-high cyber-border">
          {activeVideo ? (
              <video data-socket={activeVideo.socketId} ref={ref => { if (ref && activeVideo.stream) ref.srcObject = activeVideo.stream; }} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
              <video ref={localVideoref} autoPlay muted playsInline className="w-full h-full object-cover mirror-mode" />
          )}
        
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded glass-panel">
          <span className="material-symbols-outlined text-video-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              {activeVideo ? (participantsMuted[activeVideo.socketId] ? "mic_off" : "mic") : (!audio ? "mic_off" : "mic")}
          </span>
          <span className="text-[10px] font-bold tracking-widest text-white uppercase">
              {activeVideo ? activeVideo.username : (`You ${raisedHands['local'] ? "✋" : ""}`)}
          </span>
        </div>
        {!activeVideo && isRecording && (
        <div className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded-sm flex items-center gap-2 neon-glow">
          <FiberManualRecordIcon fontSize="small" className="text-white animate-pulse" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Recording</span>
        </div>
        )}
        {activeVideo && (
            <div className="absolute top-4 right-4 bg-video-primary px-3 py-1 rounded-sm flex items-center gap-2 neon-glow">
              <span className="material-symbols-outlined text-black text-[14px]">graphic_eq</span>
              <span className="text-[9px] font-black text-black uppercase tracking-widest">Active_Comms</span>
            </div>
        )}
      </div>

      {/* Side / Bottom Videos */}
      {/* Self video if active is not local */}
      {activeVideo && (
          <div className="col-span-4 row-span-2 relative rounded-xl overflow-hidden bg-video-surface-container border border-video-primary/10 group">
              <video ref={localVideoref} autoPlay muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity mirror-mode" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 rounded glass-panel">
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider">You {raisedHands['local'] && "✋"}</span>
                  {!audio && <MicOffIcon fontSize="inherit" className="text-red-500" />}
              </div>
          </div>
      )}

      {/* Remote Videos */}
      {remainingVideos.slice(0, 4).map((v, i) => (
          <div key={v.socketId} className={`${!activeVideo || i >= 1 ? 'col-span-3 row-span-2' : 'col-span-4 row-span-2'} relative rounded-xl overflow-hidden bg-video-surface-container border border-video-primary/10 group`}>
            <video data-socket={v.socketId} ref={ref => { if (ref && v.stream) ref.srcObject = v.stream; }} autoPlay playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 rounded glass-panel z-10">
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">{v.username} {raisedHands[v.socketId] && "✋"}</span>
              {participantsMuted[v.socketId] && <MicOffIcon fontSize="inherit" className="text-red-500" />}
            </div>
            
             {/* Host Controls */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                    onClick={() => setActiveMenu(activeMenu === v.socketId ? null : v.socketId)}
                    className="p-1 rounded bg-black/50 text-white"
                >
                    <MoreVertIcon fontSize="small" />
                </button>
                {activeMenu === v.socketId && (
                    <div className="absolute right-0 top-8 bg-[#3C4043] rounded border border-white/10 py-1 w-24">
                        <button onClick={() => handleMuteUser(v.socketId)} className="w-full text-left px-2 py-1 text-xs hover:bg-white/10 text-white">Mute</button>
                        <button onClick={() => handleKickUser(v.socketId)} className="w-full text-left px-2 py-1 text-xs hover:bg-red-500/20 text-red-400">Kick</button>
                    </div>
                )}
            </div>
          </div>
      ))}
      
      {/* Extra Participants Placeholder */}
      {remainingVideos.length > (activeVideo ? 3 : 4) && (
          <div className="col-span-3 row-span-2 relative rounded-xl overflow-hidden bg-video-surface-container-high border-2 border-dashed border-video-primary/10 flex flex-col items-center justify-center text-video-primary/40 gap-2 hover:bg-video-primary/5 transition-all group cursor-pointer" onClick={() => setShowOptionsDrawer(true)}>
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">group</span>
            <span className="text-[10px] font-black font-headline uppercase tracking-widest">+{remainingVideos.length - (activeVideo ? 3 : 4)}_OTHERS</span>
          </div>
      )}

      {/* Captions Overlay inline */}
      {captionText.text && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl text-white max-w-2xl text-center shadow-lg pointer-events-none z-50">
              <p className="text-sm text-indigo-300 font-bold mb-1 uppercase tracking-wide">{captionText.username}</p>
              <p className="text-xl md:text-2xl font-medium leading-relaxed drop-shadow-md">{captionText.text}</p>
          </div>
      )}

    </div>
    
    {/* Right Side Panel (Chat & Participants) */}
    <aside className="w-80 h-full flex flex-col rounded-xl bg-video-surface-container border border-video-primary/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] z-10 transition-all duration-300 relative">
      <div className="p-4 flex items-center justify-between border-b border-video-primary/10">
        <div className="flex gap-4">
          <button className="text-video-primary font-headline font-bold text-xs border-b-2 border-video-primary pb-1 tracking-widest uppercase">Chat_LOG</button>
          <button className="text-video-on-surface-variant font-headline font-medium text-xs pb-1 hover:text-video-primary transition-colors tracking-widest uppercase" onClick={() => setShowOptionsDrawer(true)}>Users ({totalParticipants})</button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-video-primary/20">
          {messages.map((m, idx) => {
              const date = new Date(m.timestamp);
              const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
              const isMe = m.sender === username;
              return (
                <div key={idx} className={`flex flex-col gap-1 ${isMe ? 'items-end' : ''}`}>
                  <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[9px] font-black text-video-primary uppercase tracking-tighter">{m.sender}</span>
                    <span className="text-[8px] text-video-primary/30">{timeString}</span>
                  </div>
                  <div className={`p-3 rounded text-[11px] leading-relaxed ${isMe ? 'bg-video-primary/10 border border-video-primary/40 text-video-on-surface' : 'bg-[#0a110a] border border-video-primary/20 text-video-on-surface-variant italic'}`}>
                        {m.data}
                  </div>
                </div>
              );
          })}
      </div>
      
      {/* Chat Input */}
      <div className="p-4 bg-video-background/50">
        <div className="relative flex items-center">
          <input 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            onKeyDown={handleChatSubmit}
            className="w-full bg-video-surface-container-highest border border-video-primary/10 rounded-sm py-2 pl-4 pr-10 text-[11px] focus:ring-1 focus:ring-video-primary focus:border-video-primary placeholder-video-primary/20 text-video-primary" 
            placeholder="Enter command..." 
            type="text"
          />
          <button onClick={handleChatSubmit} className="absolute right-2 p-1.5 text-video-primary hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </aside>
  </main>
  
  {/* Bottom Control Bar Component */}
  <footer className="w-full bg-video-background px-10 py-6 flex items-center justify-between border-t border-video-primary/10 relative z-50">
    {/* Left: Meeting Info */}
    <div className="flex items-center gap-4 min-w-[200px]">
      <span className="text-[10px] font-black text-video-primary/60 tracking-[0.3em] uppercase hidden md:inline">Session_Data</span>
      <span className="material-symbols-outlined text-video-primary/40 text-sm hidden md:inline">expand_less</span>
    </div>
    
    {/* Center: Main Controls */}
    <div className="flex items-center gap-4 md:gap-6">
      {/* Mic Control */}
      <button onClick={handleAudio} className={`w-12 h-12 flex items-center justify-center rounded-sm text-video-primary border transition-all active:scale-90 group relative ${!audio ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-video-surface-container-high border-video-primary/30 neon-glow hover:bg-video-primary hover:text-black hover:neon-glow-strong'}`}>
        <span className="material-symbols-outlined group-hover:scale-110">{!audio ? 'mic_off' : 'mic'}</span>
        {audio && <span className="absolute -top-1 -right-1 w-2 h-2 bg-video-primary rounded-full blur-[2px]"></span>}
      </button>
      
      {/* Video Control */}
      <button onClick={handleVideo} className={`w-12 h-12 flex items-center justify-center rounded-sm text-video-primary border transition-all active:scale-90 group relative ${!video ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-video-surface-container-high border-video-primary/30 neon-glow hover:bg-video-primary hover:text-black hover:neon-glow-strong'}`}>
        <span className="material-symbols-outlined group-hover:scale-110">{!video ? 'videocam_off' : 'videocam'}</span>
        {video && <span className="absolute -top-1 -right-1 w-2 h-2 bg-video-primary rounded-full blur-[2px]"></span>}
      </button>

      {/* Screen Share */}
      <button onClick={() => setScreen(!screen)} className={`w-11 h-11 flex items-center justify-center rounded-sm bg-video-surface-container text-video-on-surface-variant/60 border border-video-outline-variant hover:border-video-primary/40 hover:text-video-primary transition-all active:scale-95 ${screen ? '!bg-video-primary !text-black neon-glow' : ''}`}>
        <span className="material-symbols-outlined">present_to_all</span>
      </button>
      
      {/* Reactions (Raise Hand mapped) */}
      <button onClick={handleRaiseHand} className="w-11 h-11 flex items-center justify-center rounded-sm bg-video-surface-container text-video-on-surface-variant/60 border border-video-outline-variant hover:border-video-primary/40 hover:text-video-primary transition-all active:scale-95">
        <span className="material-symbols-outlined">mood</span>
      </button>
      
      {/* More / Settings */}
      <button onClick={() => setSettingsOpen(true)} className="w-11 h-11 flex items-center justify-center rounded-sm bg-video-surface-container text-video-on-surface-variant/60 border border-video-outline-variant hover:border-video-primary/40 hover:text-video-primary transition-all active:scale-95">
         <span className="material-symbols-outlined">settings</span>
      </button>

      {/* Record */}
      <button onClick={isRecording ? handleStopRecording : handleStartRecording} className={`w-11 h-11 flex items-center justify-center rounded-sm bg-video-surface-container border border-video-outline-variant hover:border-red-500/50 hover:text-red-500 transition-all active:scale-95 ${isRecording ? '!text-red-500 !border-red-500/50 shadow-[0_0_15px_rgba(255,85,85,0.4)]' : 'text-video-on-surface-variant/60'}`}>
         <FiberManualRecordIcon fontSize="small" />
      </button>
      
      {/* Captions */}
      <button onClick={handleToggleCaptions} className={`w-11 h-11 flex items-center justify-center rounded-sm bg-video-surface-container border border-video-outline-variant hover:border-video-primary/40 hover:text-video-primary transition-all active:scale-95 hidden sm:flex ${showCaptions ? '!border-blue-500 !text-blue-500 neon-glow' : 'text-video-on-surface-variant/60'}`}>
         <ClosedCaptionIcon fontSize="small" />
      </button>
      
      {/* Leave Button */}
      <button onClick={handleEndCall} className="h-12 px-4 sm:px-8 flex items-center justify-center rounded-sm bg-video-error-container/20 border border-video-error/50 text-video-error font-headline font-black text-[11px] tracking-[0.2em] uppercase hover:bg-video-error hover:text-white transition-all active:scale-95 gap-3 shadow-[0_0_20px_rgba(255,85,85,0.1)]">
        <span className="material-symbols-outlined text-[18px]">call_end</span>
        <span className="hidden sm:inline">Disconnect</span>
      </button>
    </div>
    
    {/* Right: Utility Controls */}
    <div className="flex items-center gap-3 min-w-[200px] justify-end hidden lg:flex">
      <button className="p-2 rounded text-video-primary/40 hover:text-video-primary transition-colors">
        <span className="material-symbols-outlined text-sm">info</span>
      </button>
      <button className="p-2 rounded text-video-primary bg-video-primary/10 border border-video-primary/20 neon-glow">
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
      </button>
      <button onClick={() => setShowOptionsDrawer(true)} className="p-2 rounded text-video-primary/40 hover:text-video-primary transition-colors">
        <span className="material-symbols-outlined text-sm">group</span>
      </button>
    </div>
  </footer>

  {/* Hidden Old OptionsDrawer & Settings Modal */}
  <OptionsDrawer isOpen={showOptionsDrawer} onClose={() => setShowOptionsDrawer(false)} participants={participantNames} videos={videoRef.current} />
  <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
</div>
    );
}
