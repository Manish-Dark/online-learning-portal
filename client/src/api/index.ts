import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API = axios.create({ baseURL: API_BASE_URL });
export const BASE_URL = API_BASE_URL.replace(/\/api$/, '');

API.interceptors.request.use((req) => {
    if (localStorage.getItem('profile')) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile') || '{}').token}`;
    }
    return req;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            localStorage.clear();
            window.location.href = '/login?expired=true';
        }
        return Promise.reject(error);
    }
);

export const signIn = (formData: any) => API.post('/auth/login', formData);
export const signUp = (formData: any) => API.post('/auth/register', formData);
export const fetchCourses = () => API.get('/courses');
export const fetchCourse = (id: string) => API.get(`/courses/${id}`);
export const createCourse = (newCourse: any) => API.post('/courses', newCourse);
export const createLesson = (newLesson: any) => API.post('/lessons', newLesson);
export const fetchLessons = (courseId: string) => API.get(`/lessons/${courseId}`);

// Live Streams
export const fetchActiveStreams = () => API.get('/streams');
export const fetchStreamHistory = () => API.get('/streams/history');
export const startLiveStream = (data: any) => API.post('/streams/start', data);
export const stopLiveStream = (id: string) => API.put(`/streams/${id}/stop`);

export default API;
