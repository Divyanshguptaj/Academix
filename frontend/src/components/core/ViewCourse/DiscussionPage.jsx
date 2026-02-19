import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../../../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../../../services/apiconnector';
import { discussionEndpoints } from '../../../services/apis';
import DiscussionActivation from './DiscussionActivation';
import DiscussionList from './DiscussionList';
import DiscussionForm from './DiscussionForm';

export default function DiscussionPage() {
    const { courseId } = useParams();
    const { courseEntireData } = useSelector((state) => state.viewCourse);
    const { socket, isConnected, onDiscussionCreated, offDiscussionCreated, onDiscussionEnabled, offDiscussionEnabled } = useSocket();
    
    const [discussionEnabled, setDiscussionEnabled] = useState(false);
    const [discussions, setDiscussions] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if discussion is enabled
        if (courseEntireData) {
            setDiscussionEnabled(courseEntireData.discussionEnabled || false);
        }
    }, [courseEntireData]);

    useEffect(() => {
        // Fetch discussions if enabled
        if (discussionEnabled) {
            fetchDiscussions();
        }
    }, [discussionEnabled, courseId]);

    useEffect(() => {
        // Set up real-time listeners
        if (socket && isConnected) {
            onDiscussionCreated(handleDiscussionCreated);
            onDiscussionEnabled(handleDiscussionEnabled);
        }

        return () => {
            if (socket) {
                offDiscussionCreated(handleDiscussionCreated);
                offDiscussionEnabled(handleDiscussionEnabled);
            }
        };
    }, [socket, isConnected, onDiscussionCreated, offDiscussionCreated, onDiscussionEnabled, offDiscussionEnabled]);

    const fetchDiscussions = async () => {
        setLoading(true);
        try {
            const response = await apiConnector(
                'GET',
                `${discussionEndpoints.GET_DISCUSSIONS}/${courseId}`
            );

            if (response.data.success) {
                setDiscussions(response.data.data.discussions || []);
            } else {
                toast.error(response.data.message || 'Failed to fetch discussions');
            }
        } catch (error) {
            console.error('Error fetching discussions:', error);
            toast.error(error?.response?.data?.message || 'Failed to fetch discussions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDiscussionCreated = (data) => {
        if (data.courseId === courseId) {
            setDiscussions(prev => [data.discussion, ...prev]);
            toast.success('New discussion created!');
        }
    };

    const handleDiscussionEnabled = (data) => {
        if (data.courseId === courseId) {
            setDiscussionEnabled(true);
            toast.success('Discussion forum has been enabled for this course!');
        }
    };

    const handleStatusChange = (enabled) => {
        setDiscussionEnabled(enabled);
    };

    const handleCreateDiscussion = (discussion) => {
        setDiscussions(prev => [discussion, ...prev]);
        setShowCreateForm(false);
        toast.success('Discussion created successfully!');
    };

    const handleDeleteDiscussion = (discussionId) => {
        setDiscussions(prev => prev.filter(discussion => discussion._id !== discussionId));
        toast.success('Discussion deleted successfully!');
    };

    return (
        <div className="space-y-6">
            {/* Discussion Activation Banner */}
            {!discussionEnabled && (
                <DiscussionActivation 
                    courseData={courseEntireData} 
                    onStatusChange={handleStatusChange}
                />
            )}

            {/* Discussion Content */}
            {discussionEnabled ? (
                <div>
                    {/* Create Discussion Button */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Discussion Forum</h2>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {showCreateForm ? 'Cancel' : 'Create New Discussion'}
                        </button>
                    </div>

                    {/* Create Discussion Form */}
                    {showCreateForm && (
                        <div className="mb-6">
                            <DiscussionForm
                                courseId={courseId}
                                onCreateDiscussion={handleCreateDiscussion}
                                onCancel={() => setShowCreateForm(false)}
                            />
                        </div>
                    )}

                    {/* Discussion List */}
                    <DiscussionList
                        discussions={discussions}
                        loading={loading}
                        onDeleteDiscussion={handleDeleteDiscussion}
                    />
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">💬</div>
                    <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                        Discussion Forum Coming Soon
                    </h2>
                    <p className="text-gray-500">
                        The instructor will enable the discussion forum when ready.
                    </p>
                </div>
            )}
        </div>
    );
}