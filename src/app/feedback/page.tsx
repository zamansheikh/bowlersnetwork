'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Send, CheckCircle, MessageSquare, History, ChevronDown } from 'lucide-react';

interface FeedbackType {
    feedback_type_id: number;
    name: string;
}

interface FeedbackItem {
    feedback_id: number;
    posted_by: {
        user_id: number;
        username: string;
        name: string;
        first_name: string;
        last_name: string;
        email: string;
        profile_picture_url: string;
    };
    feedback_type: string;
    title: string;
    details: string;
    dealt_with: boolean;
    posted_at: string;
}

interface UserFeedback {
    [key: string]: FeedbackItem[];
}

export default function FeedbackPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

    // Submit feedback state
    const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        details: '',
        feedback_type_id: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Feedback history state
    const [userFeedback, setUserFeedback] = useState<UserFeedback>({});
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Fetch feedback types on component mount
    useEffect(() => {
        const fetchFeedbackTypes = async () => {
            try {
                const response = await api.get('/api/feedback-types');
                const data = await response.data;
                setFeedbackTypes(data.feedback_types || []);

                // Set default feedback type
                if (data.feedback_types && data.feedback_types.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        feedback_type_id: data.feedback_types[0].feedback_type_id
                    }));
                }
            } catch (error) {
                console.error('Error fetching feedback types:', error);
            }
        };

        fetchFeedbackTypes();
    }, []);

    // Fetch user feedback history when history tab is active
    useEffect(() => {
        if (activeTab === 'history') {
            fetchUserFeedback();
        }
    }, [activeTab]);

    const fetchUserFeedback = async () => {
        try {
            setIsLoadingHistory(true);
            const response = await api.get('/api/feedbacks');
            setUserFeedback(response.data || {});
        } catch (error) {
            console.error('Error fetching user feedback:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTypeSelect = (feedbackType: FeedbackType) => {
        setFormData(prev => ({
            ...prev,
            feedback_type_id: feedbackType.feedback_type_id
        }));
        setDropdownOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.details.trim() || !formData.feedback_type_id) {
            alert('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post('/api/feedbacks', {
                feedback_type_id: formData.feedback_type_id,
                title: formData.title,
                details: formData.details
            });

            if (response.status === 200 || response.status === 201) {
                setIsSubmitted(true);
                setFormData({
                    title: '',
                    details: '',
                    feedback_type_id: feedbackTypes.length > 0 ? feedbackTypes[0].feedback_type_id : 0
                });

                // Reset success message after 5 seconds
                setTimeout(() => {
                    setIsSubmitted(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedFeedbackType = feedbackTypes.find(type => type.feedback_type_id === formData.feedback_type_id);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback Center</h1>
                    <p className="text-gray-600">
                        Share your thoughts and track your feedback history
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            <button
                                onClick={() => setActiveTab('submit')}
                                className={`w-1/2 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'submit'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Submit Feedback
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`w-1/2 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'history'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <History className="w-4 h-4" />
                                    All Feedbacks
                                </div>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'submit' ? (
                    /* Submit Feedback Tab */
                    <div>
                        {/* Success Message */}
                        {isSubmitted && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="text-green-800">
                                    Thank you for your feedback! We appreciate your contribution to improving our platform.
                                </p>
                            </div>
                        )}

                        {/* Submit Form */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Feedback Type Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Feedback Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white flex justify-between items-center"
                                        >
                                            <span className={selectedFeedbackType ? 'text-gray-900' : 'text-gray-500'}>
                                                {selectedFeedbackType ? selectedFeedbackType.name : 'Select feedback type'}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {dropdownOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                                                {feedbackTypes.map((type) => (
                                                    <button
                                                        key={type.feedback_type_id}
                                                        type="button"
                                                        onClick={() => handleTypeSelect(type)}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                                    >
                                                        {type.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="Brief description of your feedback"
                                    />
                                </div>

                                {/* Details */}
                                <div>
                                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                                        Details <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="details"
                                        name="details"
                                        value={formData.details}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                                        placeholder="Please provide detailed information about your feedback."
                                    />
                                </div>

                                {/* User Info Display */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Submitted by</h3>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <div>Name: {user?.name || 'Not provided'}</div>
                                        <div>Email: {user?.email || 'Not provided'}</div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Submit Feedback
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Tips Section */}
                        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">
                                💡 Tips for Better Feedback
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Be specific and detailed in your descriptions</li>
                                <li>• For bugs: include steps to reproduce the issue</li>
                                <li>• For suggestions: explain the benefit and use case</li>
                                <li>• Check if your issue hasn&apos;t been reported before</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    /* Feedback History Tab */
                    <div>
                        {isLoadingHistory ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading your feedback history...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.keys(userFeedback).length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h3>
                                        <p className="text-gray-500">You haven&apos;t submitted any feedback yet. Switch to the Submit tab to share your thoughts!</p>
                                    </div>
                                ) : (
                                    Object.entries(userFeedback).map(([feedbackType, feedbacks]) => (
                                        <div key={feedbackType} className="bg-white rounded-lg shadow-sm">
                                            <div className="p-4 border-b border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                    {feedbackType}
                                                    <span className="text-sm font-normal text-gray-500">
                                                        ({feedbacks.length})
                                                    </span>
                                                </h3>
                                            </div>
                                            <div className="divide-y divide-gray-200">
                                                {feedbacks.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        No {feedbackType.toLowerCase()} submitted yet.
                                                    </div>
                                                ) : (
                                                    feedbacks.map((feedback) => (
                                                        <div key={feedback.feedback_id} className="p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="text-md font-medium text-gray-900">
                                                                    {feedback.title}
                                                                </h4>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-2 py-1 text-xs rounded-full ${feedback.dealt_with
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                        }`}>
                                                                        {feedback.dealt_with ? 'Resolved' : 'Pending'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-600 text-sm mb-2">{feedback.details}</p>
                                                            <p className="text-xs text-gray-500">
                                                                Submitted on {feedback.posted_at} by {feedback.posted_by.name || feedback.posted_by.username}
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
