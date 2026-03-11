import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../../../services/apiconnector';
import { discussionEndpoints } from '../../../services/apis';
import { getUserImage } from '../../../utils/imageUtils';

const { CREATE_DISCUSSION } = discussionEndpoints;

export default function DiscussionForm({ courseId, onCreateDiscussion }) {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const textareaRef = useRef(null);

    const handleSubmit = async () => {
        if (!text.trim() || submitting) return;

        setSubmitting(true);
        try {
            const response = await apiConnector(
                'POST',
                `${CREATE_DISCUSSION}/${courseId}`,
                {
                    title: text.trim().slice(0, 100),
                    content: text.trim(),
                },
                { Authorization: `Bearer ${token}` }
            );
            if (response.data.success) {
                onCreateDiscussion(response.data.data.discussion);
                setText('');
                textareaRef.current?.focus();
            } else {
                toast.error(response.data.message || 'Failed to post');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to post');
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e) => {
        // Enter submits, Shift+Enter adds a new line
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex gap-3 items-start bg-richblack-800 border border-richblack-600 rounded-lg p-3">
            <img
                src={getUserImage(user)}
                alt="You"
                className="w-8 h-8 rounded-full flex-shrink-0 object-cover mt-1"
            />
            <div className="flex-1 flex gap-2 items-end">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question or start a discussion… (Enter to post)"
                    rows={1}
                    className="flex-1 bg-richblack-700 border border-richblack-500 rounded-lg px-3 py-2 text-sm text-white placeholder-richblack-400 focus:outline-none focus:border-yellow-400 resize-none min-h-[40px] max-h-32 overflow-y-auto"
                    style={{ lineHeight: '1.5' }}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                    }}
                />
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !text.trim()}
                    className="px-4 py-2 bg-yellow-400 text-richblack-900 font-semibold rounded-lg text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                    {submitting ? '...' : 'Post'}
                </button>
            </div>
        </div>
    );
}
