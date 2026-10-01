/**
 * Modelo de datos: Lugar
 * Representa espacios culturales (museos, galerías, centros culturales).
 */

import { validarCategoria, validarCodigoRegistro, validarTexto } from '../../core/validators.js';

export class Lugar {
  /**
   * @param {object} params
   * @param {string|number} [params.id]
   * @param {string} params.nombre
   * @param {string} params.categoria
   * @param {string} params.municipio
   * @param {string} params.direccion
   * @param {string} params.descripcion
   * @param {string} params.horario
   * @param {string} [params.imagen]
   * @param {string} params.codigoRegistro
   * @param {boolean} [params.activo=true]
   * @param {string} [params.createdAt]
   */
  constructor({
    id,
    nombre,
    categoria,
    municipio,
    direccion,
    descripcion,
    horario,
    imagen = '',
    codigoRegistro,
    activo = true,
    createdAt = new Date().toISOString()
  }) {
    this.id = id ? String(id) : undefined;
    this.nombre = validarTexto(nombre, 'nombre', { min: 2, max: 150 });
    this.categoria = validarCategoria(categoria);
    this.municipio = validarTexto(municipio, 'municipio', { min: 2, max: 100 });
    this.direccion = validarTexto(direccion, 'dirección', { min: 3, max: 200 });
    this.descripcion = validarTexto(descripcion, 'descripción', { min: 5, max: 2000 });
    this.horario = validarTexto(horario, 'horario', { min: 3, max: 150 });
    this.imagen = imagen ? String(imagen).trim() : '';
    this.codigoRegistro = validarCodigoRegistro(codigoRegistro);
    this.activo = Boolean(activo);
    this.createdAt = createdAt;
  }

  estaActivo() {
    return this.activo === true;
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
      nombre: this.nombre,
      categoria: this.categoria,
      municipio: this.municipio,
      direccion: this.direccion,
      descripcion: this.descripcion,
      horario: this.horario,
      imagen: this.imagen,
      codigoRegistro: this.codigoRegistro,
      activo: this.activo,
      createdAt: this.createdAt
    };
  }

  static fromDatabase(row) {
    if (!row) return null;
    return new Lugar({
      id: row.id,
      nombre: row.nombre,
      categoria: row.categoria,
      municipio: row.municipio,
      direccion: row.direccion,
      descripcion: row.descripcion,
      horario: row.horario,
      imagen: row.imagen,
      codigoRegistro: row.codigo_registro || row.codigoRegistro,
      activo: row.activo === 1 || row.activo === true || row.activo === '1',
      createdAt: row.created_at || row.createdAt
    });
  }
}
