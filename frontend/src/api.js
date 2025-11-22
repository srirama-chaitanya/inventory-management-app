import axios from 'axios';

// Create a custom Axios instance
const API = axios.create({
    // Look for the LIVE URL first, otherwise use Localhost
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// --- INTERCEPTOR ---
// This automatically adds the token to every request
API.interceptors.request.use((req) => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
        const user = JSON.parse(userProfile);
        if (user.token) {
            req.headers.Authorization = `Bearer ${user.token}`;
        }
    }
    return req;
});

export default API;