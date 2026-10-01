/**
 * data/providers/sqliteProvider.js
 * 
 * Proveedor de almacenamiento concreto basado en SQLite nativo (node:sqlite DatabaseSync).
 * Maneja la inicialización del esquema de base de datos, ejecución de sentencias y transacciones.
 * No contiene reglas de negocio ni lógica de presentación.
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SqliteProvider {
  /**
   * @param {string} [dbPath] - Ruta al archivo .db o ':memory:' para pruebas en memoria.
   */
  constructor(dbPath = null) {
    if (!dbPath) {
      const storageDir = path.resolve(__dirname, '../storage');
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
      this.dbPath = path.join(storageDir, 'pasaporte_cultural.db');
    } else {
      this.dbPath = dbPath;
      if (dbPath !== ':memory:') {
        const parentDir = path.dirname(path.resolve(dbPath));
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }
      }
    }

    this.db = new DatabaseSync(this.dbPath);
    this._habilitarPragmas();
    this._crearTablas();
  }

  _habilitarPragmas() {
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.db.exec('PRAGMA journal_mode = WAL;');
  }

  _crearTablas() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password TEXT NOT NULL,
        rol TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lugares (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        categoria TEXT NOT NULL,
        municipio TEXT NOT NULL,
        direccion TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        horario TEXT NOT NULL,
        imagen TEXT,
        codigo_registro TEXT NOT NULL UNIQUE COLLATE NOCASE,
        activo INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS visitas (
        id TEXT PRIMARY KEY,
        usuario_id TEXT NOT NULL,
        lugar_id TEXT NOT NULL,
        fecha_hora TEXT NOT NULL,
        dia TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE RESTRICT
      );

      CREATE INDEX IF NOT EXISTS idx_visitas_usuario_dia ON visitas(usuario_id, lugar_id, dia);
      CREATE INDEX IF NOT EXISTS idx_visitas_usuario_fecha ON visitas(usuario_id, fecha_hora DESC);

      CREATE TABLE IF NOT EXISTS favoritos (
        id TEXT PRIMARY KEY,
        usuario_id TEXT NOT NULL,
        lugar_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE (usuario_id, lugar_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS retos (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        categoria TEXT NOT NULL,
        meta INTEGER NOT NULL,
        fecha_inicio TEXT NOT NULL,
        fecha_fin TEXT NOT NULL,
        activo INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sesiones (
        token TEXT PRIMARY KEY,
        usuario_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones(token);
    `);
  }

  /**
   * Ejecuta una consulta que devuelve una sola fila.
   * @param {string} sql
   * @param {any[]} params
   * @returns {object|null}
   */
  get(sql, params = []) {
    const stmt = this.db.prepare(sql);
    return stmt.get(...params) || null;
  }

  /**
   * Ejecuta una consulta que devuelve un array de filas.
   * @param {string} sql
   * @param {any[]} params
   * @returns {any[]}
   */
  all(sql, params = []) {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  /**
   * Ejecuta una sentencia de inserción, actualización o eliminación.
   * @param {string} sql
   * @param {any[]} params
   * @returns {{ changes: number, lastInsertRowid: number|bigint }}
   */
  run(sql, params = []) {
    const stmt = this.db.prepare(sql);
    return stmt.run(...params);
  }

  /**
   * Ejecuta un script SQL directo.
   * @param {string} sql
   */
  exec(sql) {
    return this.db.exec(sql);
  }

  /**
   * Cierra la base de datos.
   */
  close() {
    this.db.close();
  }
}

// Instancia singleton por defecto para la aplicación
let defaultProvider = null;

export function getDatabaseProvider(dbPath = null) {
  if (dbPath) {
    return new SqliteProvider(dbPath);
  }
  if (!defaultProvider) {
    defaultProvider = new SqliteProvider();
  }
  return defaultProvider;
}

export function resetDefaultProvider() {
  if (defaultProvider) {
    try {
      defaultProvider.close();
    } catch {
      // ignore
    }
    defaultProvider = null;
  }
}
