import API_BASE_URL from './config.js'
const API = `${API_BASE_URL}/guias`

const ESTADOS = ['Pendiente', 'Preparación', 'En camino', 'Entregado', 'Cancelado']
const COLORES = {
  'Pendiente':   '#f59e0b',
  'Preparación': '#3b82f6',
  'En camino':   '#8b5cf6',
  'Entregado':   '#16a34a',
  'Cancelado':   '#dc2626'
}

async function buscar() {
  const numero = document.getElementById("numero_guia").value.trim()
  if (!numero) return alert("Ingresa un número de guía")
  const res = await fetch(`${API}/tracking/${numero}`)
  const div = document.getElementById("resultado")
  if (!res.ok) {
    div.innerHTML = `
      <div style="text-align:center;padding:24px;color:#dc2626">
        <div style="font-size:32px;margin-bottom:8px">❌</div>
        <div style="font-weight:600">Guía no encontrada</div>
        <div style="font-size:13px;color:#9ca3af;margin-top:4px">Verifica el número e intenta de nuevo</div>
      </div>`
    return
  }
  const { guia, historial } = await res.json()
  const estadoActual = guia.estado || 'Pendiente'
  const idxActual = ESTADOS.indexOf(estadoActual)
  div.innerHTML = `
    <div class="result-card">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div><div class="result-title">Número de guía</div><div class="result-value">${guia.numero_guia}</div></div>
        <div><div class="result-title">Estado actual</div><div class="result-value" style="color:${COLORES[estadoActual]}">${estadoActual}</div></div>
        <div><div class="result-title">Destinatario</div><div class="result-value">${guia.nombre_destinatario}</div></div>
        <div><div class="result-title">Dirección</div><div class="result-value">${guia.direccion}</div></div>
      </div>
      <div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;color:#9ca3af;margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em">Progreso del envío</div>
        <div style="display:flex;align-items:center;gap:0">
          ${ESTADOS.filter(e => e !== 'Cancelado').map((e, i) => {
            const activo = i <= idxActual && estadoActual !== 'Cancelado'
            const esActual = e === estadoActual
            return `
              <div style="flex:1;text-align:center">
                <div style="width:28px;height:28px;border-radius:50%;margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;background:${activo ? COLORES[e] : '#e5e7eb'};color:${activo ? '#fff' : '#9ca3af'};${esActual ? 'box-shadow:0 0 0 3px rgba(22,163,74,.2)' : ''}">${i+1}</div>
                <div style="font-size:11px;font-weight:${esActual ? '700' : '400'};color:${activo ? '#111' : '#9ca3af'}">${e}</div>
              </div>
              ${i < 3 ? `<div style="flex:1;height:2px;background:${i < idxActual && estadoActual !== 'Cancelado' ? '#16a34a' : '#e5e7eb'};margin-bottom:20px"></div>` : ''}`
          }).join("")}
        </div>
      </div>
      ${historial.length ? `
        <div>
          <div style="font-size:12px;font-weight:700;color:#9ca3af;margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em">Historial de movimientos</div>
          ${historial.map(h => `
            <div style="display:flex;gap:12px;margin-bottom:12px">
              <div style="width:8px;height:8px;border-radius:50%;background:#16a34a;margin-top:5px;flex-shrink:0"></div>
              <div>
                <div style="font-size:13px;font-weight:600;color:#111">${h.estado_nuevo}</div>
                <div style="font-size:12px;color:#9ca3af">${new Date(h.created_at).toLocaleString("es-CO")}</div>
                ${h.comentario ? `<div style="font-size:12px;color:#6b7280;font-style:italic">"${h.comentario}"</div>` : ""}
              </div>
            </div>`).join("")}
        </div>` : ""}
    </div>`
}

window.buscar = buscar