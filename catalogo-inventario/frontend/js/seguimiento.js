import API_BASE_URL from './config.js'
const API = `${API_BASE_URL}/guias`

const COLORES = {
  'Pendiente':   'pill-amber',
  'Preparación': 'pill-blue',
  'En camino':   'pill-purple',
  'Entregado':   'pill-green',
  'Cancelado':   'pill-red'
}

const FLUJO = {
  'Pendiente':   ['Preparación', 'Cancelado'],
  'Preparación': ['En camino', 'Cancelado'],
  'En camino':   ['Entregado', 'Cancelado'],
  'Entregado':   [],
  'Cancelado':   []
}

async function cargar() {
  const res = await fetch(API)
  const data = await res.json()
  const tbody = document.getElementById("tabla")
  document.getElementById("count-label").textContent = `${data.length} guía(s) registrada(s)`
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-icon">📍</div><div class="empty-text">Sin guías registradas</div></div></td></tr>`
    return
  }
  tbody.innerHTML = data.map(g => {
    const estado = g.estado || 'Pendiente'
    const siguientes = FLUJO[estado] || []
    const opciones = siguientes.length
      ? siguientes.map(s => `<button class="ab ab-toggle" onclick="cambiarEstado(${g.id}, '${s}')">${s}</button>`).join("")
      : `<span style="font-size:12px;color:#9ca3af">Sin cambios posibles</span>`
    return `<tr>
      <td><span class="pill pill-green">${g.numero_guia}</span></td>
      <td><strong>${g.nombre_destinatario}</strong></td>
      <td><span class="pill ${COLORES[estado] || 'pill-gray'}">${estado}</span></td>
      <td class="actions">${opciones}</td>
      <td><button class="ab ab-view" onclick="verHistorial(${g.id})">📋 Ver</button></td>
    </tr>`
  }).join("")
}

async function cambiarEstado(id, estado_nuevo) {
  const comentario = prompt(`Comentario opcional para "${estado_nuevo}":`) || ""
  const res = await fetch(`${API}/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado_nuevo, usuario: "Admin", comentario })
  })
  const data = await res.json()
  if (!res.ok) return alert(data.mensaje || "Error al cambiar estado")
  cargar()
}

async function verHistorial(id) {
  const res = await fetch(`${API}/${id}/historial`)
  const data = await res.json()
  const cont = document.getElementById("historial-content")
  if (!data.length) {
    cont.innerHTML = `<p style="color:#9ca3af;font-size:13px">Sin cambios de estado registrados aún.</p>`
  } else {
    cont.innerHTML = data.map(h => `
      <div style="display:flex;gap:12px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #f3f4f6">
        <div style="width:8px;height:8px;border-radius:50%;background:#16a34a;margin-top:5px;flex-shrink:0"></div>
        <div>
          <div style="font-size:13px;font-weight:600">${h.estado_anterior || '—'} → ${h.estado_nuevo}</div>
          <div style="font-size:12px;color:#9ca3af">${new Date(h.created_at).toLocaleString("es-CO")} · ${h.usuario || 'Admin'}</div>
          ${h.comentario ? `<div style="font-size:12px;color:#6b7280;font-style:italic;margin-top:2px">"${h.comentario}"</div>` : ""}
        </div>
      </div>`).join("")
  }
  document.getElementById("modal-historial").style.display = "flex"
}

function cerrarModal() {
  document.getElementById("modal-historial").style.display = "none"
}

window.cambiarEstado = cambiarEstado
window.verHistorial = verHistorial
window.cerrarModal = cerrarModal

cargar()