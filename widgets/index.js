/**
 * widgets/index.js
 * 
 * Componentes y elementos reutilizables de presentación para Pasaporte Cultural.
 */

export function renderUserBadge(usuario) {
  if (!usuario) return '';
  const rolClase = usuario.rol === 'editor' ? 'badge-editor' : 'badge-visitante';
  return `<span class="badge ${rolClase}"><span class="badge-dot"></span>${usuario.rol.toUpperCase()}</span>`;
}

export function renderCardLugar(lugar, esFavorito = false) {
  return `
    <div class="card-lugar" data-id="${lugar.id}">
      <img src="${lugar.imagen}" alt="${lugar.nombre}" class="card-imagen" />
      <div class="card-cuerpo">
        <span class="categoria-tag">${lugar.categoria}</span>
        <h3>${lugar.nombre}</h3>
        <p class="municipio">${lugar.municipio} • ${lugar.direccion}</p>
        <p class="descripcion">${lugar.descripcion}</p>
        <div class="card-footer">
          <span class="codigo-chip">Código: <code>${lugar.codigoRegistro}</code></span>
        </div>
      </div>
    </div>
  `;
}
