/**
 * data/providers/postgresProvider.js
 * 
 * Proveedor de almacenamiento concreto basado en PostgreSQL (cliente pg / Pool).
 * Maneja la inicialización del esquema de base de datos, ejecución de sentencias asíncronas y pools de conexión.
 * No contiene reglas de negocio ni lógica de presentación.
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export class PostgresProvider {
  /**
   * @param {string|object} [configOrUrl=null] - Cadena de conexión URI o configuración de pg.Pool.
   */
  constructor(configOrUrl = null) {
    let poolConfig = {};

    if (typeof configOrUrl === 'string') {
      poolConfig = { connectionString: configOrUrl };
    } else if (configOrUrl && typeof configOrUrl === 'object') {
      poolConfig = configOrUrl;
    } else {
      const connStr = process.env.DATABASE_URL || 'postgresql://postgres:bash635@localhost:5432/Pasaporte_Cultural?schema=public';
      poolConfig = { connectionString: connStr };
    }

    this.connectionString = poolConfig.connectionString || null;
    this.pool = new Pool(poolConfig);

    // Manejar errores de clientes ociosos en el pool
    this.pool.on('error', (err) => {
      console.error('Error inesperado en cliente inactivo de PostgreSQL:', err.message);
    });
  }

  /**
   * Verifica la conexión a PostgreSQL.
   * @returns {Promise<boolean>}
   */
  async verificarConexion() {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  }

  /**
   * Ejecuta una consulta SQL parametrizada ($1, $2, ...).
   * @param {string} text
   * @param {any[]} [params=[]]
   * @returns {Promise<import('pg').QueryResult>}
   */
  async query(text, params = []) {
    return await this.pool.query(text, params);
  }

  /**
   * Ejecuta una consulta que devuelve una sola fila.
   * @param {string} sql
   * @param {any[]} [params=[]]
   * @returns {Promise<object|null>}
   */
  async get(sql, params = []) {
    const res = await this.pool.query(sql, params);
    return res.rows && res.rows.length > 0 ? res.rows[0] : null;
  }

  /**
   * Ejecuta una consulta que devuelve un array de filas.
   * @param {string} sql
   * @param {any[]} [params=[]]
   * @returns {Promise<any[]>}
   */
  async all(sql, params = []) {
    const res = await this.pool.query(sql, params);
    return res.rows || [];
  }

  /**
   * Ejecuta una sentencia de inserción, actualización o eliminación.
   * @param {string} sql
   * @param {any[]} [params=[]]
   * @returns {Promise<{ changes: number, rowCount: number, rows: any[] }>}
   */
  async run(sql, params = []) {
    const res = await this.pool.query(sql, params);
    return {
      changes: res.rowCount ?? 0,
      rowCount: res.rowCount ?? 0,
      rows: res.rows || []
    };
  }

  /**
   * Ejecuta un script SQL directo.
   * @param {string} sql
   * @returns {Promise<any>}
   */
  async exec(sql) {
    return await this.pool.query(sql);
  }

  /**
   * Crea las tablas e índices necesarios si no existen.
   */
  async inicializarTablas() {
    // 1. Usuarios
    await this.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(64) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Lugares
    await this.query(`
      CREATE TABLE IF NOT EXISTS lugares (
        id VARCHAR(64) PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        municipio VARCHAR(100) NOT NULL,
        direccion VARCHAR(200) NOT NULL,
        descripcion TEXT NOT NULL,
        horario VARCHAR(150) NOT NULL,
        imagen TEXT,
        codigo_registro VARCHAR(50) NOT NULL UNIQUE,
        activo INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Visitas
    await this.query(`
      CREATE TABLE IF NOT EXISTS visitas (
        id VARCHAR(64) PRIMARY KEY,
        usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        lugar_id VARCHAR(64) NOT NULL REFERENCES lugares(id) ON DELETE RESTRICT,
        fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        dia DATE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_visitas_usuario_dia ON visitas(usuario_id, lugar_id, dia);
      CREATE INDEX IF NOT EXISTS idx_visitas_usuario_fecha ON visitas(usuario_id, fecha_hora DESC);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_visita ON visitas (usuario_id, lugar_id, (fecha_hora::date));
    `);

    // 4. Tabla visits e índice exigido explícitamente:
    // "CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_visit ON visits (user_id, place_id, (timestamp::date));"
    await this.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        place_id VARCHAR(64) NOT NULL REFERENCES lugares(id) ON DELETE RESTRICT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_visit ON visits (user_id, place_id, (timestamp::date));
    `);

    // 5. Favoritos
    await this.query(`
      CREATE TABLE IF NOT EXISTS favoritos (
        id VARCHAR(64) PRIMARY KEY,
        usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        lugar_id VARCHAR(64) NOT NULL REFERENCES lugares(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (usuario_id, lugar_id)
      );
    `);

    // 6. Retos
    await this.query(`
      CREATE TABLE IF NOT EXISTS retos (
        id VARCHAR(64) PRIMARY KEY,
        titulo VARCHAR(150) NOT NULL,
        descripcion TEXT NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        meta INTEGER NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        activo INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Sesiones
    await this.query(`
      CREATE TABLE IF NOT EXISTS sesiones (
        token VARCHAR(128) PRIMARY KEY,
        usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones(token);
    `);
  }

  /**
   * Cierra el pool de conexiones a la base de datos.
   */
  async close() {
    await this.pool.end();
  }
}

// Instancia singleton por defecto para la aplicación
let defaultProvider = null;

export function getDatabaseProvider(configOrUrl = null) {
  if (configOrUrl) {
    return new PostgresProvider(configOrUrl);
  }
  if (!defaultProvider) {
    defaultProvider = new PostgresProvider();
  }
  return defaultProvider;
}

export async function resetDefaultProvider() {
  if (defaultProvider) {
    try {
      await defaultProvider.close();
    } catch {
      // ignore
    }
    defaultProvider = null;
  }
}
