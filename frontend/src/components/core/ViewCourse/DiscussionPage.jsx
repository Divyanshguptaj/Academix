import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../../../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../../../services/apiconnector';
import { discussionEndpoints } from '../../../services/apis';
import DiscussionList from './DiscussionList';
import DiscussionForm from './DiscussionForm';

const { GET_DISCUSSIONS } = discussionEndpoints;

export default function DiscussionPage() {
    const { courseId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const { socket, isConnected, joinCourse, leaveCourse, onDiscussionCreated, offDiscussionCreated, onReplyAdded, offReplyAdded } = useSocket();

    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Join socket room for this course
    useEffect(() => {
        if (socket && isConnected && courseId) {
            joinCourse(courseId);
        }
        return () => {
            if (socket && courseId) {
                leaveCourse(courseId);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, isConnected, courseId]);

    // Fetch discussions on load
    useEffect(() => {
        fetchDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    // Real-time socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleDiscussionCreated = (data) => {
            if (data.courseId === courseId) {
                setDiscussions((prev) => [data.discussion, ...prev]);
            }
        };

        const handleReplyAdded = (data) => {
            if (data.courseId === courseId) {
                setDiscussions((prev) =>
                    prev.map((d) =>
                        d._id === data.discussionId
                            ? { ...d, replies: [...d.replies, data.reply] }
                            : d
                    )
                );
            }
        };

        onDiscussionCreated(handleDiscussionCreated);
        onReplyAdded(handleReplyAdded);

        return () => {
            offDiscussionCreated(handleDiscussionCreated);
            offReplyAdded(handleReplyAdded);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, courseId]);

    const fetchDiscussions = async () => {
        setLoading(true);
        try {
            const response = await apiConnector(
                'GET',
                `${GET_DISCUSSIONS}/${courseId}`,
                null,
                { Authorization: `Bearer ${token}` }
            );
            if (response.data.success) {
                setDiscussions(response.data.data.discussions || []);
            } else {
                toast.error(response.data.message || 'Failed to fetch discussions');
            }
        } catch (error) {
            console.error('Error fetching discussions:', error);
            toast.error(error?.response?.data?.message || 'Failed to fetch discussions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDiscussion = (discussion) => {
        // If socket connected, the 'discussion:created' event fires for everyone
        // including the sender — so don't add locally to avoid duplicates.
        // Only add locally as fallback when socket is offline.
        if (!isConnected) {
            setDiscussions((prev) => [discussion, ...prev]);
        }
    };

    const handleDeleteDiscussion = (discussionId) => {
        setDiscussions((prev) => prev.filter((d) => d._id !== discussionId));
    };

    const handleReplyAdded = (discussionId, reply) => {
        setDiscussions((prev) =>
            prev.map((d) =>
                d._id === discussionId
                    ? { ...d, replies: [...d.replies, reply] }
                    : d
            )
        );
    };

    const handleDeleteReply = (discussionId, replyId) => {
        setDiscussions((prev) =>
            prev.map((d) =>
                d._id === discussionId
                    ? { ...d, replies: d.replies.filter((r) => r._id !== replyId) }
                    : d
            )
        );
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <h2 className="text-2xl font-bold text-white">Discussion Forum</h2>

            {/* Post Form — always visible */}
            <DiscussionForm
                courseId={courseId}
                onCreateDiscussion={handleCreateDiscussion}
            />

            {/* Discussion List */}
            <DiscussionList
                discussions={discussions}
                loading={loading}
                courseId={courseId}
                onDeleteDiscussion={handleDeleteDiscussion}
                onReplyAdded={handleReplyAdded}
                onDeleteReply={handleDeleteReply}
            />
        </div>
    );
}
