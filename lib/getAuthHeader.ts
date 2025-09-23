export function getAuthHeader() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
}

export function getUserId() {
    return typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
}

export function clearAuthData() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt');
        localStorage.removeItem('userId');
    }
}

export function isLoggedIn() {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('jwt');
    const userId = localStorage.getItem('userId');
    return !!token && !!userId;
}