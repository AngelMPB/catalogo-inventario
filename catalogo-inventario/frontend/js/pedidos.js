const API_PED = "http://localhost:3000/pedidos"
const API_PROD = "http://localhost:3000/productos"
let productos = []
let items = []

async function cargarProductos() {
  const res = await fetch(API_PROD)
  productos = await res.json()
}

function agregarItem() {
  const idx = items.length
  items.push({ producto_id: "", cantidad: 1, precio_unitario: 0 })
  const cont = document.getElementById("items-pedido")
  const div = document.createElement("div")
  div.id = `item-${idx}`
  div.style.cssText = "display:flex;gap:8px;align-items:center;margin-bottom:4px"
  div.innerHTML = `
    <select style="flex:2;border:1px solid #e2e8e2;border-radius:8px;padding:8px 10px;font-size:13px;background:#f9fafb"
      onchange="seleccionarProducto(${idx}, this)">
      <option value="">Seleccionar producto...</option>
      ${productos.map(p => `<option value="${p.id}" data-precio="${p.precio}">${p.nombre} - $${parseFloat(p.precio).toLocaleString("es-CO")}</option>`).join("")}
    </select>
    <input type="number" min="1" value="1"
      style="width:80px;border:1px solid #e2e8e2;border-radius:8px;padding:8px 10px;font-size:13px;background:#f9fafb"
      onchange="items[${idx}].cantidad=parseInt(this.value)||1;calcularTotal()">
    <button class="ab ab-del" onclick="quitarItem(${idx})">✕</button>`
  cont.appendChild(div)
}

function seleccionarProducto(idx, sel) {
  const opt = sel.options[sel.selectedIndex]
  items[idx].producto_id = sel.value
  items[idx].precio_unitario = parseFloat(opt.dataset.precio || 0)
  calcularTotal()
}

function quitarItem(idx) {
  document.getElementById(`item-${idx}`)?.remove()
  items[idx] = null
  calcularTotal()
}

function calcularTotal() {
  const total = items.reduce((acc, item) => {
    if (!item || !item.producto_id) return acc
    return acc + (item.precio_unitario * (item.cantidad || 1))
  }, 0)
  document.getElementById("total").textContent = `$${total.toLocaleString("es-CO")}`
}

async function crearPedido() {
  const nombre_cliente = document.getElementById("nombre_cliente").value.trim()
  const notas = document.getElementById("notas").value.trim()
  if (!nombre_cliente) return alert("El nombre del cliente es obligatorio")

  const itemsFiltrados = items.filter(i => i && i.producto_id)
  if (!itemsFiltrados.length) return alert("Agrega al menos un producto")

  const total = itemsFiltrados.reduce((acc, i) => acc + (i.precio_unitario * i.cantidad), 0)

  const res = await fetch(API_PED, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre_cliente, notas, total, items: itemsFiltrados })
  })

  const data = await res.json()
  if (!res.ok) return alert(data.mensaje || "Error al crear el pedido")

  alert(`Pedido ${data.numero_pedido} creado exitosamente`)
  document.getElementById("nombre_cliente").value = ""
  document.getElementById("notas").value = ""
  document.getElementById("items-pedido").innerHTML = ""
  document.getElementById("total").textContent = "$0"
  items = []
  cargarPedidos()
}

async function cargarPedidos() {
  const res = await fetch(API_PED)
  const data = await res.json()
  const tbody = document.getElementById("tabla")
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">Sin pedidos</td></tr>`
    return
  }
  tbody.innerHTML = data.map(p => `
    <tr>
      <td><span class="pill pill-blue">${p.numero_pedido}</span></td>
      <td>${p.nombre_cliente}</td>
      <td>$${parseFloat(p.total || 0).toLocaleString("es-CO")}</td>
      <td>${new Date(p.created_at).toLocaleDateString("es-CO")}</td>
      <td><a href="guias.html"><button class="ab ab-view">Generar guía</button></a></td>
    </tr>`).join("")
}

cargarProductos()
cargarPedidos()