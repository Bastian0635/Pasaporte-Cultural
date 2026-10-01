# 🏛️ Pasaporte Cultural — Entrega 1 (Sprint 1)

> **Cimientos, Modelos y Control de Acceso**  
> Plataforma para descubrir espacios culturales, guardar lugares de interés, registrar visitas y cumplir retos de exploración.

---

## 📋 Resumen del Sprint 1

En este primer sprint se implementó la arquitectura base completa del sistema, el modelo de datos relacional con persistencia en SQLite nativo, la semilla de datos inicial reproducible e idempotente, y el módulo de acceso con control de roles (`visitante` vs `editor`).

---

## 📂 Estructura del Proyecto

El proyecto sigue con total fidelidad la organización de carpetas y responsabilidades exigida:

```text
Pasaporte-Cultural/
├── core/                       # Constantes, manejo de fechas, validadores puros y tipos de error
│   ├── constants.js            # Roles, categorías ('museo', 'galería', 'centro cultural') y config
│   ├── errors.js               # AppError, ValidationError, AuthenticationError, ForbiddenError, etc.
│   ├── dateUtils.js            # Utilidades de fechas con criterio unificado de día y zona horaria
│   ├── validators.js           # Validadores puros (texto, email, roles, categorías, metas, etc.)
│   └── index.js
├── data/
│   ├── models/                 # Modelos de dominio y serialización
│   │   ├── Usuario.js          # Entidad Usuario con validación y métodos de rol
│   │   ├── Lugar.js            # Entidad Lugar con código único y control de estado activo
│   │   ├── Visita.js           # Entidad Visita con cálculo de día civil
│   │   ├── Favorito.js         # Entidad Favorito (pareja usuario-lugar única)
│   │   ├── Reto.js             # Entidad Reto con meta positiva y rango de fechas
│   │   └── index.js
│   ├── providers/              # Acceso concreto al almacenamiento
│   │   ├── sqliteProvider.js   # Proveedor basado en SQLite nativo (node:sqlite)
│   │   └── index.js
│   ├── repositories/           # Capa de abstracción y consultas
│   │   ├── UsuarioRepository.js
│   │   ├── LugarRepository.js
│   │   ├── VisitaRepository.js
│   │   ├── FavoritoRepository.js
│   │   ├── RetoRepository.js
│   │   ├── SesionRepository.js
│   │   └── index.js
│   ├── services/               # Lógica de aplicación y reglas de negocio
│   │   ├── sesionService.js    # SesionService con la operación Sesión.usuarioActual()
│   │   └── index.js
│   └── factories/              # Semillas de demostración reproducibles
│       ├── demoData.js         # 12 lugares (3 categorías), 3 retos y 2 usuarios
│       ├── seedFactory.js      # Inicialización idempotente (no sobrescribe datos)
│       └── index.js
├── modules/                    # Módulos funcionales de la aplicación
│   ├── access/                 # Módulo de Acceso (accessController.js, index.js)
│   ├── home/                   # Módulo de Inicio / Resumen (scaffold)
│   ├── places/                 # Módulo de Catálogo de Lugares (scaffold)
│   ├── favorites/              # Módulo de Favoritos (scaffold)
│   ├── checkin/                # Módulo de Registro de Visitas (scaffold)
│   ├── passport/               # Módulo de Pasaporte Cultural (scaffold)
│   ├── challenges/             # Módulo de Retos (scaffold)
│   ├── profile/                # Módulo de Perfil (scaffold)
│   └── admin/                  # Módulo de Administración (scaffold)
├── routes/                     # Definición de endpoints y rutas
│   ├── accessRoutes.js         # Login, Logout, /me (usuarioActual), demo-users
│   ├── adminRoutes.js          # Rutas protegidas para comprobación de roles
│   └── index.js                # Enrutador central de la API
├── middlewares/                # Guardas de seguridad y control de acceso
│   ├── authMiddleware.js       # requerirSesion, requerirEditor, soloInvitado, extraerToken
│   ├── errorHandler.js         # Captura centralizada de excepciones
│   └── index.js
├── widgets/                    # Componentes reutilizables de presentación
│   └── index.js
├── public/                     # Interfaz web interactiva de demostración
│   ├── index.html              # Dashboard visual con prueba de roles en vivo
│   ├── styles.css              # Diseño moderno en modo oscuro con acentos dorados
│   └── app.js                  # Lógica del cliente para probar la sesión
├── tests/                      # Suite automatizada de pruebas con node:test
│   ├── core/validators_and_errors.test.js
│   ├── data/models.test.js
│   ├── data/persistence_and_seed.test.js
│   ├── modules/access_and_session.test.js
│   └── middlewares/auth.test.js
├── scripts/
│   └── seed.js                 # Script independiente para ejecutar la semilla
├── server.js                   # Servidor principal y punto de arranque
├── app.js                      # Configuración de Express
└── package.json
```

