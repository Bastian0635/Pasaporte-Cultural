/**
 * data/repositories/LugarRepository.js
 * 
 * Acceso y persistencia para la entidad Lugar con PostgreSQL.
 */

import { randomUUID } from 'node:crypto';
import { Lugar } from '../models/Lugar.js';
import { getDatabaseProvider } from '../providers/postgresProvider.js';

export class LugarRepository {
  /**
   * @param {import('../providers/postgresProvider.js').PostgresProvider} [provider]
   */
  constructor(provider = null) {
    this.provider = provider || getDatabaseProvider();
  }

  /**
   * Busca lugares activos aplicando filtros opcionales de texto, categoría y municipio.
   * Regla 1: Solo los lugares activos aparecen en el catálogo.
   * @param {object} [filtros={}]
   * @param {string} [filtros.texto]
   * @param {string} [filtros.categoria]
   * @param {string} [filtros.municipio]
   * @param {boolean} [filtros.soloActivos=true]
   * @returns {Promise<Lugar[]>}
   */
  async buscar({ texto = '', categoria = '', municipio = '', soloActivos = true } = {}) {
    let sql = 'SELECT * FROM lugares WHERE 1=1';
    const params = [];

    if (soloActivos) {
      sql += ' AND activo = 1';
    }

    if (categoria && categoria.trim() !== '') {
      params.push(categoria.trim());
      sql += ` AND lower(categoria) = lower($${params.length})`;
    }

    if (municipio && municipio.trim() !== '') {
      params.push(`%${municipio.trim()}%`);
      sql += ` AND lower(municipio) LIKE lower($${params.length})`;
    }

    if (texto && texto.trim() !== '') {
      const pattern = `%${texto.trim()}%`;
      params.push(pattern);
      const idx1 = params.length;
      params.push(pattern);
      const idx2 = params.length;
      sql += ` AND (lower(nombre) LIKE lower($${idx1}) OR lower(descripcion) LIKE lower($${idx2}))`;
    }

    sql += ' ORDER BY nombre ASC';

    const rows = await this.provider.all(sql, params);
    return rows.map((r) => Lugar.fromDatabase(r));
  }

  /**
   * Obtiene un lugar por su identificador.
   * @param {string} id
   * @returns {Promise<Lugar|null>}
   */
  async obtenerPorId(id) {
    if (!id) return null;
    const row = await this.provider.get('SELECT * FROM lugares WHERE id = $1', [String(id)]);
    return row ? Lugar.fromDatabase(row) : null;
  }

  /**
   * Obtiene un lugar por su código único de registro.
   * @param {string} codigo
   * @returns {Promise<Lugar|null>}
   */
  async obtenerPorCodigo(codigo) {
    if (!codigo) return null;
    const row = await this.provider.get(
      'SELECT * FROM lugares WHERE upper(codigo_registro) = upper($1)',
      [String(codigo).trim()]
    );
    return row ? Lugar.fromDatabase(row) : null;
  }

  /**
   * Guarda o actualiza un lugar de forma atómica e idempotente en PostgreSQL.
   * @param {Lugar} lugar
   * @returns {Promise<Lugar>}
   */
  async guardar(lugar) {
    const id = lugar.id || randomUUID();
    const createdAt = lugar.createdAt || new Date().toISOString();
    const activoInt = lugar.activo ? 1 : 0;

    const sql = `
      INSERT INTO lugares (
        id, nombre, categoria, municipio, direccion, descripcion, horario, imagen, codigo_registro, activo, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        categoria = EXCLUDED.categoria,
        municipio = EXCLUDED.municipio,
        direccion = EXCLUDED.direccion,
        descripcion = EXCLUDED.descripcion,
        horario = EXCLUDED.horario,
        imagen = EXCLUDED.imagen,
        codigo_registro = EXCLUDED.codigo_registro,
        activo = EXCLUDED.activo
      RETURNING *;
    `;

    const params = [
      id,
      lugar.nombre,
      lugar.categoria,
      lugar.municipio,
      lugar.direccion,
      lugar.descripcion,
      lugar.horario,
      lugar.imagen,
      lugar.codigoRegistro,
      activoInt,
      createdAt
    ];

    const row = await this.provider.get(sql, params);
    return row ? Lugar.fromDatabase(row) : (await this.obtenerPorId(id)) || lugar;
  }

  /**
   * Desactiva un lugar por ID (activo = 0).
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async desactivar(id) {
    const res = await this.provider.run('UPDATE lugares SET activo = 0 WHERE id = $1', [String(id)]);
    return res && (res.changes > 0 || res.rowCount > 0);
  }

  /**
   * Activa un lugar por ID (activo = 1).
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async activar(id) {
    const res = await this.provider.run('UPDATE lugares SET activo = 1 WHERE id = $1', [String(id)]);
    return res && (res.changes > 0 || res.rowCount > 0);
  }

  /**
   * Cuenta total de lugares registrados.
   * @returns {Promise<number>}
   */
  async contar() {
    const row = await this.provider.get('SELECT COUNT(*) as total FROM lugares');
    return row ? parseInt(row.total, 10) : 0;
  }

  /**
   * Lista todos los lugares (activos e inactivos, útil para administración).
   * @returns {Promise<Lugar[]>}
   */
  async listarTodos() {
    const rows = await this.provider.all('SELECT * FROM lugares ORDER BY nombre ASC');
    return rows.map((r) => Lugar.fromDatabase(r));
  }
}