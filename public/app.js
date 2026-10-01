/**
 * public/app.js
 * 
 * Lógica del cliente interactivo para Sprint 1:
 * - Sesión activa y consulta de Sesión.usuarioActual()
 * - Inicio y cierre de sesión (1-clic y manual)
 * - Verificación en vivo de control de roles (Visitante vs Editor)
 * - Renderizado de lugares culturales desde semilla
 */

// Lugares locales de demostración para visualización inmediata en Sprint 1
const LUGARES_SEEDED = [
  {
    id: 'lug-museo-01',
    nombre: 'Museo del Oro',
    categoria: 'museo',
    municipio: 'Bogotá',
    direccion: 'Carrera 6 # 15-88',
    descripcion: 'Alberga una de las mayores colecciones de orfebrería prehispánica del mundo.',
    imagen: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'ORO-BOG-01'
  },
  {
    id: 'lug-museo-02',
    nombre: 'Museo de Antioquia',
    categoria: 'museo',
    municipio: 'Medellín',
    direccion: 'Calle 52 # 52-43',
    descripcion: 'Custodia la más amplia colección donada por el maestro Fernando Botero.',
    imagen: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'ANT-MED-02'
  },
  {
    id: 'lug-museo-03',
    nombre: 'Museo Nacional de Colombia',
    categoria: 'museo',
    municipio: 'Bogotá',
    direccion: 'Carrera 7 # 28-66',
    descripcion: 'El museo más antiguo de Colombia en su histórica edificación panóptica.',
    imagen: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'NAC-BOG-03'
  },
  {
    id: 'lug-museo-04',
    nombre: 'Museo de Arte Moderno (MAMM)',
    categoria: 'museo',
    municipio: 'Medellín',
    direccion: 'Carrera 44 # 19A-100',
    descripcion: 'Epicentro del arte moderno y contemporáneo y la colección Débora Arango.',
    imagen: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'MAMM-MED-04'
  },
  {
    id: 'lug-galeria-01',
    nombre: 'Galería Casas Riegner',
    categoria: 'galería',
    municipio: 'Bogotá',
    direccion: 'Calle 70A # 7-30',
    descripcion: 'Espacio de vanguardia enfocado en artistas emergentes y prácticas conceptuales.',
    imagen: 'https://images.unsplash.com/photo-1577720643272-265f09367456?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'CAS-BOG-05'
  },
  {
    id: 'lug-galeria-02',
    nombre: 'Galería Lokkus Arte',
    categoria: 'galería',
    municipio: 'Medellín',
    direccion: 'Carrera 36 # 10A-35',
    descripcion: 'Plataforma para el pensamiento crítico contemporáneo y curadurías experimentales.',
    imagen: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'LOK-MED-06'
  },
  {
    id: 'lug-galeria-03',
    nombre: 'Galería La Cometa',
    categoria: 'galería',
    municipio: 'Bogotá',
    direccion: 'Carrera 10 # 94A-25',
    descripcion: 'Pionera en la proyección del arte latinoamericano contemporáneo y moderno.',
    imagen: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'COM-BOG-07'
  },
  {
    id: 'lug-galeria-04',
    nombre: 'Galería Espacio El Dorado',
    categoria: 'galería',
    municipio: 'Bogotá',
    direccion: 'Carrera 4A # 26C-49',
    descripcion: 'Dedicado a exposiciones de gran formato, debate cultural e investigación visual.',
    imagen: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'ELD-BOG-08'
  },
  {
    id: 'lug-centro-01',
    nombre: 'Centro Cultural Gabriel García Márquez',
    categoria: 'centro cultural',
    municipio: 'Bogotá',
    direccion: 'Calle 11 # 5-60',
    descripcion: 'Magnífica obra diseñada por Rogelio Salmona que reúne librería, arte y auditorios.',
    imagen: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'GGM-BOG-09'
  },
  {
    id: 'lug-centro-02',
    nombre: 'Parque Explora y Centro Cultural',
    categoria: 'centro cultural',
    municipio: 'Medellín',
    direccion: 'Carrera 53 # 73-75',
    descripcion: 'Espacio interactivo de divulgación científica, tecnológica y artística.',
    imagen: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'EXP-MED-10'
  },
  {
    id: 'lug-centro-03',
    nombre: 'Centro de Memoria, Paz y Reconciliación',
    categoria: 'centro cultural',
    municipio: 'Bogotá',
    direccion: 'Carrera 19B # 24-86',
    descripcion: 'Encuentro pedagógico y conmemorativo dedicado al patrimonio social.',
    imagen: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'MEM-BOG-11'
  },
  {
    id: 'lug-centro-04',
    nombre: 'Centro Cultural Banco de la República',
    categoria: 'centro cultural',
    municipio: 'Cartagena',
    direccion: 'Calle de las Damas # 3-28',
    descripcion: 'Mansión colonial con museo del oro Zenú y biblioteca cultural especializada.',
    imagen: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'BRC-CTG-12'
  }
];

