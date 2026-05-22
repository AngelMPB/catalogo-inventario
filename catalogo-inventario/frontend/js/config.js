// frontend/js/config.js
// En local usa localhost, en Cloud Run usa la URL del servicio automáticamente
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : window.location.origin

export default API_BASE