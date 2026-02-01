import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import Input from './Input';
import CloseIcon from '@mui/icons-material/Close';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const ReportModal = ({ isOpen, onClose, onSubmit, reportedUsername }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason) return;
        setLoading(true);
        await onSubmit({ reason, description });
        setLoading(false);
        onClose();
        setReason('');
        setDescription('');
    };

    const handleReasonSelect = (r) => {
        setReason(r);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-[#202124] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ReportProblemIcon className="text-red-500" />
                            Report {reportedUsername}
                        </h3>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-gray-400">
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-3">Why are you reporting this user?</label>
                            <div className="grid grid-cols-1 gap-2">
                                {['Harassment', 'Spam', 'Inappropriate Content', 'Other'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleReasonSelect(option.toLowerCase())}
                                        className={`p-3 rounded-lg text-left transition-all border ${reason === option.toLowerCase()
                                                ? 'bg-red-500/20 border-red-500 text-white'
                                                : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 min-h-[100px]"
                                placeholder="Please provide more details..."
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                        <Button variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleSubmit}
                            disabled={!reason || loading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReportModal;
