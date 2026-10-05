/**
 * data/repositories/VisitaRepository.js
 * 
 * Acceso y persistencia para la entidad Visita con PostgreSQL.
 */

import { randomUUID } from 'node:crypto';
import { Visita } from '../models/Visita.js';
import { getDatabaseProvider } from '../providers/postgresProvider.js';
import { obtenerFechaString } from '../../core/dateUtils.js';

export class VisitaRepository {
  /**
   * @param {import('../providers/postgresProvider.js').PostgresProvider} [provider]
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
   * @returns {Promise<Visita|null>}
   */
  async buscarPorUsuarioLugarYDia(usuarioId, lugarId, dia) {
    const row = await this.provider.get(
      `SELECT v.*, l.nombre as lugar_nombre, l.categoria as lugar_categoria, l.municipio as lugar_municipio, l.imagen as lugar_imagen
       FROM visitas v
       JOIN lugares l ON v.lugar_id = l.id
       WHERE v.usuario_id = $1 AND v.lugar_id = $2 AND v.dia = $3`,
      [String(usuarioId), String(lugarId), String(dia)]
    );
    return row ? Visita.fromDatabase(row) : null;
  }

  /**
   * Guarda una nueva visita.
   * @param {Visita} visita
   * @returns {Promise<Visita>}
   */
  async guardar(visita) {
    const id = visita.id || randomUUID();
    const dia = visita.obtenerDia();
    const fechaHora = visita.fechaHora || new Date().toISOString();
    const createdAt = new Date().toISOString();

    await this.provider.run(
      `INSERT INTO visitas (id, usuario_id, lugar_id, fecha_hora, dia, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, visita.usuarioId, visita.lugarId, fechaHora, dia, createdAt]
    );

    // Mantener sincronizada la tabla visits para asegurar compatibilidad total con el esquema requerido
    try {
      await this.provider.run(
        `INSERT INTO visits (id, user_id, place_id, timestamp, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [id, visita.usuarioId, visita.lugarId, fechaHora, createdAt]
      );
    } catch {
      // Ignorar si la tabla visits no está presente en algún entorno
    }

    return await this.obtenerPorId(id);
  }

  /**
   * Obtiene una visita por ID con detalles del lugar.
   * @param {string} id
   * @returns {Promise<Visita|null>}
   */
  async obtenerPorId(id) {
    if (!id) return null;
    const row = await this.provider.get(
      `SELECT v.*, l.nombre as lugar_nombre, l.categoria as lugar_categoria, l.municipio as lugar_municipio, l.imagen as lugar_imagen
       FROM visitas v
       JOIN lugares l ON v.lugar_id = l.id
       WHERE v.id = $1`,
      [String(id)]
    );
    return row ? Visita.fromDatabase(row) : null;
  }

  /**
   * Lista las visitas propias en orden de fecha descendente, con filtro opcional por mes (YYYY-MM).
   * @param {string} usuarioId
   * @param {string} [mes] - Filtro opcional en formato YYYY-MM
   * @returns {Promise<Visita[]>}
   */
  async listarPorUsuario(usuarioId, mes = null) {
    let sql = `
      SELECT v.*, l.nombre as lugar_nombre, l.categoria as lugar_categoria, l.municipio as lugar_municipio, l.imagen as lugar_imagen
      FROM visitas v
      JOIN lugares l ON v.lugar_id = l.id
      WHERE v.usuario_id = $1
    `;
    const params = [String(usuarioId)];

    if (mes && mes.trim() !== '') {
      params.push(`${mes.trim()}%`);
      sql += ` AND CAST(v.dia AS TEXT) LIKE $${params.length}`;
    }

    sql += ' ORDER BY v.fecha_hora DESC, v.created_at DESC';

    const rows = await this.provider.all(sql, params);
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
   * @returns {Promise<string[]>} Lista de IDs únicos de lugares visitados
   */
  async obtenerLugaresDistintosVisitados(usuarioId, { categoria = null, fechaInicio = null, fechaFin = null } = {}) {
    let sql = `
      SELECT DISTINCT v.lugar_id
      FROM visitas v
      JOIN lugares l ON v.lugar_id = l.id
      WHERE v.usuario_id = $1
    `;
    const params = [String(usuarioId)];

    if (categoria) {
      params.push(categoria);
      sql += ` AND lower(l.categoria) = lower($${params.length})`;
    }

    if (fechaInicio) {
      params.push(obtenerFechaString(fechaInicio));
      sql += ` AND v.dia >= $${params.length}`;
    }

    if (fechaFin) {
      params.push(obtenerFechaString(fechaFin));
      sql += ` AND v.dia <= $${params.length}`;
    }

    const rows = await this.provider.all(sql, params);
    return rows.map((r) => String(r.lugar_id));
  }

  /**
   * Cuenta cantidad de visitas totales de un usuario.
   * @param {string} usuarioId
   * @returns {Promise<number>}
   */
  async contarPorUsuario(usuarioId) {
    const row = await this.provider.get('SELECT COUNT(*) as total FROM visitas WHERE usuario_id = $1', [String(usuarioId)]);
    return row ? parseInt(row.total, 10) : 0;
  }

  /**
   * Cuenta cantidad de lugares distintos visitados por un usuario.
   * @param {string} usuarioId
   * @returns {Promise<number>}
   */
  async contarLugaresDistintos(usuarioId) {
    const row = await this.provider.get('SELECT COUNT(DISTINCT lugar_id) as total FROM visitas WHERE usuario_id = $1', [
      String(usuarioId)
    ]);
    return row ? parseInt(row.total, 10) : 0;
  }
}
