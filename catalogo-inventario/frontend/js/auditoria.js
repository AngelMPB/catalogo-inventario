import API_BASE_URL from './config.js'
const API = `${API_BASE_URL}/auditoria`
let todos = []

const SEVERIDAD_COLORS = {
  'info':    'pill-blue',
  'warning': 'pill-amber',
  'error':   'pill-red'
}

async function cargar() {
  const [eventos, notifs] = await Promise.all([
    fetch(`${API}/eventos`).then(r => r.json()),
    fetch(`${API}/notificaciones`).then(r => r.json())
  ])
  todos = eventos
  const ajustes = eventos.filter(e => e.accion === 'AJUSTE_INVENTARIO').length
  const estados = eventos.filter(e => e.accion === 'CAMBIO_ESTADO').length
  document.getElementById("s-total").textContent = eventos.length
  document.getElementById("s-inventario").textContent = ajustes
  document.getElementById("s-estados").textContent = estados
  document.getElementById("s-notif").textContent = notifs.length
  renderizarEventos(eventos)
  renderizarNotifs(notifs)
}

function filtrar() {
  const modulo = document.getElementById("filtroModulo").value
  const severidad = document.getElementById("filtroSeveridad").value
  const filtrados = todos.filter(e => {
    const matchMod = !modulo || e.modulo === modulo
    const matchSev = !severidad || e.severidad === severidad
    return matchMod && matchSev
  })
  renderizarEventos(filtrados)
}

function renderizarEventos(data) {
  const tbody = document.getElementById("tabla-eventos")
  document.getElementById("count-label").textContent = `${data.length} evento(s) registrado(s)`
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="empty-icon">📋</div><div class="empty-text">Sin eventos registrados</div></div></td></tr>`
    return
  }
  tbody.innerHTML = data.map(e => `
    <tr>
      <td>${new Date(e.created_at).toLocaleString("es-CO")}</td>
      <td><span class="pill pill-blue">${e.modulo || "—"}</span></td>
      <td><strong>${e.accion}</strong></td>
      <td style="max-width:280px;font-size:12px">${e.detalle || "—"}</td>
      <td>${e.usuario || "Admin"}</td>
      <td><span class="pill ${SEVERIDAD_COLORS[e.severidad] || 'pill-gray'}">${e.severidad || "info"}</span></td>
    </tr>`).join("")
}

function renderizarNotifs(data) {
  const tbody = document.getElementById("tabla-notif")
  document.getElementById("count-notif").textContent = `${data.length} notificación(es) enviada(s)`
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-icon">✉️</div><div class="empty-text">Sin notificaciones registradas</div></div></td></tr>`
    return
  }
  tbody.innerHTML = data.map(n => `
    <tr>
      <td>${new Date(n.created_at).toLocaleString("es-CO")}</td>
      <td><span class="pill pill-green">${n.guias_envio?.numero_guia || n.guia_id}</span></td>
      <td>${n.destinatario || "—"}</td>
      <td>${n.tipo || "—"}</td>
      <td><span class="pill ${n.estado_entrega === 'enviado' ? 'pill-green' : 'pill-red'}">${n.estado_entrega}</span></td>
    </tr>`).join("")
}

window.cargar = cargar
window.filtrar = filtrar

cargar()