/**
 * Modelo de datos: Usuario
 * Roles permitidos: 'visitante' o 'editor'
 */

import { ROLES } from '../../core/constants.js';
import { validarEmail, validarRol, validarTexto } from '../../core/validators.js';

export class Usuario {
  /**
   * @param {object} params
   * @param {string|number} params.id
   * @param {string} params.nombre
   * @param {string} params.email
   * @param {string} [params.password] - Contraseña en texto plano o hash
   * @param {string} [params.rol=ROLES.VISITANTE]
   * @param {string} [params.createdAt]
   */
  constructor({
    id,
    nombre,
    email,
    password = '',
    rol = ROLES.VISITANTE,
    createdAt = new Date().toISOString()
  }) {
    this.id = id ? String(id) : undefined;
    this.nombre = validarTexto(nombre, 'nombre', { min: 2, max: 100 });
    this.email = validarEmail(email);
    this.password = password;
    this.rol = validarRol(rol);
    this.createdAt = createdAt;
  }

  esEditor() {
    return this.rol === ROLES.EDITOR;
  }

  esVisitante() {
    return this.rol === ROLES.VISITANTE;
  }

  /**
   * Devuelve la representación pública del usuario (sin datos confidenciales como contraseñas).
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      rol: this.rol,
      createdAt: this.createdAt
    };
  }

  /**
   * Reconstituye una instancia desde persistencia.
   */
  static fromDatabase(row) {
    if (!row) return null;
    return new Usuario({
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      password: row.password,
      rol: row.rol,
      createdAt: row.created_at || row.createdAt
    });
  }
}
