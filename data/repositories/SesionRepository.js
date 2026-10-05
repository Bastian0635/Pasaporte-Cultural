/**
 * data/repositories/SesionRepository.js
 * 
 * Persistencia y gestión de sesiones activas de usuarios con PostgreSQL.
 */

import { Usuario } from '../models/Usuario.js';
import { getDatabaseProvider } from '../providers/postgresProvider.js';

export class SesionRepository {
  /**
   * @param {import('../providers/postgresProvider.js').PostgresProvider} [provider]
   */
  constructor(provider = null) {
    this.provider = provider || getDatabaseProvider();
  }

  /**
   * Guarda una nueva sesión activa.
   * @param {object} params
   * @param {string} params.token
   * @param {string} params.usuarioId
   * @param {string} params.expiresAt
   * @returns {Promise<object>}
   */
  async crear({ token, usuarioId, expiresAt }) {
    const createdAt = new Date().toISOString();
    await this.provider.run(
      `INSERT INTO sesiones (token, usuario_id, created_at, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [token, String(usuarioId), createdAt, expiresAt]
    );

    return { token, usuarioId, createdAt, expiresAt };
  }

  /**
   * Busca una sesión válida por token, junto con el usuario asociado.
   * Si la sesión ha expirado, no se retorna.
   * @param {string} token
   * @returns {Promise<{ token: string, usuario: Usuario, expiresAt: string }|null>}
   */
  async buscarPorToken(token) {
    if (!token) return null;
    const ahoraIso = new Date().toISOString();

    const row = await this.provider.get(
      `SELECT s.token, s.expires_at, s.created_at,
              u.id as u_id, u.nombre as u_nombre, u.email as u_email,
              u.password as u_password, u.rol as u_rol, u.created_at as u_created_at
       FROM sesiones s
       JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.token = $1 AND s.expires_at > $2`,
      [token, ahoraIso]
    );

    if (!row) return null;

    const usuario = new Usuario({
      id: row.u_id,
      nombre: row.u_nombre,
      email: row.u_email,
      password: row.u_password,
      rol: row.u_rol,
      createdAt: row.u_created_at
    });

    return {
      token: row.token,
      usuario,
      expiresAt: row.expires_at,
      createdAt: row.created_at
    };
  }

  /**
   * Elimina una sesión por token (Logout).
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async eliminar(token) {
    if (!token) return false;
    const res = await this.provider.run('DELETE FROM sesiones WHERE token = $1', [token]);
    return res.changes > 0;
  }

  /**
   * Elimina todas las sesiones de un usuario.
   * @param {string} usuarioId
   */
  async eliminarPorUsuario(usuarioId) {
    await this.provider.run('DELETE FROM sesiones WHERE usuario_id = $1', [String(usuarioId)]);
  }

  /**
   * Elimina registros de sesiones vencidas.
   */
  async limpiarExpiradas() {
    const ahoraIso = new Date().toISOString();
    await this.provider.run('DELETE FROM sesiones WHERE expires_at <= $1', [ahoraIso]);
  }
}
