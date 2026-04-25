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
import CloseIcon from '@mui/icons-material/Close';

import ScreenShareIcon from '@mui/icons-material/ScreenShare'; // Added ScreenShareIcon if missing, and Person/MoreVert
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import BlockIcon from '@mui/icons-material/Block';
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // Import Icon
import GroupIcon from '@mui/icons-material/Group';
import SendIcon from '@mui/icons-material/Send';
import PanToolIcon from '@mui/icons-material/PanTool';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import MoodIcon from '@mui/icons-material/Mood';
import { AnimatePresence } from 'framer-motion';

import SelfVideo from '../components/SelfVideo';
import ChatPanel from '../components/ChatPanel';
import ControlButton from '../components/ControlButton';
import Input from '../components/Input';
import Button from '../components/Button';
import OptionsDrawer from '../components/OptionsDrawer';
import SettingsModal from '../components/SettingsModal'; // Import SettingsModal
import Toast from '../components/Toast';

import { Component as EtheralShadow } from '../components/ui/etheral-shadow';
import CallTimer from '../components/CallTimer';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';


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
    const { addToUserHistory, updateMeetingDuration, reportUser } = useContext(AuthContext);

    // Refs
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    const videoRef = useRef([]);
    const connections = useRef({}).current;
    const [historyId, setHistoryId] = useState(null);

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

    // PiP & Reactions
    const [floatingReactions, setFloatingReactions] = useState([]);
    const [showReactionsMenu, setShowReactionsMenu] = useState(false);
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
    
    const [toastConfig, setToastConfig] = useState({ open: false, message: '', type: 'info' });
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    

    const [meetingSettings, setMeetingSettings] = useState({
        isLocked: false,
        muteAllOnEntry: false,
        waitingRoomEnabled: true
    });
    
    const [localSettings, setLocalSettings] = useState({
        audioInputId: localStorage.getItem('audioInputId') || 'default',
        audioOutputId: localStorage.getItem('audioOutputId') || 'default',
        videoInputId: localStorage.getItem('videoInputId') || 'default',
        videoQuality: localStorage.getItem('videoQuality') || '720p',
        noiseSuppression: localStorage.getItem('noiseSuppression') !== 'false',
        mirrorVideo: localStorage.getItem('mirrorVideo') !== 'false',
        lowDataMode: localStorage.getItem('lowDataMode') === 'true',
        closedCaptionsDefault: localStorage.getItem('closedCaptionsDefault') === 'true'
    });

    useEffect(() => {
        if (localSettings.closedCaptionsDefault) {
            setShowCaptions(true);
        }
    }, [localSettings.closedCaptionsDefault]);

    const handleLocalSettingsSave = (newSettings) => {
        setLocalSettings(newSettings);
        // If settings changed, refresh media tracks
        if (window.localStream) {
            getUserMedia();
        }
    };
    
    const handleMeetingSettingsChange = (key, value) => {
        if (!isHost) return;
        const updatedSettings = { ...meetingSettings, [key]: value };
        setMeetingSettings(updatedSettings);
        if (socketRef.current) {
            socketRef.current.emit('update-meeting-settings', { [key]: value });
            handleShowToast(`Setting updated.`, "success");
        }
    };

    const handleShowToast = (message, type = 'info') => {
        setToastConfig({ open: true, message, type });
    };

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
            let videoConstraints = video ? { facingMode: facingMode } : false;
            if (videoConstraints && localSettings.videoInputId !== 'default') {
                videoConstraints.deviceId = { exact: localSettings.videoInputId };
            }
            if (videoConstraints && localSettings.lowDataMode) {
                videoConstraints.width = { ideal: 480 };
                videoConstraints.height = { ideal: 360 };
                videoConstraints.frameRate = { ideal: 15 };
            }

            let audioConstraints = audio ? { 
                echoCancellation: true, 
                noiseSuppression: localSettings.noiseSuppression, 
                autoGainControl: true 
            } : false;
            if (audioConstraints && localSettings.audioInputId !== 'default') {
                audioConstraints.deviceId = { exact: localSettings.audioInputId };
            }

            navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: audioConstraints
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
            addToUserHistory(meetingId).then((data) => {
                if (data && data.id) {
                    setHistoryId(data.id);
                }
            });

            // Host Actions: Kicked
            socketRef.current.on('kicked', () => {
                console.log("Received kicked event");
                alert("You have been kicked from the meeting or the room is locked.");
                navigate('/');
            });

            socketRef.current.on('meeting-settings-updated', (newSettings) => {
                setMeetingSettings(newSettings);
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

            socketRef.current.on("reaction", (socketId, emoji, senderName) => {
                const reactionItem = { id: Date.now() + Math.random(), emoji, username: senderName, left: Math.random() * 80 + 10 };
                setFloatingReactions(prev => [...prev, reactionItem]);
                setTimeout(() => {
                    setFloatingReactions(prev => prev.filter(r => r.id !== reactionItem.id));
                }, 4000);
            });
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

        if (historyId) {
            const durationMins = Math.max(1, Math.floor((Date.now() - callStartTime) / 60000));
            updateMeetingDuration(historyId, durationMins);
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

    const handleReaction = (emoji) => {
        if (socketRef.current) {
            socketRef.current.emit("reaction", emoji, username);
        }
        const reactionItem = { id: Date.now() + Math.random(), emoji, username: 'You', left: Math.random() * 80 + 10 };
        setFloatingReactions(prev => [...prev, reactionItem]);
        setShowReactionsMenu(false);
        setTimeout(() => {
            setFloatingReactions(prev => prev.filter(r => r.id !== reactionItem.id));
        }, 4000);
    };

    const handlePiP = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                let videoElement = null;
                if (activeVideo && activeVideo.socketId) {
                    videoElement = document.querySelector(`video[data-socket="${activeVideo.socketId}"]`);
                }
                
                if (!videoElement) {
                    videoElement = localVideoref.current;
                }

                if (videoElement) {
                    await videoElement.requestPictureInPicture();
                } else {
                    handleShowToast("No video available for PiP", "error");
                }
            }
        } catch (error) {
            console.error("PiP Error:", error);
            handleShowToast("Picture-in-Picture is not supported or failed", "error");
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
                    handleShowToast("Could not switch camera. Ensure you have permissions.", "error");
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
                            handleShowToast("Screen sharing functionality is often limited or not supported on mobile browsers or this specific device.", "warning");
                        }
                    })
            } else {
                setScreen(false);
                handleShowToast("Screen sharing is not supported on this device/browser.", "error");
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
        handleShowToast("Mute command sent.", "success");
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
            handleShowToast("Could not start recording. Permission denied or not supported.", "error");
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
            <div className="fixed inset-0 h-[100dvh] flex items-center justify-center p-4 overflow-hidden">
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
                            <video ref={localVideoref} autoPlay muted playsInline className={`w-full h-full object-cover ${localSettings.mirrorVideo ? 'scale-x-[-1]' : ''}`} />
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
            <div className="fixed inset-0 h-[100dvh] flex flex-col items-center justify-center p-4 overflow-hidden text-center text-white">
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
<div className="bg-black text-white overflow-hidden h-[100dvh] flex flex-col font-sans">
  
  {/* Top Bar Component */}
  <header className="w-full z-50 bg-black/40 backdrop-blur-xl flex justify-between items-center px-3 md:px-6 py-2 md:py-3 border-b border-white/10 flex-shrink-0">
    <div className="flex items-center gap-4">
      <Logo size="sm" clickable={false} />
      <div className="h-6 w-[1px] bg-white/10 hidden md:block"></div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgb(99,102,241)]"></span>
        <span className="text-xs font-bold tracking-widest text-indigo-300"><CallTimer startTime={callStartTime} /></span>
      </div>
      <div className="bg-white/5 pl-3 pr-1 py-1 rounded-full text-[10px] sm:text-xs font-medium border border-white/10 ml-1 sm:ml-2 text-gray-300 flex items-center gap-1 sm:gap-2">
        <span className="truncate max-w-[70px] sm:max-w-[120px]">M-ID: {meetingId}</span>
        <button 
            onClick={() => {
                navigator.clipboard.writeText(meetingId);
                handleShowToast("Meeting ID copied to clipboard", "success");
            }}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-indigo-400 flex items-center justify-center"
            title="Copy Meeting ID"
        >
            <ContentCopyIcon style={{ fontSize: '14px' }} />
        </button>
      </div>
    </div>
    
    <div className="flex items-center gap-4 md:gap-6">
      <div className="flex -space-x-2">
         {/* Render up to 3 avatars based on total participants */}
         {[...Array(Math.min(3, totalParticipants))].map((_, i) => (
             <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 font-bold backdrop-blur-md">
                 {(() => {
                    const keys = Object.keys(participantNames);
                    return participantNames[keys[i]]?.charAt(0) || "U";
                 })()}
             </div>
         ))}
         {totalParticipants > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-black bg-surface/30 flex items-center justify-center text-[10px] font-bold text-gray-300 backdrop-blur-md">
              +{totalParticipants - 3}
            </div>
         )}
      </div>
      <div className="flex items-center gap-2">
        {isHost && waitingList.length > 0 && (
          <button onClick={() => setShowOptionsDrawer(true)} className="px-3 py-1 text-xs bg-indigo-600 rounded-full animate-pulse text-white font-bold hover:bg-indigo-500 transition-colors">
            {waitingList.length} Waiting
          </button>
        )}
        <button onClick={switchCamera} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-gray-300 hover:text-white">
          <CameraswitchIcon fontSize="small"/>
        </button>
      </div>
    </div>
  </header>
  
  <main className="flex-1 flex overflow-hidden p-2 md:p-4 gap-2 md:gap-4 relative min-h-0">
    {/* Abstract Background Elements */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none"></div>

    {/* Video Grid */}
    <div className="flex-1 flex flex-col md:grid md:grid-cols-12 md:grid-rows-6 gap-2 md:gap-4 h-full relative z-10 min-h-0">
      
      {/* Active Speaker */}
      <div className="flex-1 md:col-span-8 md:row-span-6 relative rounded-xl md:rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl group min-h-0">
          {activeVideo ? (
              <video data-socket={activeVideo.socketId} ref={ref => { if (ref && activeVideo.stream) ref.srcObject = activeVideo.stream; }} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
              <video ref={localVideoref} autoPlay muted playsInline className={`w-full h-full object-cover ${localSettings.mirrorVideo ? 'scale-x-[-1]' : ''}`} />
          )}
        
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
          {activeVideo ? (participantsMuted[activeVideo.socketId] ? <MicOffIcon fontSize="small" className="text-white/80" /> : <MicIcon fontSize="small" className="text-white/80" />) : (!audio ? <MicOffIcon fontSize="small" className="text-white/80" /> : <MicIcon fontSize="small" className="text-white/80" />)}

          <span className="text-[11px] font-bold tracking-wide text-white">
              {activeVideo ? activeVideo.username : (`You ${raisedHands['local'] ? "✋" : ""}`)}
          </span>
        </div>
        {!activeVideo && isRecording && (
        <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-md border border-red-500/50 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
          <FiberManualRecordIcon fontSize="small" className="text-white animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Recording</span>
        </div>
        )}
      </div>

      {/* Side / Bottom Videos */}
      <div className="h-20 md:h-auto md:col-span-4 md:row-span-6 flex md:flex-col gap-2 md:gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar flex-shrink-0">
        {/* Self video if active is not local */}
        {activeVideo && (
            <div className="w-28 h-20 md:w-full md:h-auto flex-shrink-0 relative rounded-lg md:rounded-2xl overflow-hidden bg-surface/30 backdrop-blur-xl border border-white/10 group md:aspect-auto md:flex-1 md:max-w-none">
                <video ref={localVideoref} autoPlay muted playsInline className={`w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity ${localSettings.mirrorVideo ? 'scale-x-[-1]' : ''}`} />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 z-10">
                    <span className="text-[10px] font-bold text-white tracking-wide">You {raisedHands['local'] && "✋"}</span>
                    {!audio && <MicOffIcon fontSize="inherit" className="text-red-400" />}
                </div>
            </div>
        )}

        {/* Remote Videos */}
        {remainingVideos.slice(0, 4).map((v, i) => (
            <div key={v.socketId} className="w-28 h-20 md:w-full md:h-auto flex-shrink-0 relative rounded-lg md:rounded-2xl overflow-hidden bg-surface/30 backdrop-blur-xl border border-white/10 group md:aspect-auto md:flex-1 md:max-w-none">
              <video data-socket={v.socketId} ref={ref => { if (ref && v.stream) ref.srcObject = v.stream; }} autoPlay playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 z-10">
                <span className="text-[10px] font-bold text-white tracking-wide">{v.username} {raisedHands[v.socketId] && "✋"}</span>
                {participantsMuted[v.socketId] && <MicOffIcon fontSize="inherit" className="text-red-400" />}
              </div>
              
              {/* Host Controls */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                      onClick={() => setActiveMenu(activeMenu === v.socketId ? null : v.socketId)}
                      className="p-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/10"
                  >
                      <MoreVertIcon fontSize="small" />
                  </button>
                  {activeMenu === v.socketId && (
                      <div className="absolute right-0 top-8 bg-surface/90 backdrop-blur-xl rounded-xl border border-white/10 py-1 w-28 overflow-hidden shadow-xl">
                          <button onClick={() => handleMuteUser(v.socketId)} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 text-white transition-colors">Mute Audio</button>
                          <button onClick={() => handleKickUser(v.socketId)} className="w-full text-left px-3 py-2 text-xs hover:bg-red-500/20 text-red-400 transition-colors">Kick User</button>
                      </div>
                  )}
              </div>
            </div>
        ))}
        
        {/* Extra Participants Placeholder */}
        {remainingVideos.length > (activeVideo ? 3 : 4) && (
            <div className="w-40 md:w-full flex-shrink-0 relative rounded-xl md:rounded-2xl overflow-hidden bg-surface/10 backdrop-blur-md border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 gap-2 hover:bg-surface/20 hover:text-white transition-all group cursor-pointer aspect-video md:aspect-auto md:flex-1" onClick={() => setShowOptionsDrawer(true)}>
              <GroupIcon fontSize="large" className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tracking-wide">+{remainingVideos.length - (activeVideo ? 3 : 4)} More</span>
            </div>
        )}
      </div>

      {/* Captions Overlay */}
      {captionText.text && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl text-white max-w-2xl text-center shadow-2xl pointer-events-none z-50">
              <p className="text-xs text-indigo-400 font-bold mb-1 tracking-wide">{captionText.username}</p>
              <p className="text-xl md:text-2xl font-medium leading-relaxed drop-shadow-md">{captionText.text}</p>
          </div>
      )}

      {/* Floating Reactions Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[60] overflow-hidden">
          <AnimatePresence>
              {floatingReactions.map((reaction) => (
                  <motion.div
                      key={reaction.id}
                      initial={{ opacity: 0, y: 100, x: `${reaction.left}vw`, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 1, 0], y: -500, x: `${reaction.left + (Math.random() * 10 - 5)}vw`, scale: [0.5, 1.5, 1.5, 1] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 3, ease: "easeOut" }}
                      className="absolute bottom-20 flex flex-col items-center"
                  >
                      <span className="text-4xl md:text-6xl drop-shadow-2xl filter">{reaction.emoji}</span>
                      <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full mt-1 backdrop-blur-md">{reaction.username}</span>
                  </motion.div>
              ))}
          </AnimatePresence>
      </div>
    </div>
    
    {/* Right Side Panel (Chat & Participants) */}
    <aside className={`${showChat ? 'absolute inset-2 sm:inset-4 z-[70] flex' : 'hidden lg:flex'} w-auto lg:w-80 h-[calc(100%-1rem)] lg:h-full flex-col rounded-2xl lg:rounded-3xl bg-surface/95 lg:bg-surface/30 backdrop-blur-3xl lg:backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden`}>
      <div className="p-4 lg:p-5 border-b border-white/10 flex justify-between items-center bg-black/40 lg:bg-black/20">
        <h3 className="font-bold text-white text-sm tracking-wide">Meeting Chat</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-indigo-400 font-medium">{totalParticipants} People</span>
          <button className="lg:hidden p-1 rounded-full hover:bg-white/10 text-gray-400" onClick={() => setShowChat(false)}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((m, idx) => {
              const date = new Date(m.timestamp);
              const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
              const isMe = m.sender === username;
              return (
                <div key={idx} className={`flex flex-col gap-1 ${isMe ? 'items-end' : ''}`}>
                  <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">{m.sender}</span>
                    <span className="text-[9px] text-gray-500">{timeString}</span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[85%] ${isMe ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/30 rounded-br-sm' : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-sm'}`}>
                        {m.data}
                  </div>
                </div>
              );
          })}
      </div>
      
      {/* Chat Input */}
      <div className="p-4 bg-black/20 border-t border-white/10">
        <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
          <input 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            onKeyDown={handleChatSubmit}
            className="w-full bg-transparent py-3 pl-4 pr-12 text-sm focus:outline-none placeholder-gray-500 text-white" 
            placeholder="Send a message..." 
            type="text"
          />
          <button onClick={handleChatSubmit} className="absolute right-2 p-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors flex items-center justify-center">
            <SendIcon fontSize="small" />
          </button>
        </div>
      </div>
    </aside>
  </main>
  
  {/* Bottom Control Bar */}
  <footer className="w-full bg-black/40 backdrop-blur-xl px-2 md:px-8 py-2 md:py-4 flex items-center justify-center md:justify-between border-t border-white/10 z-50 flex-shrink-0">
    <div className="hidden md:flex items-center gap-2 min-w-[200px]">
       <span className="text-xs font-medium text-gray-400">Meeting secured</span>
    </div>
    
    <div className="flex items-center gap-2 md:gap-3 justify-center flex-nowrap">
      {/* Mic Control */}
      <button onClick={handleAudio} className={`w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl text-white transition-all active:scale-95 shadow-lg ${!audio ? 'bg-red-500/20 border border-red-500/50 text-red-500 hover:bg-red-500/30' : 'bg-surface/50 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50'}`}>
        {!audio ? <MicOffIcon /> : <MicIcon />}
      </button>
      
      {/* Video Control */}
      <button onClick={handleVideo} className={`w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl text-white transition-all active:scale-95 shadow-lg ${!video ? 'bg-red-500/20 border border-red-500/50 text-red-500 hover:bg-red-500/30' : 'bg-surface/50 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50'}`}>
        {!video ? <VideocamOffIcon /> : <VideocamIcon />}
      </button>

      {/* Screen Share */}
      <button onClick={() => setScreen(!screen)} className={`w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl border transition-all active:scale-95 shadow-lg hidden sm:flex ${screen ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-surface/50 border-white/10 text-gray-300 hover:bg-white/10 hover:border-indigo-500/50 hover:text-white'}`}>
        <ScreenShareIcon />
      </button>

      {/* PiP Mode */}
      <button onClick={handlePiP} className="w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-surface/50 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-indigo-500/50 hover:text-white transition-all active:scale-95 shadow-lg hidden sm:flex">
         <PictureInPictureAltIcon />
      </button>

      {/* Reactions Menu */}
      <div className="relative hidden sm:block">
          <button onClick={() => setShowReactionsMenu(!showReactionsMenu)} className={`w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl border transition-all active:scale-95 shadow-lg ${showReactionsMenu ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-surface/50 border-white/10 text-gray-300 hover:bg-white/10 hover:border-indigo-500/50 hover:text-white'}`}>
              <MoodIcon />
          </button>
          
          <AnimatePresence>
              {showReactionsMenu && (
                  <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl"
                  >
                      {['👍', '❤️', '😂', '🎉', '😮'].map(emoji => (
                          <button key={emoji} onClick={() => handleReaction(emoji)} className="w-10 h-10 text-xl flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors hover:scale-110 active:scale-95">
                              {emoji}
                          </button>
                      ))}
                  </motion.div>
              )}
          </AnimatePresence>
      </div>
      
      {/* Reactions (Raise Hand mapped) */}
      <button onClick={handleRaiseHand} className="w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-surface/50 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-indigo-500/50 hover:text-white transition-all active:scale-95 shadow-lg hidden sm:flex">
        <PanToolIcon />
      </button>
      
      {/* More / Settings */}
      <button onClick={() => setSettingsOpen(true)} className="w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-surface/50 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-indigo-500/50 hover:text-white transition-all active:scale-95 shadow-lg hidden sm:flex">
         <SettingsIcon />
      </button>

      {/* Record */}
      <button onClick={isRecording ? handleStopRecording : handleStartRecording} className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl border transition-all active:scale-95 shadow-lg hidden sm:flex ${isRecording ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' : 'bg-surface/50 border-white/10 text-gray-300 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400'}`}>
         <FiberManualRecordIcon fontSize="small" />
      </button>
      
      {/* Captions */}
      <button onClick={handleToggleCaptions} className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl border transition-all active:scale-95 shadow-lg hidden sm:flex ${showCaptions ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-surface/50 border-white/10 text-gray-300 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400'}`}>
         <ClosedCaptionIcon fontSize="small" />
      </button>

      {/* More Options (Mobile Only) */}
      <button onClick={() => setShowOptionsDrawer(true)} className="w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-surface/50 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-indigo-500/50 hover:text-white transition-all active:scale-95 shadow-lg sm:hidden">
         <MoreVertIcon />
      </button>
      
      {/* Leave Button */}
      <button onClick={handleEndCall} className="h-11 md:h-14 px-5 md:px-8 flex items-center justify-center rounded-xl md:rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-95 gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)] ml-1 md:ml-2 border border-red-500/50">
        <CallEndIcon />

        <span className="hidden sm:inline">Leave</span>
      </button>
    </div>
    
    <div className="hidden md:flex items-center gap-3 min-w-[200px] justify-end">
      <button className="w-10 h-10 rounded-full bg-surface/50 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors" onClick={() => setShowOptionsDrawer(true)}>
        <GroupIcon fontSize="small" />
      </button>
    </div>
  </footer>

  <OptionsDrawer 
      isOpen={showOptionsDrawer} 
      onClose={() => setShowOptionsDrawer(false)} 
      onRaiseHand={handleRaiseHand}
      isHandRaised={!!raisedHands['local']}
      onChat={() => {
          setShowOptionsDrawer(false);
          setShowChat(true);
      }} 
      onScreenShare={() => setScreen(!screen)}
      isScreenSharing={screen}
      onFullScreen={() => {
         if (!document.fullscreenElement) {
             document.documentElement.requestFullscreen().catch((err) => console.log(err));
             setIsFullScreen(true);
         } else {
             if (document.exitFullscreen) document.exitFullscreen();
             setIsFullScreen(false);
         }
      }}
      isFullScreen={isFullScreen}
      onSettings={() => {
          setShowOptionsDrawer(false);
          setSettingsOpen(true);
      }}
      isRecording={isRecording}
      onRecordToggle={() => {
          setShowOptionsDrawer(false);
          if (isRecording) {
              handleStopRecording();
          } else {
              handleStartRecording();
          }
      }}
      isMobile={isMobile}
      onShowToast={handleShowToast}
      waitingList={waitingList}
      isHost={isHost}
      onAdmit={handleAdmitUser}
  />
  
  <Toast 
      open={toastConfig.open} 
      message={toastConfig.message} 
      type={toastConfig.type} 
      onClose={() => setToastConfig({ ...toastConfig, open: false })} 
  />
  <SettingsModal 
      isOpen={settingsOpen} 
      onClose={() => setSettingsOpen(false)} 
      isHost={isHost}
      meetingSettings={meetingSettings}
      onMeetingSettingsChange={handleMeetingSettingsChange}
      onLocalSettingsSave={handleLocalSettingsSave}
  />
</div>
    );
}
