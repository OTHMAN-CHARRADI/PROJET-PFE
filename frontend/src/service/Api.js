import axios from 'axios';


const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 120000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('infobot_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('infobot_token');
            localStorage.removeItem('infobot_user');
            if (!['/login', '/register', '/'].includes(window.location.pathname)) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);



export const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
};

export const register = async (username, email, password, role = 'USER', adminCode = undefined) => {
    const response = await api.post('/api/auth/register', { username, email, password, role, adminCode });
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
};

export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteAvatar = async () => {
    const response = await api.delete('/api/auth/avatar');
    return response.data;
};

export const deleteAccount = async (password) => {
    const response = await api.delete('/api/auth/account', { data: { password } });
    return response.data;
};



export const sendMessage = async (message, conversation_id = null, attachments = null) => {
    const payload = { message, conversation_id };
    if (attachments?.length > 0) payload.attachments = attachments;
    const response = await api.post('/api/chat/message', payload);
    return response.data;
};

export const saveStreamedMessage = async (userMessage, assistantMessage, conversation_id = null, attachments = null) => {
    const response = await api.post('/api/chat/save', { userMessage, assistantMessage, conversationId: conversation_id, attachments });
    return response.data;
};

export const uploadChatFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getChatHistory = async () => {
    const response = await api.get('/api/chat/history');
    return response.data;
};

export const deleteChatHistory = async () => {
    const response = await api.delete('/api/chat/history');
    return response.data;
};

export const generateExercise = async (topic, level) => {
    const response = await api.post('/api/chat/exercise', { topic, level });
    return response.data;
};



export const listConversations = async () => {
    const response = await api.get('/api/chat/conversations');
    return response.data;
};

export const createConversation = async (title = 'Nouvelle conversation') => {
    const response = await api.post('/api/chat/conversations', { title });
    return response.data;
};

export const renameConversation = async (convId, title) => {
    const response = await api.put(`/api/chat/conversations/${convId}`, { title });
    return response.data;
};

export const deleteConversation = async (convId) => {
    const response = await api.delete(`/api/chat/conversations/${convId}`);
    return response.data;
};

export const getConversationMessages = async (convId) => {
    const response = await api.get(`/api/chat/conversations/${convId}/messages`);
    return response.data;
};



export const generateQuiz = async (topic, level, num_questions = 10) => {
    const response = await api.post('/api/quiz/generate', { topic, level, num_questions });
    return response.data;
};

export const submitQuiz = async (topic, level, answers) => {
    const response = await api.post('/api/quiz/submit', { topic, level, answers });
    return response.data;
};

export const getQuizHistory = async () => {
    const response = await api.get('/api/quiz/history');
    return response.data;
};

export const deleteQuizHistory = async () => {
    const response = await api.delete('/api/quiz/history');
    return response.data;
};



export const getProgress = async () => {
    const response = await api.get('/api/progress');
    return response.data;
};

export const getStats = async () => {
    const response = await api.get('/api/progress/stats');
    return response.data;
};

export const resetLevel = async () => {
    const response = await api.post('/api/progress/reset-level');
    return response.data;
};

export const markSectionCompleted = async (sectionId) => {
    const response = await api.post(`/api/progress/sections/${sectionId}/complete`);
    return response.data;
};

export const deleteExerciseHistory = async () => {
    const response = await api.delete('/api/chat/exercise/history');
    return response.data;
};

export const getExerciseHistory = async () => {
    const response = await api.get('/api/chat/exercise/history');
    return response.data;
};

export const getExerciseDetail = async (id) => {
    const response = await api.get(`/api/chat/exercise/history/${id}`);
    return response.data;
};



export const getAllCourses = async () => {
    const response = await api.get('/api/courses');
    return response.data;
};

export const getCourseById = async (id) => {
    const response = await api.get(`/api/courses/${id}`);
    return response.data;
};

export const createCourse = async (data) => {
    const response = await api.post('/api/courses', data);
    return response.data;
};

export const updateCourse = async (id, data) => {
    const response = await api.put(`/api/courses/${id}`, data);
    return response.data;
};

export const deleteCourse = async (id) => {
    const response = await api.delete(`/api/courses/${id}`);
    return response.data;
};



export const getAllSections = async () => {
    const response = await api.get('/api/sections');
    return response.data;
};

export const getSectionsByCourse = async (courseId) => {
    const response = await api.get(`/api/sections/course/${courseId}`);
    return response.data;
};

export const getSectionById = async (id) => {
    const response = await api.get(`/api/sections/${id}`);
    return response.data;
};

export const createSection = async (data) => {
    const response = await api.post('/api/sections', data);
    return response.data;
};

export const updateSection = async (id, data) => {
    const response = await api.put(`/api/sections/${id}`, data);
    return response.data;
};

export const deleteSection = async (id) => {
    const response = await api.delete(`/api/sections/${id}`);
    return response.data;
};



export const getAllVideos = async () => {
    const response = await api.get('/api/videos');
    return response.data;
};

export const getVideosByCourse = async (courseId) => {
    const response = await api.get(`/api/videos/course/${courseId}`);
    return response.data;
};

