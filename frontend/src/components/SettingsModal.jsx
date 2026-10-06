import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import VideocamIcon from '@mui/icons-material/Videocam';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import Button from './Button';
import { AuthContext } from '../contexts/AuthContext';

const ToggleSwitch = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
        <div>
            <h3 className="text-sm font-medium text-white">{label}</h3>
            {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-gray-600'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const SettingsModal = ({ isOpen, onClose, isHost = false, meetingSettings = {}, onMeetingSettingsChange, onLocalSettingsSave }) => {
    const { userData } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('audio');
    const [devices, setDevices] = useState({
        audioInput: [],
        audioOutput: [],
        videoInput: []
    });
    const [settings, setSettings] = useState({
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
        if (isOpen) {
            getDevices();
        }
    }, [isOpen]);

    const getDevices = async () => {
        try {
            // Request permission to list labels
            await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

            const allDevices = await navigator.mediaDevices.enumerateDevices();
            setDevices({
                audioInput: allDevices.filter(d => d.kind === 'audioinput'),
                audioOutput: allDevices.filter(d => d.kind === 'audiooutput'),
                videoInput: allDevices.filter(d => d.kind === 'videoinput')
            });
        } catch (err) {
            console.error("Error fetching devices:", err);
        }
    };

    const handleSave = () => {
        localStorage.setItem('audioInputId', settings.audioInputId);
        localStorage.setItem('audioOutputId', settings.audioOutputId);
        localStorage.setItem('videoInputId', settings.videoInputId);
        localStorage.setItem('videoQuality', settings.videoQuality);
        localStorage.setItem('noiseSuppression', settings.noiseSuppression);
        localStorage.setItem('mirrorVideo', settings.mirrorVideo);
        localStorage.setItem('lowDataMode', settings.lowDataMode);
        localStorage.setItem('closedCaptionsDefault', settings.closedCaptionsDefault);
        if(onLocalSettingsSave) onLocalSettingsSave(settings);
        onClose();
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-md bg-[#1e1e24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <div>
                            <h2 className="text-xl font-bold text-white">Settings</h2>
                            {userData && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Logged in as <span className="text-indigo-400 font-medium">{userData.email || userData.username || userData.name}</span>
                                </p>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <CloseIcon className="text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-white/10 p-2 bg-white/5 flex sm:block overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('audio')}
                                className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-4 py-3 rounded-xl mb-0 sm:mb-1 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'audio' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-white/5'
                                    }`}
                            >
                                <MicIcon fontSize="small" /> Audio
                            </button>
                            <button
                                onClick={() => setActiveTab('video')}
                                className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-4 py-3 rounded-xl mb-0 sm:mb-1 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'video' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-white/5'
                                    }`}
                            >
                                <VideocamIcon fontSize="small" /> Video
                            </button>
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-4 py-3 rounded-xl mb-0 sm:mb-1 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'general' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-white/5'
                                    }`}
                            >
                                <SettingsIcon fontSize="small" /> General
                            </button>
                            {isHost && (
                                <button
                                    onClick={() => setActiveTab('host')}
                                    className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'host' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    <SecurityIcon fontSize="small" /> Host Controls
                                </button>
                            )}
                        </div>

                        {/* Panel */}
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                            {activeTab === 'audio' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-400 uppercase">Microphone</label>
                                        <select
                                            value={settings.audioInputId}
                                            onChange={(e) => setSettings({ ...settings, audioInputId: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            {devices.audioInput.map(device => (
                                                <option key={device.deviceId} value={device.deviceId}>
                                                    {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-400 uppercase">Speakers</label>
                                        <select
                                            value={settings.audioOutputId}
                                            onChange={(e) => setSettings({ ...settings, audioOutputId: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                            disabled={devices.audioOutput.length === 0} // Browsers sometimes hide output selection
                                        >
                                            {devices.audioOutput.length > 0 ? devices.audioOutput.map(device => (
                                                <option key={device.deviceId} value={device.deviceId}>
                                                    {device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}
                                                </option>
                                            )) : <option value="default">Default Speaker</option>}
                                        </select>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 mt-4">
                                        <ToggleSwitch
                                            label="Noise Suppression"
                                            description="Filter out background noise like typing and fans."
                                            checked={settings.noiseSuppression}
                                            onChange={(val) => setSettings({ ...settings, noiseSuppression: val })}
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'video' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-400 uppercase">Camera</label>
                                        <select
                                            value={settings.videoInputId}
                                            onChange={(e) => setSettings({ ...settings, videoInputId: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            {devices.videoInput.map(device => (
                                                <option key={device.deviceId} value={device.deviceId}>
                                                    {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-400 uppercase">Video Quality</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['360p', '480p', '720p', '1080p'].map((quality) => (
                                                <button
                                                    key={quality}
                                                    onClick={() => setSettings({ ...settings, videoQuality: quality })}
                                                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${settings.videoQuality === quality
                                                        ? 'bg-indigo-500 border-indigo-500 text-white'
                                                        : 'border-white/10 text-gray-400 hover:bg-white/5'
                                                        }`}
                                                >
                                                    {quality}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 mt-4">
                                        <ToggleSwitch
                                            label="Mirror My Video"
                                            description="Flip the video horizontally so it feels like a mirror."
                                            checked={settings.mirrorVideo}
                                            onChange={(val) => setSettings({ ...settings, mirrorVideo: val })}
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <ToggleSwitch
                                        label="Low Data Mode"
                                        description="Reduce video quality to save bandwidth."
                                        checked={settings.lowDataMode}
                                        onChange={(val) => setSettings({ ...settings, lowDataMode: val })}
                                    />
                                    <ToggleSwitch
                                        label="Closed Captions Default"
                                        description="Automatically turn on captions when joining a meeting."
                                        checked={settings.closedCaptionsDefault}
                                        onChange={(val) => setSettings({ ...settings, closedCaptionsDefault: val })}
                                    />
                                </div>
                            )}

                            {activeTab === 'host' && isHost && (
                                <div className="space-y-4">
                                    <ToggleSwitch
                                        label="Lock Meeting"
                                        description="Prevent anyone else from joining, even with the link."
                                        checked={meetingSettings.isLocked}
                                        onChange={(val) => onMeetingSettingsChange('isLocked', val)}
                                    />
                                    <ToggleSwitch
                                        label="Mute All on Entry"
                                        description="Automatically mute new participants when they join."
                                        checked={meetingSettings.muteAllOnEntry}
                                        onChange={(val) => onMeetingSettingsChange('muteAllOnEntry', val)}
                                    />
                                    <ToggleSwitch
                                        label="Enable Waiting Room"
                                        description="Require host approval for new participants."
                                        checked={meetingSettings.waitingRoomEnabled}
                                        onChange={(val) => onMeetingSettingsChange('waitingRoomEnabled', val)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0 flex justify-end">
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                            Save Changes
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default SettingsModal;
