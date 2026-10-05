/**
 * data/repositories/UsuarioRepository.js
 */

import { randomUUID } from 'node:crypto';
import { Usuario } from '../models/Usuario.js';
import { getDatabaseProvider } from '../providers/postgresProvider.js';

export class UsuarioRepository {
  /**
   * @param {import('../providers/postgresProvider.js').PostgresProvider} [provider]
   */
  constructor(provider = null) {
    this.provider = provider || getDatabaseProvider();
  }

  /**
   * Obtiene un usuario por ID.
   * @param {string} id
   * @returns {Promise<Usuario|null>}
   */
  async obtenerPorId(id) {
    if (!id) return null;
    const row = await this.provider.get('SELECT * FROM usuarios WHERE id = $1', [String(id)]);
    return row ? Usuario.fromDatabase(row) : null;
  }

  /**
   * Busca un usuario por email (insensible a mayúsculas/minúsculas).
   * @param {string} email
   * @returns {Promise<Usuario|null>}
   */
  async buscarPorEmail(email) {
    if (!email) return null;
    const row = await this.provider.get(
      'SELECT * FROM usuarios WHERE lower(email) = lower($1)',
      [String(email).trim()]
    );
    return row ? Usuario.fromDatabase(row) : null;
  }

  /**
   * Guarda o actualiza un usuario de forma idempotente.
   * @param {Usuario} usuario
   * @returns {Promise<Usuario>}
   */
  async guardar(usuario) {
    const id = usuario.id || randomUUID();
    const createdAt = usuario.createdAt || new Date().toISOString();

    const sql = `
      INSERT INTO usuarios (id, nombre, email, password, rol, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        rol = EXCLUDED.rol
      RETURNING *;
    `;

    const params = [
      id,
      usuario.nombre,
      usuario.email ? usuario.email.trim() : usuario.email,
      usuario.password,
      usuario.rol,
      createdAt
    ];

    const row = await this.provider.get(sql, params);
    return row ? Usuario.fromDatabase(row) : (await this.obtenerPorId(id)) || usuario;
  }

  /**
   * Cuenta el total de usuarios.
   * @returns {Promise<number>}
   */
  async contar() {
    const row = await this.provider.get('SELECT COUNT(*) as total FROM usuarios');
    return row ? parseInt(row.total, 10) : 0;
  }
}