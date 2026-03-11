import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../../../services/apiconnector';
import { discussionEndpoints } from '../../../services/apis';
import { ACCOUNT_TYPE } from '../../../utils/constants';
import { decodeImageUrl } from '../../../utils/imageUtils';

const { DELETE_DISCUSSION, ADD_REPLY, DELETE_REPLY } = discussionEndpoints;

function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Generates a stable color from a string (for initials avatar background)
function colorFromName(name = '') {
    const colors = [
        'bg-blue-600', 'bg-purple-600', 'bg-green-600',
        'bg-orange-500', 'bg-pink-600', 'bg-teal-600',
        'bg-indigo-600', 'bg-red-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function Avatar({ src, name, size = 'md' }) {
    const [imgFailed, setImgFailed] = useState(false);
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
    const decodedSrc = decodeImageUrl(src);

    if (decodedSrc && !imgFailed) {
        return (
            <img
                src={decodedSrc}
                alt={name}
                className={`${sizeClass} rounded-full flex-shrink-0 object-cover`}
                onError={() => setImgFailed(true)}
            />
        );
    }
    return (
        <div className={`${sizeClass} ${colorFromName(name)} rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white`}>
            {initials}
        </div>
    );
}

function RoleBadge({ role }) {
    if (!role || role === 'Student') return null;
    const styles = {
        Instructor: 'bg-yellow-400 text-richblack-900',
        Admin: 'bg-pink-500 text-white',
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[role]}`}>
            {role}
        </span>
    );
}

function ReplyItem({ reply, discussionId, onDeleteReply, currentUserId }) {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const [deleting, setDeleting] = useState(false);

    const isOwn = currentUserId && reply.author?.toString() === currentUserId.toString();
    const canDelete = isOwn || user?.accountType !== ACCOUNT_TYPE.STUDENT;

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const response = await apiConnector(
                'DELETE',
                `${DELETE_REPLY}/${discussionId}/replies/${reply._id}`,
                null,
                { Authorization: `Bearer ${token}` }
            );
            if (response.data.success) {
                onDeleteReply(discussionId, reply._id);
            } else {
                toast.error(response.data.message || 'Failed to delete reply');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete reply');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={`flex gap-3 pl-4 border-l-2 ${isOwn ? 'border-yellow-400' : 'border-richblack-600'}`}>
            <Avatar src={reply.authorImage} name={reply.authorName} size="sm" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-sm font-medium ${isOwn ? 'text-yellow-300' : 'text-white'}`}>
                        {isOwn ? 'You' : reply.authorName}
                    </span>
                    <RoleBadge role={reply.authorRole} />
                    <span className="text-xs text-richblack-400">{formatTime(reply.createdAt)}</span>
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="ml-auto text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                            {deleting ? '...' : 'Delete'}
                        </button>
                    )}
                </div>
                <p className="text-sm text-richblack-200 whitespace-pre-wrap break-words">{reply.content}</p>
            </div>
        </div>
    );
}

