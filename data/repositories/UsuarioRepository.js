/**
 * data/repositories/UsuarioRepository.js
 * 
 * Acceso y persistencia para la entidad Usuario.
 */

import { randomUUID } from 'node:crypto';
import { Usuario } from '../models/Usuario.js';
import { getDatabaseProvider } from '../providers/sqliteProvider.js';

export class UsuarioRepository {
  /**
   * @param {import('../providers/sqliteProvider.js').SqliteProvider} [provider]
   */
  constructor(provider = null) {
    this.provider = provider || getDatabaseProvider();
  }

  /**
   * @param {string} id
   * @returns {Usuario|null}
   */
  buscarPorId(id) {
    if (!id) return null;
    const row = this.provider.get(
      'SELECT id, nombre, email, password, rol, created_at FROM usuarios WHERE id = ?',
      [String(id)]
    );
    return row ? Usuario.fromDatabase(row) : null;
  }

  /**
   * @param {string} email
   * @returns {Usuario|null}
   */
  buscarPorEmail(email) {
    if (!email) return null;
    const row = this.provider.get(
      'SELECT id, nombre, email, password, rol, created_at FROM usuarios WHERE lower(email) = lower(?)',
      [String(email).trim()]
    );
    return row ? Usuario.fromDatabase(row) : null;
  }

  /**
   * Inserta o actualiza un usuario.
   * @param {Usuario} usuario
   * @returns {Usuario}
   */
  guardar(usuario) {
    const id = usuario.id || randomUUID();
    const createdAt = usuario.createdAt || new Date().toISOString();

    this.provider.run(
      `INSERT INTO usuarios (id, nombre, email, password, rol, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         nombre = excluded.nombre,
         email = excluded.email,
         password = excluded.password,
         rol = excluded.rol`,
      [id, usuario.nombre, usuario.email, usuario.password, usuario.rol, createdAt]
    );

    return this.buscarPorId(id);
  }

  /**
   * Lista todos los usuarios.
   * @returns {Usuario[]}
   */
  listar() {
    const rows = this.provider.all(
      'SELECT id, nombre, email, password, rol, created_at FROM usuarios ORDER BY nombre ASC'
    );
    return rows.map((r) => Usuario.fromDatabase(r));
  }

  /**
   * Cuenta total de usuarios registrados.
   * @returns {number}
   */
  contar() {
    const row = this.provider.get('SELECT COUNT(*) as total FROM usuarios');
    return row ? row.total : 0;
  }
}
