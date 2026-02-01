import React, { useEffect, useRef, useState, useContext } from 'react';
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
import PauseIcon from '@mui/icons-material/Pause';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
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

import FloatingCubes from '../components/3d/FloatingCubes';
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

    const submitReport = async ({ reason, description }) => {
        if (!activeReportTarget) return;

        try {
            await reportUser({
                reporterId: username, // Current user
                reportedId: activeReportTarget.username || activeReportTarget.socketId,
                roomCode: meetingId,
                reason,
                description
            });
            alert(`Report submitted for ${activeReportTarget.username}`);
        } catch (error) {
            console.error("Report error:", error);
            alert("Failed to submit report. Please try again.");
        }
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

    if (isWaiting) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden text-center text-white">
                <FloatingCubes />
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
                <button onClick={() => navigate('/')} className="p-2 -ml-2 text-white/90 pointer-events-auto"><ArrowBackIcon /></button>
                <div className="flex items-center gap-3">
                    <div className="bg-[#202124]/80 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/10 flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => setShowMeetingInfo(true)}>
                        <span>{meetingId}</span>
                    </div>
                    <CallTimer startTime={callStartTime} />
                </div>
                <div className="flex items-center gap-1 -mr-2 pointer-events-auto">
                    {/* Host Waiting List Indicator */}
                    {isHost && waitingList.length > 0 && (
                        <div className="relative mr-2">
                            <button onClick={() => setShowOptionsDrawer(true)} className="bg-blue-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                                {waitingList.length} Waiting
                            </button>
                        </div>
                    )}
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
                                        <div className="h-px bg-white/10 my-1" />
                                        <button onClick={() => handleReportUser(v.socketId, v.username)} className="w-full text-left px-3 py-2 text-sm hover:bg-red-500/20 text-red-400 flex items-center gap-2">
                                            <ReportProblemIcon fontSize="small" /> Report
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
                    <ControlButton icon={isRecording ? StopIcon : FiberManualRecordIcon} onClick={isRecording ? handleStopRecording : handleStartRecording} active={isRecording} className={`!w-12 !h-12 !rounded-full !bg-[#3C4043] ${isRecording ? '!bg-red-500 !text-white' : '!text-white'}`} />
                    <ControlButton icon={ClosedCaptionIcon} onClick={handleToggleCaptions} active={showCaptions} className={`!w-12 !h-12 !rounded-full !bg-[#3C4043] ${showCaptions ? '!bg-blue-500 !text-white' : '!text-white'}`} />
                    <ControlButton icon={MoreVertIcon} onClick={() => setShowOptionsDrawer(true)} className="!bg-[#3C4043] !text-white !w-12 !h-12 !rounded-full" />
                </div>
            </motion.div>

            {/* Captions Overlay - Fixed Z-Index and Position */}
            {captionText.text && (
                <div className="fixed bottom-24 left-0 right-0 flex justify-center z-[100] pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl text-white max-w-2xl text-center shadow-lg transition-all transform animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-sm text-indigo-300 font-bold mb-1 uppercase tracking-wide">{captionText.username}</p>
                        <p className="text-xl md:text-2xl font-medium leading-relaxed drop-shadow-md">{captionText.text}</p>
                    </div>
                </div>
            )}

            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}
