const { get } = require('@vercel/blob');

async function readJson(path) {
    try {
        const blob = await get(path);
        if (!blob || !blob.url) {
            return null;
        }
        const response = await fetch(blob.url);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        if (error?.code === 'blob_not_found') {
            return null;
        }
        console.error('[getBoardPost] Failed to read JSON:', path, error.message);
        return null;
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query || {};

    if (!id) {
        return res.status(400).json({ error: 'Missing post id' });
    }

    try {
        const post = await readJson(`board/${id}/post.json`);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const commentsData = await readJson(`board/${id}/comments.json`);
        const comments = commentsData?.comments || [];

        return res.status(200).json({ post, comments });
    } catch (error) {
        console.error('[getBoardPost] Error:', error);
        return res.status(500).json({ error: 'Failed to load board post' });
    }
};

