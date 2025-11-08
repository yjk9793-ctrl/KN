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
        const metadataBlobs = await list({
            prefix: 'podcasts/',
            limit: 100,
        });

        const metadataEntries = metadataBlobs.blobs.filter((blob) =>
            blob.pathname.endsWith('/metadata.json')
        );

        const episodes = await Promise.all(
            metadataEntries.map(async (blob) => {
                try {
                    const response = await fetch(blob.url);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch metadata for ${blob.pathname}`);
                    }
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('[listPodcasts] Metadata fetch failed:', error.message);
                    return null;
                }
            })
        );

        const filteredEpisodes = episodes
            .filter(Boolean)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return res.status(200).json({ episodes: filteredEpisodes });
    } catch (error) {
        console.error('[listPodcasts] Failed to list episodes:', error);
        return res.status(500).json({ error: 'Failed to load podcast episodes' });
    }
};