---

## 👥 Usuarios de Prueba

El sistema incluye 2 usuarios preconfigurados en la base de datos:

| Rol | Nombre | Correo Electrónico | Contraseña |
| :--- | :--- | :--- | :--- |
| **Visitante** | Carlos Visitante | `visitante@pasaporte.com` | `Visitante123!` |
| **Editor** | Elena Editora | `editor@pasaporte.com` | `Editor123!` |

---

## 🏛️ Lugares Culturales Sembrados (12 Lugares)

Se distribuyen equitativamente entre las 3 categorías del sistema:

1. **Museos (4)**:
   - Museo del Oro (`ORO-BOG-01`, Bogotá)
   - Museo de Antioquia (`ANT-MED-02`, Medellín)
   - Museo Nacional de Colombia (`NAC-BOG-03`, Bogotá)
   - Museo de Arte Moderno de Medellín — MAMM (`MAMM-MED-04`, Medellín)
2. **Galerías (4)**:
   - Galería Casas Riegner (`CAS-BOG-05`, Bogotá)
   - Galería Lokkus Arte Contemporáneo (`LOK-MED-06`, Medellín)
   - Galería La Cometa (`COM-BOG-07`, Bogotá)
   - Galería Espacio El Dorado (`ELD-BOG-08`, Bogotá)
3. **Centros Culturales (4)**:
   - Centro Cultural Gabriel García Márquez (`GGM-BOG-09`, Bogotá)
   - Parque Explora y Centro Cultural (`EXP-MED-10`, Medellín)
   - Centro de Memoria, Paz y Reconciliación (`MEM-BOG-11`, Bogotá)
   - Centro Cultural Banco de la República (`BRC-CTG-12`, Cartagena)

---

## 🏆 Retos Sembrados (3 Retos)

- `ret-museos-2026`: *Conoce tres museos distintos durante el ciclo cultural* (Categoría: Museo, Meta: 3, **Activo**).
- `ret-galerias-otoño`: *Circuito de galerías de arte contemporáneo* (Categoría: Galería, Meta: 2, **Activo**).
- `ret-centros-verano`: *Ruta de centros culturales de temporada* (Categoría: Centro Cultural, Meta: 3, **Finalizado / Inactivo**).

---

## 🛡️ Reglas de Negocio Implementadas en Sprint 1

1. **Idempotencia y No-Sobrescritura**: La carga inicial (`SeedFactory.poblarSiEsNecesario`) verifica la preexistencia de datos. Si un editor modifica o desactiva un lugar, o si un usuario registra visitas o favoritos, **los reinicios posteriores NO sobrescriben ni alteran sus datos**.
2. **Criterio de Día y Zona Horaria (Regla 3)**: Documentado e implementado en `core/dateUtils.js`. Se utiliza la zona horaria `America/Bogota` (UTC-5) y formato civil `YYYY-MM-DD` para evaluar la unicidad de visitas diarias y ventanas de vigencia.
3. **Validación de Metas y Fechas de Retos (Regla 5)**: Validador puro en `core/validators.js` que garantiza que la meta sea un entero mayor a cero y que la fecha de inicio no sea posterior a la final.
4. **Operación `Sesión.usuarioActual()`**: Implementada en `data/services/sesionService.js`. Devuelve la instancia de `Usuario` correspondiente al token o `null` si hay ausencia de sesión.
5. **Control de Acceso y Regla 9**: Se valida el rol en el backend tanto al verificar la sesión como al intentar ejecutar rutas protegidas (`requerirEditor`). Si un visitante intenta ingresar a un recurso de editor, recibe un error HTTP `403 Forbidden` (`FORBIDDEN_ACCESS`).

---

## 🚀 Puesta en Marcha

### 1. Instalación de dependencias
```bash
npm install
```

### 2. Ejecutar Pruebas Automatizadas
Se utiliza el test runner nativo de Node.js (`node:test`):
```bash
npm test
```
*Resultado: 29 pruebas unitarias y de integración pasando al 100%.*

### 3. Iniciar el Servidor de Desarrollo
```bash
npm start
```
El servidor se iniciará en `http://localhost:3000`.

Al abrir `http://localhost:3000` en el navegador, se presenta la **interfaz visual interactiva** con:
- Login de 1-clic para Carlos Visitante y Elena Editora.
- Tarjeta de inspección en vivo de `Sesión.usuarioActual()`.
- Botones para probar las guardas de seguridad y comprobar en tiempo real la respuesta HTTP 403 Forbidden para visitantes y 200 OK para editores.
- Catálogo visual de los 12 lugares sembrados con filtros dinámicos por categoría.