export const getVideosBySection = async (sectionId) => {
    const response = await api.get(`/api/videos/section/${sectionId}`);
    return response.data;
};

export const getVideoById = async (id) => {
    const response = await api.get(`/api/videos/${id}`);
    return response.data;
};

export const createVideo = async (data) => {
    const response = await api.post('/api/videos', data);
    return response.data;
};

export const uploadVideoFile = async (file, { title, description, courseId, sectionId } = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    if (courseId) formData.append('courseId', courseId);
    if (sectionId) formData.append('sectionId', sectionId);
    const response = await api.post('/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteVideo = async (id) => {
    const response = await api.delete(`/api/videos/${id}`);
    return response.data;
};

export const uploadThumbnail = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/videos/upload-thumbnail', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};



export const getAdminStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

export const getAdminUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const updateUserRole = async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
};

export const getAdminUserDetail = async (userId) => {
    const response = await api.get(`/admin/users/${userId}/detail`);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
};

export default api;


export const getTestimonials = async () => {

    const axios = (await import('axios')).default;
    const response = await axios.get('http://localhost:8080/api/testimonials');
    return response.data;
};

export const submitTestimonial = async (data) => {
    const response = await api.post('/api/testimonials', data);
    return response.data;
};


export const getAllTestimonialsAdmin = async () => {
    const response = await api.get('/admin/testimonials');
    return response.data;
};

export const getPendingTestimonials = async () => {
    const response = await api.get('/admin/testimonials/pending');
    return response.data;
};

export const approveTestimonial = async (id) => {
    const response = await api.put(`/admin/testimonials/${id}/approve`);
    return response.data;
};

export const rejectTestimonial = async (id) => {
    const response = await api.put(`/admin/testimonials/${id}/reject`);
    return response.data;
};

export const deleteTestimonial = async (id) => {
    const response = await api.delete(`/admin/testimonials/${id}`);
    return response.data;
};



export const getCourseComments = async (courseId) => {
    const response = await api.get(`/api/comments/course/${courseId}`);
    return response.data;
};

export const getSectionComments = async (sectionId) => {
    const response = await api.get(`/api/comments/section/${sectionId}`);
    return response.data;
};

export const addComment = async (data) => {
    const response = await api.post('/api/comments', data);
    return response.data;
};

export const updateComment = async (id, content) => {
    const response = await api.put(`/api/comments/${id}`, { content });
    return response.data;
};

export const deleteComment = async (id) => {
    const response = await api.delete(`/api/comments/${id}`);
    return response.data;
};

export const toggleCommentLike = async (id) => {
    const response = await api.post(`/api/comments/${id}/like`);
    return response.data;
};

export const toggleCommentPin = async (id) => {
    const response = await api.post(`/api/comments/${id}/pin`);
    return response.data;
};


export const getAllCommentsAdmin = async () => {
    const response = await api.get('/api/comments/admin/all');
    return response.data;
};



export const importYoutubePlaylist = async ({ playlistUrl, apiKey }) => {
    const response = await api.post('/api/youtube/import-playlist', { playlistUrl, apiKey });
    return response.data;
};


export const sendContactMessage = async (data) => {

    const axios = (await import('axios')).default;
    const response = await axios.post('http://localhost:8080/api/contact', data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};





export const getAllMessages = async (gmailMax = 50) => {
    const response = await api.get(`/admin/messages?gmailMax=${gmailMax}`, { timeout: 8000 });
    return response.data;
};


export const refreshMessages = async (gmailMax = 50) => {
    const response = await api.post(`/admin/messages/refresh?gmailMax=${gmailMax}`);
    return response.data;
};


export const replyToMessage = async (payload) => {
    const response = await api.post('/admin/messages/reply', payload);
    return response.data;
};


export const markContactMessageRead = async (id) => {
    const response = await api.put(`/admin/messages/${id}/read`);
    return response.data;
};


export const deleteContactMessage = async (id) => {
    const response = await api.delete(`/admin/messages/${id}?source=CONTACT_FORM`);
    return response.data;
};


export const deleteGmailMessage = async (messageNumber) => {
    const response = await api.delete(`/admin/messages/${messageNumber}?source=GMAIL_INBOX`);
    return response.data;
};


export const getContactMessages = () => getAllMessages(0);
export const getInboxEmails = (max) => getAllMessages(max);
export const replyContactMessage = (id, replyText) =>
    replyToMessage({ id: String(id), source: 'CONTACT_FORM', replyText });
export const replyToInboxEmail = (data) =>
    replyToMessage({ ...data, id: String(data.messageNumber ?? ''), source: 'GMAIL_INBOX' });

export const getQuizDetail = async (id) => {
    const response = await api.get(`/api/quiz/history/${id}`);
    return response.data;
};


export const getNotifications = async () => {
    const response = await api.get('/api/notifications');
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await api.get('/api/notifications/unread-count');
    return response.data;
};

export const markAllNotificationsRead = async () => {
    await api.put('/api/notifications/read-all');
};

export const markNotificationRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`);
};

export const deleteNotification = async (id) => {
    await api.delete(`/api/notifications/${id}`);
};

export const deleteAllNotifications = async () => {
    await api.delete('/api/notifications');
};