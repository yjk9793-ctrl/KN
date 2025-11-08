const { list } = require('@vercel/blob');

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

    try {
        const result = await list({
            prefix: 'board/',
            limit: 200,
        });

        const posts = await Promise.all(
            result.blobs
                .filter((blob) => blob.pathname.endsWith('/post.json'))
                .map(async (blob) => {
                    try {
                        const response = await fetch(blob.url);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch ${blob.pathname}`);
                        }
                        const data = await response.json();
                        return data;
                    } catch (error) {
                        console.error('[listBoardPosts] Failed to parse post:', blob.pathname, error.message);
                        return null;
                    }
                })
        );

        const augmentedPosts = posts
            .filter(Boolean)
            .map((post) => {
                const createdAtDate = new Date(post.createdAt);
                const isNew = Date.now() - createdAtDate.getTime() <= 72 * 60 * 60 * 1000; // 72 hours
                const views = typeof post.views === 'number'
                    ? post.views
                    : Number.parseInt(post.views, 10) || 0;

                return {
                    id: post.id,
                    title: post.title,
                    author: post.author || '관리자',
                    summary: post.summary || '',
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    views,
                    isNew,
                    attachments: {
                        images: Array.isArray(post.images) ? post.images.length : 0,
                        links: Array.isArray(post.links) ? post.links.length : 0,
                    },
                };
            })
            .sort((a, b) => {
                if (a.isNew !== b.isNew) {
                    return a.isNew ? -1 : 1;
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

        const total = augmentedPosts.length;
        const numberedPosts = augmentedPosts.map((post, index) => ({
            ...post,
            number: total - index,
        }));

        return res.status(200).json({ posts: numberedPosts });
    } catch (error) {
        console.error('[listBoardPosts] Error:', error);
        return res.status(500).json({ error: 'Failed to list board posts' });
    }
};

