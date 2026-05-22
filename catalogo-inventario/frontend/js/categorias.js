import API_BASE_URL from './config.js'
const API = `${API_BASE_URL}/categorias`
let todos = []

async function guardar() {
  const id = document.getElementById("editId").value
  const nombre = document.getElementById("nombre").value.trim()
  const descripcion = document.getElementById("descripcion").value.trim()
  if (!nombre) return alert("El nombre es obligatorio")
  const method = id ? "PUT" : "POST"
  const url = id ? `${API}/${id}` : API
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre, descripcion }) })
  if (!res.ok) return alert("Error al guardar")
  limpiar()
  cargar()
}

function editar(id, nombre, descripcion) {
  document.getElementById("editId").value = id
  document.getElementById("nombre").value = nombre
  document.getElementById("descripcion").value = descripcion
  document.getElementById("form-title").textContent = "Editar categoría"
  window.scrollTo({ top: 0, behavior: "smooth" })
}

async function eliminar(id) {
  if (!confirm("¿Eliminar esta categoría?")) return
  await fetch(`${API}/${id}`, { method: "DELETE" })
  cargar()
}

function limpiar() {
  document.getElementById("editId").value = ""
  document.getElementById("nombre").value = ""
  document.getElementById("descripcion").value = ""
  document.getElementById("form-title").textContent = "Nueva categoría"
}

function filtrar() {
  const q = document.getElementById("buscar").value.toLowerCase()
  renderizar(todos.filter(c => c.nombre.toLowerCase().includes(q)))
}

function renderizar(data) {
  const tbody = document.getElementById("tabla")
  document.getElementById("count-label").textContent = `${data.length} categoría(s) encontrada(s)`
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty"><div class="empty-icon">🏷️</div><div class="empty-text">Sin categorías</div><div class="empty-sub">Crea la primera categoría usando el formulario</div></div></td></tr>`
    return
  }
  tbody.innerHTML = data.map(c => `
    <tr>
      <td><strong>${c.id}</strong></td>
      <td><strong>${c.nombre}</strong></td>
      <td>${c.descripcion || "—"}</td>
      <td class="actions">
        <button class="ab ab-edit" onclick="editar(${c.id},'${c.nombre.replace(/'/g,"\\'")}','${(c.descripcion||"").replace(/'/g,"\\'")}')">✏️ Editar</button>
        <button class="ab ab-del" onclick="eliminar(${c.id})">🗑️ Eliminar</button>
      </td>
    </tr>`).join("")
}

async function cargar() {
  const res = await fetch(API)
  todos = await res.json()
  renderizar(todos)
}

window.guardar = guardar
window.editar = editar
window.eliminar = eliminar
window.limpiar = limpiar
window.filtrar = filtrar

cargar()