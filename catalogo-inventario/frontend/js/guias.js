import API_BASE_URL from './config.js'
const API_GUIAS = `${API_BASE_URL}/guias`
const API_PEDS = `${API_BASE_URL}/pedidos`

async function cargarPedidos() {
  const res = await fetch(API_PEDS)
  const data = await res.json()
  const sel = document.getElementById("pedido_id")
  sel.innerHTML = `<option value="">Seleccionar pedido...</option>`
  data.forEach(p => {
    sel.innerHTML += `<option value="${p.id}">${p.numero_pedido} — ${p.nombre_cliente}</option>`
  })
}

async function crearGuia() {
  const pedido_id = document.getElementById("pedido_id").value
  const nombre_destinatario = document.getElementById("nombre_destinatario").value.trim()
  const direccion = document.getElementById("direccion").value.trim()
  const telefono = document.getElementById("telefono").value.trim()
  if (!pedido_id || !nombre_destinatario || !direccion) return alert("Pedido, destinatario y dirección son obligatorios")
  const res = await fetch(API_GUIAS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pedido_id: parseInt(pedido_id), nombre_destinatario, direccion, telefono })
  })
  const data = await res.json()
  if (!res.ok) return alert(data.mensaje || "Error al generar la guía")
  alert(`Guía ${data.numero_guia} generada exitosamente`)
  document.getElementById("pedido_id").value = ""
  document.getElementById("nombre_destinatario").value = ""
  document.getElementById("direccion").value = ""
  document.getElementById("telefono").value = ""
  cargarGuias()
}

async function cargarGuias() {
  const res = await fetch(API_GUIAS)
  const data = await res.json()
  const tbody = document.getElementById("tabla")
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">Sin guías generadas</td></tr>`
    return
  }
  tbody.innerHTML = data.map(g => `
    <tr>
      <td><span class="pill pill-green">${g.numero_guia}</span></td>
      <td><span class="pill pill-blue">${g.pedidos?.numero_pedido || g.pedido_id}</span></td>
      <td>${g.nombre_destinatario}</td>
      <td>${g.direccion}</td>
      <td>${g.telefono || "—"}</td>
      <td>${new Date(g.fecha_generacion).toLocaleDateString("es-CO")}</td>
    </tr>`).join("")
}

window.crearGuia = crearGuia

cargarPedidos()
cargarGuias()