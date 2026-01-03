import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PanToolIcon from '@mui/icons-material/PanTool';
import ChatIcon from '@mui/icons-material/Chat';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SettingsIcon from '@mui/icons-material/Settings'; // Placeholder for settings
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // Placeholder
import CloseIcon from '@mui/icons-material/Close';

const DrawerItem = ({ icon: Icon, label, onClick, active = false, activeColor = "bg-blue-600" }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all w-full
      ${active ? activeColor : 'bg-white/5 hover:bg-white/10'}`}
    >
        <div className={`p-2 rounded-full ${active ? 'bg-white/20' : 'bg-transparent'}`}>
            <Icon className="text-white" fontSize="medium" />
        </div>
        <span className="text-xs sm:text-sm text-white font-medium text-center">{label}</span>
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
    isFullScreen
}) => {
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
                        className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1E1E1E] rounded-t-2xl sm:rounded-t-3xl overflow-hidden pb-6 safe-area-inset-bottom"
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
                        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
                        </div>

                        <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            {/* Main Actions */}
                            <div className="col-span-2 sm:col-span-4 bg-[#303030] rounded-2xl p-4 flex flex-col items-center justify-center mb-2">
                                <button
                                    onClick={onRaiseHand}
                                    className={`flex items-center gap-3 w-full justify-center py-2 px-4 rounded-full transition-colors ${isHandRaised ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                                >
                                    <PanToolIcon />
                                    <span className="font-semibold">{isHandRaised ? 'Lower Hand' : 'Raise Hand'}</span>
                                </button>
                            </div>

                            <DrawerItem
                                icon={ChatIcon}
                                label="In-call messages"
                                onClick={onChat}
                            />

                            <DrawerItem
                                icon={isScreenSharing ? StopScreenShareIcon : ScreenShareIcon}
                                label={isScreenSharing ? "Stop Sharing" : "Share Screen"}
                                onClick={onScreenShare}
                                active={isScreenSharing}
                            />

                            <DrawerItem
                                icon={isFullScreen ? FullscreenExitIcon : FullscreenIcon}
                                label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                onClick={onFullScreen}
                                active={isFullScreen}
                            />

                            <DrawerItem
                                icon={SettingsIcon}
                                label="Settings"
                                onClick={() => { }}
                            />
                            {/* Add more items to match screenshot if needed */}
                            <DrawerItem
                                icon={ReportProblemIcon}
                                label="Report a problem"
                                onClick={() => { }}
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OptionsDrawer;
