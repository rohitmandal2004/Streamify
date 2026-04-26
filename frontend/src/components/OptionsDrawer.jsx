import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PanToolIcon from '@mui/icons-material/PanTool';
import ChatIcon from '@mui/icons-material/Chat';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SettingsIcon from '@mui/icons-material/Settings';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import MoodIcon from '@mui/icons-material/Mood';
import PersonIcon from '@mui/icons-material/Person';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

const DrawerItem = ({ icon: Icon, label, onClick, active = false, activeColor = "bg-blue-600", disabled = false }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all w-full
      ${active ? activeColor : 'bg-white/5 hover:bg-white/10'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
    >
        <div className={`p-2 rounded-full ${active ? 'bg-white/20' : 'bg-transparent'}`}>
            <Icon className="text-white" fontSize="medium" />
        </div>
        <span className="text-[11px] text-white font-medium text-center leading-tight">{label}</span>
    </button>
);

const OptionsDrawer = ({
    isOpen,
    onClose,
    onRaiseHand,
    isHandRaised,
    onChat,
    onScreenShare,
    isScreenSharing,
    onFullScreen,
    isFullScreen,
    onSettings,
    onRecordToggle,
    isRecording,
    isMobile = false,
    onShowToast,
    waitingList = [],
    isHost = false,
    onAdmit,
    // New props for participants and features
    participantNames = {},
    participantsMuted = {},
    totalParticipants = 1,
    onReaction,
    onPiP,
    username = ''
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Drawer Content */}
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-[60] bg-[#111318] rounded-t-2xl overflow-hidden pb-6 safe-area-inset-bottom max-h-[85vh] overflow-y-auto"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset, velocity }) => {
                            if (offset.y > 100 || velocity.y > 500) {
                                onClose();
                            }
                        }}
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-2 sticky top-0 bg-[#111318] z-10" onClick={onClose}>
                            <div className="w-10 h-1 bg-gray-600 rounded-full" />
                        </div>

                        {/* Participants Section */}
                        <div className="px-4 pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                    <PersonIcon style={{ fontSize: 18 }} className="text-indigo-400" />
                                    In this meeting
                                    <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">{totalParticipants}</span>
                                </h3>
                            </div>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {/* Self */}
                                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                            {username ? username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <span className="text-white text-sm font-medium">{username || 'You'}</span>
                                            <span className="text-indigo-400 text-[10px] ml-1.5 font-semibold">(You)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {isHost && (
                                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase">Host</span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Remote Participants */}
                                {Object.entries(participantNames).map(([socketId, name]) => (
                                    <div key={socketId} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/80 to-teal-500/80 flex items-center justify-center text-white font-bold text-xs">
                                                {name ? name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span className="text-white text-sm font-medium">{name || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {participantsMuted[socketId] ? (
                                                <MicOffIcon style={{ fontSize: 14 }} className="text-red-400" />
                                            ) : (
                                                <MicIcon style={{ fontSize: 14 }} className="text-emerald-400" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/5 mx-4" />

                        {/* Quick Reactions */}
                        {onReaction && (
                            <div className="px-4 py-3">
                                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Quick Reactions</h3>
                                <div className="flex items-center gap-2">
                                    {['👍', '❤️', '😂', '🎉', '😮'].map(emoji => (
                                        <button 
                                            key={emoji} 
                                            onClick={() => { onReaction(emoji); onClose(); }} 
                                            className="flex-1 h-11 text-xl flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-white/5 mx-4" />

                        {/* Feature Grid */}
                        <div className="p-4 grid grid-cols-3 gap-2.5">
                            {/* Raise Hand */}
                            <DrawerItem
                                icon={PanToolIcon}
                                label={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                                onClick={onRaiseHand}
                                active={isHandRaised}
                                activeColor="bg-amber-500/20 border border-amber-500/30"
                            />

                            {/* Chat */}
                            <DrawerItem
                                icon={ChatIcon}
                                label="Chat"
                                onClick={isMobile ? () => onShowToast("Chat is coming soon to mobile.", "info") : onChat}
                                disabled={isMobile}
                            />

                            {/* PiP */}
                            {onPiP && (
                                <DrawerItem
                                    icon={PictureInPictureAltIcon}
                                    label="PiP Mode"
                                    onClick={() => { onPiP(); onClose(); }}
                                />
                            )}

                            {/* Screen Share */}
                            <DrawerItem
                                icon={isScreenSharing ? StopScreenShareIcon : ScreenShareIcon}
                                label={isScreenSharing ? "Stop Share" : "Screen Share"}
                                onClick={isMobile ? () => onShowToast("Screen sharing is only available on desktop.", "warning") : onScreenShare}
                                active={isScreenSharing}
                                disabled={isMobile}
                            />

                            {/* Full Screen */}
                            <DrawerItem
                                icon={isFullScreen ? FullscreenExitIcon : FullscreenIcon}
                                label={isFullScreen ? "Exit Full" : "Full Screen"}
                                onClick={onFullScreen}
                                active={isFullScreen}
                            />

                            {/* Settings */}
                            <DrawerItem
                                icon={SettingsIcon}
                                label="Settings"
                                onClick={onSettings || (() => {})}
                            />

                            {/* Record */}
                            <DrawerItem
                                icon={FiberManualRecordIcon}
                                label={isRecording ? "Stop Rec" : "Record"}
                                onClick={isMobile ? () => onShowToast("Recording is only available on desktop.", "warning") : (onRecordToggle || (() => {}))}
                                active={isRecording}
                                activeColor="bg-red-500/20 border border-red-500/30"
                                disabled={isMobile}
                            />

                            {/* Report */}
                            <DrawerItem
                                icon={ReportProblemIcon}
                                label="Report"
                                onClick={() => {}}
                            />
                        </div>

                        {/* Host: Waiting Room Section */}
                        {isHost && waitingList && waitingList.length > 0 && (
                            <div className="px-4 mt-2 border-t border-white/10 pt-4">
                                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                                    Waiting Room
                                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">{waitingList.length}</span>
                                </h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {waitingList.map((user) => (
                                        <div key={user.socketId} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-white text-sm font-medium">{user.username}</span>
                                            </div>
                                            <button
                                                onClick={() => onAdmit(user.socketId)}
                                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Admit
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OptionsDrawer;
