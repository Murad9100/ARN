const express = require('express');
const router = express.Router();
const { getNewsCache, refreshNews, getLastFetched } = require('../services/newsService');

// GET /api/news?cat=crypto&limit=30
router.get('/', async (req, res) => {
  try {
    let news = getNewsCache();

    // If cache is empty, fetch fresh
    if (news.length === 0) {
      news = await refreshNews();
    }

    const { cat, limit = 40, q } = req.query;

    // Filter by category
    if (cat && cat !== 'all') {
      news = news.filter(n => n.cat === cat);
    }

    // Filter by search query
    if (q) {
      const query = q.toLowerCase();
      news = news.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query)
      );
    }

    res.json({
      items: news.slice(0, parseInt(limit)),
      total: news.length,
      lastFetched: getLastFetched(),
    });
  } catch (err) {
    console.error('[News] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch news', details: err.message });
  }
});

// POST /api/news/refresh
router.post('/refresh', async (req, res) => {
  try {
    const news = await refreshNews();
    res.json({ success: true, count: news.length, lastFetched: getLastFetched() });
  } catch (err) {
    res.status(500).json({ error: 'Refresh failed', details: err.message });
  }
});

module.exports = router;
