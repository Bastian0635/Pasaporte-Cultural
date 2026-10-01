/**
 * data/repositories/LugarRepository.js
 * 
 * Acceso y persistencia para la entidad Lugar.
 */

import { randomUUID } from 'node:crypto';
import { Lugar } from '../models/Lugar.js';
import { getDatabaseProvider } from '../providers/sqliteProvider.js';

export class LugarRepository {
  /**
   * @param {import('../providers/sqliteProvider.js').SqliteProvider} [provider]
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
   * @returns {Lugar[]}
   */
  buscar({ texto = '', categoria = '', municipio = '', soloActivos = true } = {}) {
    let sql = 'SELECT * FROM lugares WHERE 1=1';
    const params = [];

    if (soloActivos) {
      sql += ' AND activo = 1';
    }

    if (categoria && categoria.trim() !== '') {
      sql += ' AND lower(categoria) = lower(?)';
      params.push(categoria.trim());
    }

    if (municipio && municipio.trim() !== '') {
      sql += ' AND lower(municipio) LIKE lower(?)';
      params.push(`%${municipio.trim()}%`);
    }

    if (texto && texto.trim() !== '') {
      sql += ' AND (lower(nombre) LIKE lower(?) OR lower(descripcion) LIKE lower(?))';
      const pattern = `%${texto.trim()}%`;
      params.push(pattern, pattern);
    }

    sql += ' ORDER BY nombre ASC';

    const rows = this.provider.all(sql, params);
    return rows.map((r) => Lugar.fromDatabase(r));
  }

  /**
   * Obtiene un lugar por su identificador.
   * @param {string} id
   * @returns {Lugar|null}
   */
  obtenerPorId(id) {
    if (!id) return null;
    const row = this.provider.get('SELECT * FROM lugares WHERE id = ?', [String(id)]);
    return row ? Lugar.fromDatabase(row) : null;
  }

  /**
   * Obtiene un lugar por su código único de registro.
   * @param {string} codigo
   * @returns {Lugar|null}
   */
  obtenerPorCodigo(codigo) {
    if (!codigo) return null;
    const row = this.provider.get(
      'SELECT * FROM lugares WHERE upper(codigo_registro) = upper(?)',
      [String(codigo).trim()]
    );
    return row ? Lugar.fromDatabase(row) : null;
  }

  /**
   * Guarda o actualiza un lugar.
   * @param {Lugar} lugar
   * @returns {Lugar}
   */
  guardar(lugar) {
    const id = lugar.id || randomUUID();
    const createdAt = lugar.createdAt || new Date().toISOString();
    const activoInt = lugar.activo ? 1 : 0;

    this.provider.run(
      `INSERT INTO lugares (
        id, nombre, categoria, municipio, direccion, descripcion, horario, imagen, codigo_registro, activo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        nombre = excluded.nombre,
        categoria = excluded.categoria,
        municipio = excluded.municipio,
        direccion = excluded.direccion,
        descripcion = excluded.descripcion,
        horario = excluded.horario,
        imagen = excluded.imagen,
        codigo_registro = excluded.codigo_registro,
        activo = excluded.activo`,
      [
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
      ]
    );

    return this.obtenerPorId(id);
  }

  /**
   * Desactiva un lugar por ID (activo = 0).
   * @param {string} id
   * @returns {boolean}
   */
  desactivar(id) {
    const res = this.provider.run('UPDATE lugares SET activo = 0 WHERE id = ?', [String(id)]);
    return res.changes > 0;
  }

  /**
   * Activa un lugar por ID (activo = 1).
   * @param {string} id
   * @returns {boolean}
   */
  activar(id) {
    const res = this.provider.run('UPDATE lugares SET activo = 1 WHERE id = ?', [String(id)]);
    return res.changes > 0;
  }

  /**
   * Cuenta total de lugares registrados.
   * @returns {number}
   */
  contar() {
    const row = this.provider.get('SELECT COUNT(*) as total FROM lugares');
    return row ? row.total : 0;
  }

  /**
   * Lista todos los lugares (activos e inactivos, útil para administración).
   * @returns {Lugar[]}
   */
  listarTodos() {
    const rows = this.provider.all('SELECT * FROM lugares ORDER BY nombre ASC');
    return rows.map((r) => Lugar.fromDatabase(r));
  }
}
