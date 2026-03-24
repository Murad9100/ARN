const axios = require('axios');

let newsCache = [];
let lastFetched = null;

// RSS servisləri üçün daha stabil alternativ linklər
const FEEDS = [
    {
        name: 'CryptoNews',
        url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fcryptonews.com%2Fnews%2Ffeed%2F',
        cat: 'crypto',
    },
    {
        name: 'Bitcoin Magazine',
        url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fbitcoinmagazine.com%2F.rss%2Ffull%2F',
        cat: 'crypto',
    }
];

async function fetchNewsAPI() {
    if (!process.env.NEWS_API_KEY) return [];
    try {
        const { data } = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: 'bitcoin OR ethereum OR crypto',
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 40,
                apiKey: process.env.NEWS_API_KEY,
            },
            timeout: 10000,
        });
        return (data.articles || []).map(a => ({
            id: a.url,
            title: a.title,
            description: a.description || '',
            url: a.url,
            source: a.source.name,
            publishedAt: a.publishedAt,
            cat: 'crypto',
            fromNewsAPI: true,
        }));
    } catch (e) {
        console.warn('[NewsAPI] Error:', e.response?.status === 401 ? "Açar səhvdir" : e.message);
        return [];
    }
}

async function fetchRSSFeed(feed) {
    try {
        const { data } = await axios.get(feed.url, { timeout: 10000 });
        if (data.status !== 'ok') return [];
        return data.items.map(item => ({
            id: item.link || item.title,
            title: item.title || '',
            description: (item.description || '').replace(/<[^>]+>/g, '').substring(0, 200),
            url: item.link || '',
            source: feed.name,
            publishedAt: item.pubDate,
            cat: feed.cat,
            fromRSS: true,
        }));
    } catch (e) {
        console.warn(`[RSS] ${feed.name} xətası:`, e.message);
        return [];
    }
}

// Analiz funksiyaları (Guess Impact/Direction) olduğu kimi qalır
function guessImpact(title) {
    const t = title.toLowerCase();
    if (/crash|hack|ban|crisis|plunge|fail/.test(t)) return 'HIGH';
    if (/rise|rally|surge|soar|approve|bullish/.test(t)) return 'HIGH';
    return 'MEDIUM';
}

function guessDirection(title) {
    const t = title.toLowerCase();
    if (/rise|rally|surge|gain|up|bull|buy|positive|approve/.test(t)) return 'BULLISH';
    if (/fall|drop|plunge|down|bear|sell|crash|negative|ban/.test(t)) return 'BEARISH';
    return 'NEUTRAL';
}

async function refreshNews() {
    // NewsAPI-dan gələn xəbərləri əsas götürürük
    const [rssResults, newsApiResults] = await Promise.all([
        Promise.all(FEEDS.map(fetchRSSFeed)),
        fetchNewsAPI(),
    ]);

    const allItems = [...newsApiResults, ...rssResults.flat()];

    const seen = new Set();
    const deduped = allItems.filter(item => {
        if (!item.title || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });

    deduped.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const enriched = deduped.slice(0, 50).map(item => ({
        ...item,
        impact: guessImpact(item.title),
        direction: guessDirection(item.title),
        fetchedAt: Date.now(),
    }));

    newsCache = enriched;
    lastFetched = new Date();
    return enriched;
}

function getNewsCache() { return newsCache; }
function getLastFetched() { return lastFetched; }

module.exports = { refreshNews, getNewsCache, getLastFetched };