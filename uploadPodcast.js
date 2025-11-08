const { put } = require('@vercel/blob');
const crypto = require('crypto');

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function ensurePassword() {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
        throw new Error('ADMIN_PASSWORD is not configured');
    }
    return password;
}

function sanitizeFileName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        || `episode-${Date.now()}.mp3`;
}

module.exports = async (req, res) => {
    setCorsHeaders(res);

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

    const adminPassword = (() => {
        try {
            return ensurePassword();
        } catch (error) {
            console.error('[uploadPodcast] Config error:', error.message);
            res.status(500).json({ error: 'Server misconfiguration' });
            throw error;
        }
    })();

    const { password, title, description, audioData, fileName, contentType, action } = body;

    if (!password) {
        return res.status(401).json({ error: 'Missing password' });
    }

    if (password !== adminPassword) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (action === 'verify') {
        return res.status(200).json({ success: true });
    }

    if (!title || !description || !audioData || !fileName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const episodeId = crypto.randomUUID();
        const sanitizedName = sanitizeFileName(fileName);
        const extension = sanitizedName.includes('.') ? sanitizedName.split('.').pop() : 'mp3';
        const audioPath = `podcasts/${episodeId}/${sanitizedName}`;

        if (typeof audioData !== 'string') {
            return res.status(400).json({ error: 'Invalid audio payload' });
        }

        const buffer = Buffer.from(audioData, 'base64');
        if (!buffer.length) {
            return res.status(400).json({ error: 'Invalid audio data' });
        }

        const maxBytes = 12 * 1024 * 1024; // 12MB safety limit
        if (buffer.length > maxBytes) {
            return res.status(413).json({ error: 'Audio file is too large' });
        }

        const audioBlob = await put(audioPath, buffer, {
            access: 'public',
            addRandomSuffix: false,
            contentType: contentType || `audio/${extension}`,
        });

        const episodeMeta = {
            id: episodeId,
            title: title.trim(),
            description: description.trim(),
            audioUrl: audioBlob.url,
            audioPath,
            size: audioBlob.size,
            contentType: audioBlob.contentType,
            createdAt: new Date().toISOString(),
        };

        await put(`podcasts/${episodeId}/metadata.json`, JSON.stringify(episodeMeta, null, 2), {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json',
        });

        return res.status(201).json({ success: true, episode: episodeMeta });
    } catch (error) {
        console.error('[uploadPodcast] Upload failed:', error);
        return res.status(500).json({ error: 'Failed to upload podcast', message: error.message });
    }
};