let estadoSesion = {
  autenticado: false,
  usuario: null,
  token: null,
  expiresAt: null
};

// Referencias del DOM
const noSessionState = document.getElementById('noSessionState');
const activeSessionState = document.getElementById('activeSessionState');
const activeAvatar = document.getElementById('activeAvatar');
const activeUserName = document.getElementById('activeUserName');
const activeUserRole = document.getElementById('activeUserRole');
const activeUserEmail = document.getElementById('activeUserEmail');
const activeToken = document.getElementById('activeToken');
const activeExpiry = document.getElementById('activeExpiry');
const btnLogout = document.getElementById('btnLogout');
const btnConsultarMe = document.getElementById('btnConsultarMe');
const formLogin = document.getElementById('formLogin');
const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');

const btnQuickLoginVisitante = document.getElementById('btnQuickLoginVisitante');
const btnQuickLoginEditor = document.getElementById('btnQuickLoginEditor');

const btnTestSesionGeneral = document.getElementById('btnTestSesionGeneral');
const btnTestRutaEditor = document.getElementById('btnTestRutaEditor');
const consoleStatus = document.getElementById('consoleStatus');
const consoleBody = document.getElementById('consoleBody');

const placesGrid = document.getElementById('placesGrid');
const categoryFilters = document.getElementById('categoryFilters');

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  renderPlaces('todos');
  setupCategoryFilters();
  await verificarSesionActual();
});

// Consultar Sesión.usuarioActual()
async function verificarSesionActual() {
  try {
    const res = await fetch('/api/access/me');
    const data = await res.json();

    if (data.autenticado && data.usuario) {
      estadoSesion.autenticado = true;
      estadoSesion.usuario = data.usuario;
      actualizarVistaSesion();
    } else {
      estadoSesion.autenticado = false;
      estadoSesion.usuario = null;
      actualizarVistaSesion();
    }
  } catch (err) {
    console.error('Error al verificar sesión:', err);
    estadoSesion.autenticado = false;
    actualizarVistaSesion();
  }
}

// Iniciar sesión API
async function realizarLogin(email, password) {
  mostrarEnConsola('Iniciando sesión...', 'POST /api/access/login', 'info');
  try {
    const res = await fetch('/api/access/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      estadoSesion.autenticado = true;
      estadoSesion.usuario = data.usuario;
      estadoSesion.token = data.token;
      estadoSesion.expiresAt = data.expiresAt;

      mostrarEnConsola(`HTTP 200 OK - Login Exitoso`, JSON.stringify(data, null, 2), 'ok');
      actualizarVistaSesion();
    } else {
      mostrarEnConsola(`HTTP ${res.status} Error de Autenticación`, JSON.stringify(data, null, 2), 'error');
    }
  } catch (err) {
    mostrarEnConsola('Error de Red', err.message, 'error');
  }
}

// Cerrar sesión API
async function realizarLogout() {
  try {
    const res = await fetch('/api/access/logout', { method: 'POST' });
    const data = await res.json();

    estadoSesion.autenticado = false;
    estadoSesion.usuario = null;
    estadoSesion.token = null;
    estadoSesion.expiresAt = null;

    mostrarEnConsola('HTTP 200 OK - Sesión Cerrada', JSON.stringify(data, null, 2), 'ok');
    actualizarVistaSesion();
  } catch (err) {
    mostrarEnConsola('Error de Red en Logout', err.message, 'error');
  }
}

// Actualiza los elementos del DOM según el estado de la sesión
function actualizarVistaSesion() {
  if (estadoSesion.autenticado && estadoSesion.usuario) {
    noSessionState.classList.add('hidden');
    activeSessionState.classList.remove('hidden');

    const u = estadoSesion.usuario;
    activeUserName.textContent = u.nombre;
    activeUserEmail.textContent = u.email;

    activeUserRole.textContent = u.rol.toUpperCase();
    activeUserRole.className = `role-badge ${u.rol === 'editor' ? 'role-editor' : 'role-visitante'}`;

    activeAvatar.textContent = u.nombre.split(' ').map(n => n[0]).join('').substring(0, 2);
    activeAvatar.className = `user-avatar ${u.rol === 'editor' ? 'avatar-editor' : 'avatar-visitante'}`;

    activeToken.textContent = estadoSesion.token || 'Cookie de sesión activa';
    activeExpiry.textContent = estadoSesion.expiresAt ? new Date(estadoSesion.expiresAt).toLocaleString() : '24 horas desde login';
  } else {
    noSessionState.classList.remove('hidden');
    activeSessionState.classList.add('hidden');
  }
}

