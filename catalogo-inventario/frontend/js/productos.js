import API_BASE_URL from './config.js'
const API_BASE = `${API_BASE_URL}/productos`
const API_CAT = `${API_BASE_URL}/categorias`
let todos = []

async function cargarCategorias() {
  const res = await fetch(API_CAT)
  const data = await res.json()
  const sel = document.getElementById("categoria")
  const filtro = document.getElementById("filtroCat")
  sel.innerHTML = `<option value="">Sin categoría</option>`
  filtro.innerHTML = `<option value="">Todas las categorías</option>`
  data.forEach(c => {
    sel.innerHTML += `<option value="${c.id}">${c.nombre}</option>`
    filtro.innerHTML += `<option value="${c.id}">${c.nombre}</option>`
  })
}

function sanitizar(str) {
  return str.replace(/[<>"'{}()|\\]/g, "").trim()
}

function validarProducto(nombre, precio) {
  if (!nombre) return "El nombre es obligatorio"
  if (nombre.length < 2) return "El nombre debe tener al menos 2 caracteres"
  if (nombre.length > 150) return "El nombre no puede superar 150 caracteres"
  if (!precio || isNaN(precio)) return "El precio es obligatorio"
  if (parseFloat(precio) <= 0) return "El precio debe ser mayor a 0"
  if (parseFloat(precio) > 999999999) return "El precio ingresado es demasiado alto"
  return null
}

async function guardar() {
  const id = document.getElementById("editId").value
  const nombre = sanitizar(document.getElementById("nombre").value)
  const precio = document.getElementById("precio").value
  const descripcion = sanitizar(document.getElementById("descripcion").value)
  const imagen_url = document.getElementById("imagen_url").value.trim()
  const categoria_id = document.getElementById("categoria").value
  const error = validarProducto(nombre, precio)
  if (error) return alert(error)
  const method = id ? "PUT" : "POST"
  const url = id ? `${API_BASE}/${id}` : API_BASE
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, precio: parseFloat(precio), descripcion, imagen_url, categoria_id: categoria_id || null })
  })
  if (!res.ok) return alert("Error al guardar el producto")
  limpiar()
  cargarProductos()
}

function editar(p) {
  document.getElementById("editId").value = p.id
  document.getElementById("nombre").value = p.nombre
  document.getElementById("precio").value = p.precio
  document.getElementById("descripcion").value = p.descripcion || ""
  document.getElementById("imagen_url").value = p.imagen_url || ""
  document.getElementById("categoria").value = p.categoria_id || ""
  document.getElementById("form-title").textContent = "Editar producto"
  window.scrollTo({ top: 0, behavior: "smooth" })
}

async function toggleHabilitado(id) {
  await fetch(`${API_BASE}/${id}/toggle`, { method: "PATCH" })
  cargarProductos()
}

async function eliminar(id) {
  if (!confirm("¿Eliminar este producto?")) return
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" })
  if (!res.ok) return alert("No se pudo eliminar el producto")
  cargarProductos()
}

function limpiar() {
  document.getElementById("editId").value = ""
  document.getElementById("nombre").value = ""
  document.getElementById("precio").value = ""
  document.getElementById("descripcion").value = ""
  document.getElementById("imagen_url").value = ""
  document.getElementById("categoria").value = ""
  document.getElementById("form-title").textContent = "Nuevo producto"
}

function filtrar() {
  const q = document.getElementById("buscar").value.toLowerCase()
  const cat = document.getElementById("filtroCat").value
  const estado = document.getElementById("filtroEstado").value
  const precioMin = parseFloat(document.getElementById("precioMin").value) || 0
  const precioMax = parseFloat(document.getElementById("precioMax").value) || Infinity
  renderizar(todos.filter(p => {
    const matchQ = p.nombre.toLowerCase().includes(q)
    const matchCat = !cat || String(p.categoria_id) === cat
    const matchEstado = estado === "" || String(p.habilitado) === estado
    const matchPrecio = parseFloat(p.precio) >= precioMin && parseFloat(p.precio) <= precioMax
    return matchQ && matchCat && matchEstado && matchPrecio
  }))
}

function limpiarFiltros() {
  document.getElementById("buscar").value = ""
  document.getElementById("filtroCat").value = ""
  document.getElementById("filtroEstado").value = ""
  document.getElementById("precioMin").value = ""
  document.getElementById("precioMax").value = ""
  renderizar(todos)
}

function renderizar(data) {
  const tbody = document.getElementById("tabla")
  document.getElementById("count-label").textContent = `${data.length} producto(s) encontrado(s)`
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-icon">🛍️</div><div class="empty-text">Sin productos</div><div class="empty-sub">No hay productos que coincidan con los filtros</div></div></td></tr>`
    return
  }
  tbody.innerHTML = data.map(p => `
    <tr>
      <td><strong>${p.nombre}</strong></td>
      <td>$${parseFloat(p.precio).toLocaleString("es-CO")}</td>
      <td>${p.categorias?.nombre ? `<span class="pill pill-blue">${p.categorias.nombre}</span>` : "—"}</td>
      <td><span class="pill ${p.habilitado ? 'pill-green' : 'pill-gray'}">${p.habilitado ? 'Activo' : 'Inactivo'}</span></td>
      <td class="actions">
        <button class="ab ab-edit" onclick='editar(${JSON.stringify(p)})'>✏️ Editar</button>
        <button class="ab ${p.habilitado ? 'ab-off' : 'ab-toggle'}" onclick="toggleHabilitado(${p.id})">${p.habilitado ? 'Deshabilitar' : 'Habilitar'}</button>
        <button class="ab ab-del" onclick="eliminar(${p.id})">🗑️ Eliminar</button>
      </td>
    </tr>`).join("")
}

async function cargarProductos() {
  const res = await fetch(`${API_BASE}/todos`)
  todos = await res.json()
  renderizar(todos)
}

window.guardar = guardar
window.editar = editar
window.toggleHabilitado = toggleHabilitado
window.eliminar = eliminar
window.limpiar = limpiar
window.filtrar = filtrar
window.limpiarFiltros = limpiarFiltros

cargarCategorias()
cargarProductos()