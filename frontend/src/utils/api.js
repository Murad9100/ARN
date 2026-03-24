import axios from 'axios'

const api = axios.create({
  baseURL: 'https://arn-sd6r.onrender.com/api',
  timeout: 10000,
})

export const fetchCrypto = (limit = 100) =>
  api.get(`/prices/crypto?limit=${limit}`).then(r => r.data)

export const fetchGlobal = () =>
  api.get('/prices/global').then(r => r.data)

export const fetchCoin = (id) =>
  api.get(`/prices/coin/${id}`).then(r => r.data)

export const fetchNews = (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return api.get(`/news?${query}`).then(r => r.data)
}

export const refreshNews = () =>
  api.post('/news/refresh').then(r => r.data)

export const analyzeNews = (news, prices) =>
  api.post('/analyze', { news, prices }).then(r => r.data)

export const analyzeBatch = (items, prices) =>
  api.post('/analyze/batch', { items, prices }).then(r => r.data)

export default api