// Consola interactiva para mostrar respuestas
function mostrarEnConsola(status, body, tipo = 'info') {
  consoleStatus.textContent = status;
  consoleStatus.className = `console-status ${tipo === 'ok' ? 'status-ok' : tipo === 'error' ? 'status-error' : ''}`;
  consoleBody.textContent = body;
}

// Event Listeners
btnQuickLoginVisitante.addEventListener('click', () => {
  realizarLogin('visitante@pasaporte.com', 'Visitante123!');
});

btnQuickLoginEditor.addEventListener('click', () => {
  realizarLogin('editor@pasaporte.com', 'Editor123!');
});

formLogin.addEventListener('submit', (e) => {
  e.preventDefault();
  realizarLogin(inputEmail.value, inputPassword.value);
});

btnLogout.addEventListener('click', () => {
  realizarLogout();
});

btnConsultarMe.addEventListener('click', async () => {
  mostrarEnConsola('Consultando...', 'GET /api/access/me', 'info');
  try {
    const res = await fetch('/api/access/me');
    const data = await res.json();
    mostrarEnConsola(`HTTP ${res.status} Sesión.usuarioActual()`, JSON.stringify(data, null, 2), 'ok');
    if (data.autenticado) {
      estadoSesion.autenticado = true;
      estadoSesion.usuario = data.usuario;
    } else {
      estadoSesion.autenticado = false;
      estadoSesion.usuario = null;
    }
    actualizarVistaSesion();
  } catch (err) {
    mostrarEnConsola('Error al consultar usuarioActual', err.message, 'error');
  }
});

// Pruebas de guardas de seguridad
btnTestSesionGeneral.addEventListener('click', async () => {
  mostrarEnConsola('Probando ruta con requerirSesion...', 'GET /api/admin/usuario-area', 'info');
  try {
    const res = await fetch('/api/admin/usuario-area');
    const data = await res.json();
    const tipo = res.ok ? 'ok' : 'error';
    mostrarEnConsola(`HTTP ${res.status} ${res.statusText}`, JSON.stringify(data, null, 2), tipo);
  } catch (err) {
    mostrarEnConsola('Error', err.message, 'error');
  }
});

btnTestRutaEditor.addEventListener('click', async () => {
  mostrarEnConsola('Probando ruta con requerirEditor...', 'GET /api/admin/check', 'info');
  try {
    const res = await fetch('/api/admin/check');
    const data = await res.json();
    const tipo = res.ok ? 'ok' : 'error';
    let nota = '';
    if (res.status === 403) {
      nota = '\n\n🛡️ [REGLA 9 CUMPLIDA]: El sistema denegó la operación porque el usuario actual es visitante y la ruta exige rol editor.';
    } else if (res.status === 200) {
      nota = '\n\n👑 [AUTORIZACIÓN CORRECTA]: Usuario con rol editor autorizado a funciones de administración.';
    }
    mostrarEnConsola(`HTTP ${res.status} ${res.statusText}`, JSON.stringify(data, null, 2) + nota, tipo);
  } catch (err) {
    mostrarEnConsola('Error', err.message, 'error');
  }
});

// Renderizado y filtros de lugares
function setupCategoryFilters() {
  categoryFilters.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      categoryFilters.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderPlaces(btn.getAttribute('data-cat'));
    });
  });
}

function renderPlaces(filtroCat) {
  const filtrados = filtroCat === 'todos'
    ? LUGARES_SEEDED
    : LUGARES_SEEDED.filter((l) => l.categoria.toLowerCase() === filtroCat.toLowerCase());

  placesGrid.innerHTML = filtrados.map((l) => {
    const tagClass = l.categoria === 'museo' ? 'tag-museo' : l.categoria === 'galería' ? 'tag-galeria' : 'tag-centro';
    return `
      <div class="card-lugar">
        <div class="card-img-wrap">
          <img src="${l.imagen}" alt="${l.nombre}" class="card-img" loading="lazy" />
          <span class="card-tag ${tagClass}">${l.categoria}</span>
        </div>
        <div class="card-content">
          <div>
            <h4 class="card-title">${l.nombre}</h4>
            <p class="card-loc">📍 ${l.municipio} • ${l.direccion}</p>
            <p class="card-desc">${l.descripcion}</p>
          </div>
          <div class="card-footer">
            <span class="code-badge">Cód: ${l.codigoRegistro}</span>
            <span class="status-active-badge">
              <span class="status-dot"></span> Activo
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
