const { get, put } = require('@vercel/blob');
const crypto = require('crypto');

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readComments(path) {
    try {
        const blob = await get(path);
        if (!blob?.url) {
            return { comments: [] };
        }
        const response = await fetch(blob.url);
        if (!response.ok) {
            return { comments: [] };
        }
        return await response.json();
    } catch (error) {
        if (error?.code === 'blob_not_found') {
            return { comments: [] };
        }
        console.error('[addBoardComment] Failed to read comments:', error.message);
        return { comments: [] };
    }
}

module.exports = async (req, res) => {
    setCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (error) {
            return res.status(400).json({ error: 'Malformed JSON body' });
        }
    }

    if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        console.error('[addBoardComment] ADMIN_PASSWORD is not configured');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const { password, postId, content, parentId = null } = body;

    if (!password || password !== adminPassword) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!postId) {
        return res.status(400).json({ error: 'postId는 필수입니다.' });
    }

    if (!content || typeof content !== 'string' || content.trim().length < 2) {
        return res.status(400).json({ error: '댓글을 2글자 이상 입력해주세요.' });
    }

    try {
        const commentsPath = `board/${postId}/comments.json`;
        const commentData = await readComments(commentsPath);
        const comments = Array.isArray(commentData.comments) ? commentData.comments : [];

        if (parentId) {
            const parentExists = comments.some((comment) => comment.id === parentId);
            if (!parentExists) {
                return res.status(400).json({ error: '존재하지 않는 부모 댓글입니다.' });
            }
        }

        const newComment = {
            id: crypto.randomUUID(),
            postId,
            parentId,
            content: content.trim(),
            createdAt: new Date().toISOString(),
        };

        comments.push(newComment);

        await put(commentsPath, JSON.stringify({ comments }, null, 2), {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json',
        });

        return res.status(201).json({ success: true, comment: newComment });
    } catch (error) {
        console.error('[addBoardComment] Failed to add comment:', error);
        return res.status(500).json({ error: '댓글 작성에 실패했습니다.' });
    }
};

