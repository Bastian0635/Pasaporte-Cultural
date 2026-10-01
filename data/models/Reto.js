/**
 * Modelo de datos: Reto
 * Define desafíos culturales temáticos limitados en el tiempo.
 */

import { validarCategoria, validarMetaReto, validarRangoFechasReto, validarTexto } from '../../core/validators.js';
import { estaEnRango, obtenerFechaString } from '../../core/dateUtils.js';

export class Reto {
  /**
   * @param {object} params
   * @param {string|number} [params.id]
   * @param {string} params.titulo
   * @param {string} params.descripcion
   * @param {string} params.categoria
   * @param {number|string} params.meta
   * @param {string|Date} params.fechaInicio - Formato YYYY-MM-DD
   * @param {string|Date} params.fechaFin - Formato YYYY-MM-DD
   * @param {boolean} [params.activo=true]
   * @param {string} [params.createdAt]
   */
  constructor({
    id,
    titulo,
    descripcion,
    categoria,
    meta,
    fechaInicio,
    fechaFin,
    activo = true,
    createdAt = new Date().toISOString()
  }) {
    this.id = id ? String(id) : undefined;
    this.titulo = validarTexto(titulo, 'título', { min: 3, max: 150 });
    this.descripcion = validarTexto(descripcion, 'descripción', { min: 5, max: 1000 });
    this.categoria = validarCategoria(categoria);
    this.meta = validarMetaReto(meta);

    const { fechaInicio: fIni, fechaFin: fFin } = validarRangoFechasReto(fechaInicio, fechaFin);
    this.fechaInicio = fIni;
    this.fechaFin = fFin;

    this.activo = Boolean(activo);
    this.createdAt = createdAt;
  }

  estaActivo() {
    return this.activo === true;
  }

  /**
   * Comprueba si el reto está dentro de su ventana temporal de vigencia respecto a hoy.
   */
  estaVigenteTemporalmente(fechaReferencia = new Date()) {
    return estaEnRango(fechaReferencia, this.fechaInicio, this.fechaFin);
  }

  desactivar() {
    this.activo = false;
  }

  activar() {
    this.activo = true;
  }

  toJSON() {
    return {
      id: this.id,
      titulo: this.titulo,
      descripcion: this.descripcion,
      categoria: this.categoria,
      meta: this.meta,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      activo: this.activo,
      createdAt: this.createdAt
    };
  }

  static fromDatabase(row) {
    if (!row) return null;
    return new Reto({
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      categoria: row.categoria,
      meta: row.meta,
      fechaInicio: row.fecha_inicio || row.fechaInicio,
      fechaFin: row.fecha_fin || row.fechaFin,
      activo: row.activo === 1 || row.activo === true || row.activo === '1',
      createdAt: row.created_at || row.createdAt
    });
  }
}
