/**
 * data/repositories/VisitaRepository.js
 * 
 * Acceso y persistencia para la entidad Visita.
 */

import { randomUUID } from 'node:crypto';
import { Visita } from '../models/Visita.js';
import { getDatabaseProvider } from '../providers/sqliteProvider.js';
import { obtenerFechaString } from '../../core/dateUtils.js';

export class VisitaRepository {
  /**
   * @param {import('../providers/sqliteProvider.js').SqliteProvider} [provider]
   */
  constructor(provider = null) {
    this.provider = provider || getDatabaseProvider();
  }

  /**
   * Busca si ya existe una visita de un usuario a un lugar en un mismo día.
   * Regla 3: Un usuario puede registrar como máximo una visita por lugar en un mismo día.
   * @param {string} usuarioId
   * @param {string} lugarId
   * @param {string} dia - Formato YYYY-MM-DD
   * @returns {Visita|null}
   */
  buscarPorUsuarioLugarYDia(usuarioId, lugarId, dia) {
    const row = this.provider.get(
      `SELECT v.*, l.nombre as lugar_nombre, l.categoria as lugar_categoria, l.municipio as lugar_municipio, l.imagen as lugar_imagen
       FROM visitas v
       JOIN lugares l ON v.lugar_id = l.id
       WHERE v.usuario_id = ? AND v.lugar_id = ? AND v.dia = ?`,
      [String(usuarioId), String(lugarId), String(dia)]
    );
    return row ? Visita.fromDatabase(row) : null;
  }

  /**
   * Guarda una nueva visita.
   * @param {Visita} visita
   * @returns {Visita}
   */
  guardar(visita) {
    const id = visita.id || randomUUID();
    const dia = visita.obtenerDia();
    const createdAt = new Date().toISOString();

    this.provider.run(
      `INSERT INTO visitas (id, usuario_id, lugar_id, fecha_hora, dia, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, visita.usuarioId, visita.lugarId, visita.fechaHora, dia, createdAt]
    );

    return this.obtenerPorId(id);
  }

  /**
   * Obtiene una visita por ID con detalles del lugar.
   * @param {string} id
   * @returns {Visita|null}
   */
  obtenerPorId(id) {
    if (!id) return null;
    const row = this.provider.get(
      `SELECT v.*, l.nombre as lugar_nombre, l.categoria as lugar_categoria, l.municipio as lugar_municipio, l.imagen as lugar_imagen
       FROM visitas v
       JOIN lugares l ON v.lugar_id = l.id
       WHERE v.id = ?`,
      [String(id)]
    );
    return row ? Visita.fromDatabase(row) : null;
  }

  /**
   * Lista las visitas propias en orden de fecha descendente, con filtro opcional por mes (YYYY-MM).
   * @param {string} usuarioId
   * @param {string} [mes] - Filtro opcional en formato YYYY-MM
   * @returns {Visita[]}
   */
  listarPorUsuario(usuarioId, mes = null) {
    let sql = `
      SELECT v.*, l.nombre as lugar_nombre, l.categoria as lugar_categoria, l.municipio as lugar_municipio, l.imagen as lugar_imagen
      FROM visitas v
      JOIN lugares l ON v.lugar_id = l.id
      WHERE v.usuario_id = ?
    `;
    const params = [String(usuarioId)];

    if (mes && mes.trim() !== '') {
      sql += ' AND v.dia LIKE ?';
      params.push(`${mes.trim()}%`);
    }

    sql += ' ORDER BY v.fecha_hora DESC, v.created_at DESC';

    const rows = this.provider.all(sql, params);
    return rows.map((r) => Visita.fromDatabase(r));
  }

  /**
   * Obtiene la lista de IDs de lugares distintos visitados por un usuario,
   * opcionalmente filtrados por categoría y rango de fechas (para el cálculo de retos).
   * @param {string} usuarioId
   * @param {object} [filtros={}]
   * @param {string} [filtros.categoria]
   * @param {string} [filtros.fechaInicio]
   * @param {string} [filtros.fechaFin]
   * @returns {string[]} Lista de IDs únicos de lugares visitados
   */
  obtenerLugaresDistintosVisitados(usuarioId, { categoria = null, fechaInicio = null, fechaFin = null } = {}) {
    let sql = `
      SELECT DISTINCT v.lugar_id
      FROM visitas v
      JOIN lugares l ON v.lugar_id = l.id
      WHERE v.usuario_id = ?
    `;
    const params = [String(usuarioId)];

    if (categoria) {
      sql += ' AND lower(l.categoria) = lower(?)';
      params.push(categoria);
    }

    if (fechaInicio) {
      sql += ' AND v.dia >= ?';
      params.push(obtenerFechaString(fechaInicio));
    }

    if (fechaFin) {
      sql += ' AND v.dia <= ?';
      params.push(obtenerFechaString(fechaFin));
    }

    const rows = this.provider.all(sql, params);
    return rows.map((r) => String(r.lugar_id));
  }

  /**
   * Cuenta cantidad de visitas totales de un usuario.
   * @param {string} usuarioId
   * @returns {number}
   */
  contarPorUsuario(usuarioId) {
    const row = this.provider.get('SELECT COUNT(*) as total FROM visitas WHERE usuario_id = ?', [String(usuarioId)]);
    return row ? row.total : 0;
  }

  /**
   * Cuenta cantidad de lugares distintos visitados por un usuario.
   * @param {string} usuarioId
   * @returns {number}
   */
  contarLugaresDistintos(usuarioId) {
    const row = this.provider.get('SELECT COUNT(DISTINCT lugar_id) as total FROM visitas WHERE usuario_id = ?', [
      String(usuarioId)
    ]);
    return row ? row.total : 0;
  }
}
