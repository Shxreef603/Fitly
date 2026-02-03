import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Image as ImageIcon, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../lib/aiApi';
import { cn } from '../lib/utils';

const ChatPanel = ({ isOpen, onClose, userGoals }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hey! 👋 I\'m Fitly AI, your nutrition assistant. Ask me about diet, fitness, or upload a meal photo for analysis!',
            timestamp: new Date().toISOString()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const removeImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleSend = async () => {
        if (!inputMessage.trim() && !selectedImage) return;

        const userMessage = {
            role: 'user',
            content: inputMessage.trim() || '📷 [Image uploaded]',
            image: imagePreview,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setError(null);

        // Build conversation history for context
        const conversationHistory = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        try {
            const response = await sendChatMessage(
                inputMessage.trim(),
                userGoals,
                selectedImage,
                conversationHistory
            );

            const aiMessage = {
                role: 'assistant',
                content: response.message,
                timestamp: response.timestamp
            };

            setMessages(prev => [...prev, aiMessage]);
            removeImage();
        } catch (err) {
            console.error('Chat error:', err);
            setError(err.message || 'Failed to get response. Please try again.');

            const errorMessage = {
                role: 'assistant',
                content: '❌ Sorry, I had trouble processing that. Please try again or rephrase your question.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-0 h-full w-full max-w-md glass border-l border-white/10 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-lime to-neon-cyan flex items-center justify-center">
                                <Sparkles size={20} className="text-black" />
                            </div>
                            <div>
                                <h3 className="font-bold">Fitly AI</h3>
                                <p className="text-xs text-gray-400">Your nutrition assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    'flex',
                                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                <div
                                    className={cn(
                                        'max-w-[80%] rounded-2xl p-3',
                                        msg.role === 'user'
                                            ? 'bg-neon-cyan/20 border border-neon-cyan/30'
                                            : 'bg-white/5 border border-white/10'
                                    )}
                                >
                                    {msg.image && (
                                        <img
                                            src={msg.image}
                                            alt="Uploaded"
                                            className="rounded-xl mb-2 max-w-full"
                                        />
                                    )}
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-2xl p-3 bg-white/5 border border-white/10 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-neon-lime" />
                                    <p className="text-sm text-gray-400">Thinking...</p>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="px-4 pb-2">
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-200">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="px-4 pb-2">
                            <div className="relative inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Selected"
                                    className="h-20 rounded-xl border border-white/20"
                                />
                                <button
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                                    aria-label="Remove image"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-end gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Upload image"
                            >
                                <ImageIcon size={20} className="text-neon-cyan" />
                            </button>

                            <div className="flex-1 bg-white/5 rounded-xl border border-white/10 focus-within:border-neon-lime/50 transition-colors">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading}
                                    placeholder="Ask about nutrition, diet, or upload a meal..."
                                    className="w-full bg-transparent px-4 py-3 text-sm resize-none outline-none placeholder:text-gray-500 disabled:opacity-50"
                                    rows={1}
                                    style={{
                                        maxHeight: '120px',
                                        minHeight: '48px'
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
                                className="p-3 rounded-xl bg-neon-lime text-black hover:bg-neon-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Send message"
                            >
                                {isLoading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ChatPanel;
