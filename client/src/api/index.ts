import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((req) => {
    if (localStorage.getItem('profile')) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile') || '{}').token}`;
    }
    return req;
});

export const signIn = (formData: any) => API.post('/auth/login', formData);
export const signUp = (formData: any) => API.post('/auth/register', formData);
export const fetchCourses = () => API.get('/courses');
export const fetchCourse = (id: string) => API.get(`/courses/${id}`);
export const createCourse = (newCourse: any) => API.post('/courses', newCourse);
export const createLesson = (newLesson: any) => API.post('/lessons', newLesson);
export const fetchLessons = (courseId: string) => API.get(`/lessons/${courseId}`);

export default API;
