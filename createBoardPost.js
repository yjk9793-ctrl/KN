const { put } = require('@vercel/blob');
const crypto = require('crypto');

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sanitizeFileName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        || `attachment-${Date.now()}`;
}

function normalizeLinks(rawLinks) {
    if (!Array.isArray(rawLinks)) return [];
    return rawLinks
        .map((link) => {
            if (!link) return null;
            if (typeof link === 'string') {
                const url = link.trim();
                if (!url) return null;
                return {
                    label: url,
                    url,
                };
            }
            if (typeof link === 'object' && link.url) {
                const url = String(link.url).trim();
                if (!url) return null;
                const label = link.label ? String(link.label).trim() : url;
                return { label, url };
            }
            return null;
        })
        .filter(Boolean);
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

    const {
        title,
        content,
        summary,
        author,
        links = [],
        images = [],
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
        return res.status(400).json({ error: '제목을 2글자 이상 입력해주세요.' });
    }

    if (!content || typeof content !== 'string' || content.trim().length < 5) {
        return res.status(400).json({ error: '본문을 5글자 이상 입력해주세요.' });
    }

    const normalizedLinks = normalizeLinks(links);
    const cleanAuthor = author && typeof author === 'string' && author.trim().length > 0
        ? author.trim()
        : '관리자';

    if (!Array.isArray(images)) {
        return res.status(400).json({ error: '이미지 형식이 올바르지 않습니다.' });
    }

    const postId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const imageEntries = [];

    try {
        for (const image of images) {
            if (!image || typeof image !== 'object') continue;
            const { name, contentType, data } = image;
            if (!data) continue;
            const buffer = Buffer.from(data, 'base64');
            if (!buffer.length) continue;
            const maxBytes = 6 * 1024 * 1024; // 6MB limit per image
            if (buffer.length > maxBytes) {
                return res.status(413).json({ error: '이미지 크기는 6MB 이하여야 합니다.' });
            }

            const sanitizedName = sanitizeFileName(name || `image-${Date.now()}.png`);
            const imagePath = `board/${postId}/images/${sanitizedName}`;
            const blob = await put(imagePath, buffer, {
                access: 'public',
                addRandomSuffix: false,
                contentType: contentType || 'image/png',
            });

            imageEntries.push({
                name: sanitizedName,
                url: blob.url,
                size: blob.size,
                contentType: blob.contentType,
            });
        }

        const postData = {
            id: postId,
            title: title.trim(),
            summary: summary && typeof summary === 'string' ? summary.trim() : '',
            content: content.trim(),
            author: cleanAuthor,
            views: 0,
            links: normalizedLinks,
            images: imageEntries,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        await put(`board/${postId}/post.json`, JSON.stringify(postData, null, 2), {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json',
        });

        await put(`board/${postId}/comments.json`, JSON.stringify({ comments: [] }, null, 2), {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json',
        });

        return res.status(201).json({ success: true, post: postData });
    } catch (error) {
        console.error('[createBoardPost] Failed to create post:', error);
        return res.status(500).json({ error: '게시글 생성에 실패했습니다.', message: error.message });
    }
};

