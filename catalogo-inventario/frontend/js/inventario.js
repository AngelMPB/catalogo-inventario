import API_BASE_URL from './config.js'
const API = `${API_BASE_URL}/inventario`

async function cargar(soloAlertas = false) {
  const url = soloAlertas ? `${API}/alertas` : API
  const res = await fetch(url)
  const data = await res.json()
  const tbody = document.getElementById("tabla")
  const alertas = data.filter(i => i.stock_actual <= i.stock_minimo)
  document.getElementById("count-label").textContent = `${data.length} producto(s) en inventario`
  const banner = document.getElementById("banner-alertas")
  if (alertas.length > 0) {
    banner.innerHTML = `<div class="alert-banner">⚠️ Hay <strong>${alertas.length}</strong> producto(s) con stock bajo o agotado. Revisa y reabastece.</div>`
  } else {
    banner.innerHTML = ""
  }
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-icon">📊</div><div class="empty-text">Sin registros de inventario</div><div class="empty-sub">Los registros se crean automáticamente al agregar productos</div></div></td></tr>`
    return
  }
  tbody.innerHTML = data.map(i => {
    const alerta = i.stock_actual <= i.stock_minimo
    return `<tr>
      <td><strong>${i.productos?.nombre || "—"}</strong></td>
      <td><strong style="font-size:16px">${i.stock_actual}</strong></td>
      <td>${i.stock_minimo}</td>
      <td><span class="pill ${alerta ? 'pill-red' : 'pill-green'}">${alerta ? 'Stock bajo' : 'OK'}</span></td>
      <td class="actions">
        <button class="ab ab-edit" onclick="actualizarStock(${i.id}, ${i.stock_actual}, ${i.stock_minimo})">✏️ Editar stock</button>
      </td>
    </tr>`
  }).join("")
}

async function actualizarStock(id, stockActual, stockMinimo) {
  const nuevo = prompt("Nuevo stock actual:", stockActual)
  if (nuevo === null) return
  const nuevoMin = prompt("Stock mínimo:", stockMinimo)
  if (nuevoMin === null) return
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock_actual: parseInt(nuevo), stock_minimo: parseInt(nuevoMin) })
  })
  cargar()
}

window.cargar = cargar
window.actualizarStock = actualizarStock

cargar()