# Pasaporte Cultural - Backend

Backend modular desarrollado para la plataforma **Pasaporte Cultural**, encargado de gestionar usuarios, lugares culturales, registro de visitas con geolocalización, retos y estadísticas de exploración.

## 🛠️ Arquitectura del Proyecto

El proyecto sigue una arquitectura en capas basada en principios de código limpio (*Clean Architecture*):

* **`data/providers/`**: Proveedor de persistencia utilizando PostgreSQL (`postgresProvider.js`).

* **`data/repositories/`**: Abstracción de acceso a datos para cada entidad (`Usuario`, `Lugar`, `Visita`, `Favorito`, `Reto`, `Sesión`).

* **`data/factories/`**: Fábricas de inicialización y siembra de datos de prueba (`seedFactory.js`).

* **`services/`**: Lógica de negocio de la aplicación.

* **`routes/`**: Definición de endpoints REST API.

## 🐘 Base de Datos & Persistencia

La aplicación utiliza **PostgreSQL** como motor principal de base de datos local / producción.

### Ventajas de PostgreSQL en este proyecto

* **Límite de visitas diarias**: Control estricto mediante índices expresionales basados en fechas (`(timestamp::date)`).

* **Consultas analíticas**: Soporte optimizado para el cálculo de progreso en retos y rankings.

* **Integridad referencial y concurrencia**: Operaciones asíncronas seguras para múltiples usuarios simultáneos.

## 🚀 Requisitos Previos

1. **Node.js**: v18.x o superior.

2. **PostgreSQL**: v14.x o superior instalado y corriendo en entorno local.

3. **pgAdmin 4** (opcional, para gestión visual).

## ⚙️ Configuración del Entorno

1. Crea un archivo `.env` en la raíz del proyecto basándote en la siguiente variable de entorno:

```
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/Pasaporte_Cultural?schema=public"
PORT=3000

```

2. Crea la base de datos `Pasaporte_Cultural` en tu servidor local de PostgreSQL.

## 📦 Instalación y Ejecución

1. **Instalar dependencias**:

   ```
   npm install
   
   ```

2. **Ejecutar la siembra de datos (Seed)**:
   *Crea las tablas necesarias y puebla los datos iniciales de prueba.*

   ```
   npm run seed
   
   ```

3. **Iniciar el servidor en desarrollo**:

   ```
   npm start
   
   ```

## 🧪 Pruebas

Para ejecutar la suite de pruebas automáticas:

```
npm test

```