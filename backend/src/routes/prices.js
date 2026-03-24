const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 30 }); // 30s cache

const CG_BASE = 'https://api.coingecko.com/api/v3';
const CG_HEADERS = process.env.COINGECKO_API_KEY
  ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
  : {};

// GET /api/prices/crypto?ids=bitcoin,ethereum,...&limit=50
router.get('/crypto', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 250);
    const ids = req.query.ids || '';
    const cacheKey = `crypto_${ids}_${limit}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const params = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: limit,
      page: 1,
      sparkline: false,
      price_change_percentage: '1h,24h,7d',
    };
    if (ids) params.ids = ids;

    const { data } = await axios.get(`${CG_BASE}/coins/markets`, {
      params,
      headers: CG_HEADERS,
      timeout: 8000,
    });

    const result = data.map(c => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      image: c.image,
      price: c.current_price,
      change1h: c.price_change_percentage_1h_in_currency,
      change24h: c.price_change_percentage_24h,
      change7d: c.price_change_percentage_7d_in_currency,
      marketCap: c.market_cap,
      volume: c.total_volume,
      rank: c.market_cap_rank,
    }));

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('[Prices] Crypto error:', err.message);
    res.status(500).json({ error: 'Failed to fetch crypto prices', details: err.message });
  }
});

// GET /api/prices/trending
router.get('/trending', async (req, res) => {
  try {
    const cached = cache.get('trending');
    if (cached) return res.json(cached);

    const { data } = await axios.get(`${CG_BASE}/search/trending`, {
      headers: CG_HEADERS,
      timeout: 6000,
    });

    const result = data.coins.map(c => ({
      id: c.item.id,
      symbol: c.item.symbol,
      name: c.item.name,
      rank: c.item.market_cap_rank,
      thumb: c.item.thumb,
    }));

    cache.set('trending', result, 300);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending', details: err.message });
  }
});

// GET /api/prices/global
router.get('/global', async (req, res) => {
  try {
    const cached = cache.get('global');
    if (cached) return res.json(cached);

    const { data } = await axios.get(`${CG_BASE}/global`, {
      headers: CG_HEADERS,
      timeout: 6000,
    });

    const d = data.data;
    const result = {
      totalMarketCap: d.total_market_cap.usd,
      totalVolume: d.total_volume.usd,
      btcDominance: d.market_cap_percentage.btc,
      ethDominance: d.market_cap_percentage.eth,
      marketCapChange: d.market_cap_change_percentage_24h_usd,
      activeCryptos: d.active_cryptocurrencies,
    };

    cache.set('global', result, 120);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch global data', details: err.message });
  }
});

// GET /api/prices/coin/:id — single coin detail
router.get('/coin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `coin_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const { data } = await axios.get(`${CG_BASE}/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
      },
      headers: CG_HEADERS,
      timeout: 8000,
    });

    const result = {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      description: data.description?.en?.split('.')[0] || '',
      image: data.image?.large,
      price: data.market_data.current_price.usd,
      change24h: data.market_data.price_change_percentage_24h,
      change7d: data.market_data.price_change_percentage_7d,
      change30d: data.market_data.price_change_percentage_30d,
      marketCap: data.market_data.market_cap.usd,
      volume: data.market_data.total_volume.usd,
      ath: data.market_data.ath.usd,
      atl: data.market_data.atl.usd,
      rank: data.market_cap_rank,
    };

    cache.set(cacheKey, result, 60);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coin', details: err.message });
  }
});

module.exports = router;
