const { get, put } = require('@vercel/blob');

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

async function writeJson(path, data) {
    try {
        await put(path, JSON.stringify(data, null, 2), {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json',
        });
    } catch (error) {
        console.error('[getBoardPost] Failed to write JSON:', path, error.message);
        throw error;
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

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

    const postPath = `board/${id}/post.json`;

    try {
        const post = await readJson(postPath);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        try {
            const currentViews = typeof post.views === 'number'
                ? post.views
                : Number.parseInt(post.views, 10) || 0;
            const updatedPost = {
                ...post,
                views: currentViews + 1,
            };
            await writeJson(postPath, updatedPost);
            post.views = updatedPost.views;
        } catch (viewError) {
            console.error('[getBoardPost] Failed to update view count:', viewError.message);
        }

        const commentsData = await readJson(`board/${id}/comments.json`);
        const comments = commentsData?.comments || [];

        return res.status(200).json({ post, comments });
    } catch (error) {
        console.error('[getBoardPost] Error:', error);
        return res.status(500).json({ error: 'Failed to load board post' });
    }
};

