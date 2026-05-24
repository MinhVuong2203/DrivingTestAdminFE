import api from "./api";

export const getPosts = async () => {
    const res = await api.get('/api/Post');
    return res.data
}