function DiscussionCard({ discussion, onDeleteDiscussion, onReplyAdded, onDeleteReply, currentUserId }) {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);

    const [showReplies, setShowReplies] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [deletingPost, setDeletingPost] = useState(false);

    const isOwn = currentUserId && discussion.author?.toString() === currentUserId.toString();
    const canDelete = isOwn || user?.accountType !== ACCOUNT_TYPE.STUDENT;
    const replyCount = discussion.replies?.length || 0;

    const handleDeletePost = async () => {
        setDeletingPost(true);
        try {
            const response = await apiConnector(
                'DELETE',
                `${DELETE_DISCUSSION}/${discussion._id}`,
                null,
                { Authorization: `Bearer ${token}` }
            );
            if (response.data.success) {
                onDeleteDiscussion(discussion._id);
                toast.success('Discussion deleted');
            } else {
                toast.error(response.data.message || 'Failed to delete discussion');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete discussion');
        } finally {
            setDeletingPost(false);
        }
    };

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setSubmittingReply(true);
        try {
            const response = await apiConnector(
                'POST',
                `${ADD_REPLY}/${discussion._id}/replies`,
                { content: replyContent },
                { Authorization: `Bearer ${token}` }
            );
            if (response.data.success) {
                onReplyAdded(discussion._id, response.data.data.reply);
                setReplyContent('');
                setShowReplyForm(false);
                setShowReplies(true);
            } else {
                toast.error(response.data.message || 'Failed to add reply');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to add reply');
        } finally {
            setSubmittingReply(false);
        }
    };

    return (
        <div className={`border rounded-lg p-4 space-y-3 ${
            isOwn
                ? 'bg-richblack-700 border-yellow-400/30'
                : 'bg-richblack-800 border-richblack-600'
        }`}>
            {/* Header row */}
            <div className="flex gap-3">
                <Avatar src={discussion.authorImage} name={discussion.authorName} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-sm font-semibold ${isOwn ? 'text-yellow-300' : 'text-white'}`}>
                            {isOwn ? 'You' : discussion.authorName}
                        </span>
                        <RoleBadge role={discussion.authorRole} />
                        {isOwn && (
                            <span className="text-[10px] text-yellow-400/70 font-medium">· your post</span>
                        )}
                        <span className="text-xs text-richblack-400">{formatTime(discussion.createdAt)}</span>
                        {canDelete && (
                            <button
                                onClick={handleDeletePost}
                                disabled={deletingPost}
                                className="ml-auto text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                                {deletingPost ? 'Deleting...' : 'Delete'}
                            </button>
                        )}
                    </div>
                    {/* Content only (no duplicate title) */}
                    <p className="text-sm text-richblack-100 whitespace-pre-wrap break-words">{discussion.content}</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-4 text-sm border-t border-richblack-600 pt-3">
                {replyCount > 0 && (
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="text-richblack-300 hover:text-white transition-colors"
                    >
                        {showReplies ? 'Hide' : 'Show'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </button>
                )}
                <button
                    onClick={() => {
                        setShowReplyForm(!showReplyForm);
                        if (replyCount > 0) setShowReplies(true);
                    }}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                >
                    Reply
                </button>
                {replyCount === 0 && (
                    <span className="text-richblack-500 text-xs">No replies yet</span>
                )}
            </div>

            {/* Replies */}
            {showReplies && replyCount > 0 && (
                <div className="space-y-3">
                    {discussion.replies.map((reply) => (
                        <ReplyItem
                            key={reply._id}
                            reply={reply}
                            discussionId={discussion._id}
                            onDeleteReply={onDeleteReply}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}

            {/* Reply Form */}
            {showReplyForm && (
                <form onSubmit={handleSubmitReply} className="flex gap-2 items-start pt-1">
                    <Avatar src={user?.image} name={`${user?.firstName} ${user?.lastName}`} size="sm" />
                    <div className="flex-1 flex gap-2">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmitReply(e);
                                }
                            }}
                            placeholder="Write a reply… (Enter to post)"
                            rows={2}
                            autoFocus
                            className="flex-1 bg-richblack-700 border border-richblack-500 rounded-lg px-3 py-2 text-sm text-white placeholder-richblack-400 focus:outline-none focus:border-yellow-400 resize-none"
                        />
                        <div className="flex flex-col gap-1">
                            <button
                                type="submit"
                                disabled={submittingReply || !replyContent.trim()}
                                className="px-3 py-1.5 bg-yellow-400 text-richblack-900 font-semibold rounded-lg text-xs hover:bg-yellow-300 disabled:opacity-60"
                            >
                                {submittingReply ? '...' : 'Post'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowReplyForm(false)}
                                className="px-3 py-1.5 text-richblack-400 hover:text-white text-xs"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function DiscussionList({ discussions, loading, courseId, onDeleteDiscussion, onReplyAdded, onDeleteReply }) {
    const { user } = useSelector((state) => state.profile);
    const currentUserId = user?._id;

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (discussions.length === 0) {
        return (
            <div className="text-center py-16 bg-richblack-800 rounded-lg border border-richblack-600">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-richblack-200 mb-2">No discussions yet</h3>
                <p className="text-richblack-400 text-sm">Be the first to start a discussion!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {discussions.map((discussion) => (
                <DiscussionCard
                    key={discussion._id}
                    discussion={discussion}
                    onDeleteDiscussion={onDeleteDiscussion}
                    onReplyAdded={onReplyAdded}
                    onDeleteReply={onDeleteReply}
                    currentUserId={currentUserId}
                />
            ))}
        </div>
    );
}
