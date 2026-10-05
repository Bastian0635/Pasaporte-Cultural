/**
 * data/services/sesionService.js
 * 
 * Servicio central para la autenticación y ciclo de vida de la sesión de usuario con PostgreSQL.
 * Implementa la operación requerida: Sesión.usuarioActual() -> usuario o ausencia de sesión.
 */

import { randomUUID } from 'node:crypto';
import { AuthenticationError, ValidationError } from '../../core/errors.js';
import { validarEmail, validarTexto } from '../../core/validators.js';
import { APP_CONFIG } from '../../core/constants.js';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { SesionRepository } from '../repositories/SesionRepository.js';
import { getDatabaseProvider } from '../providers/postgresProvider.js';

export class SesionService {
  /**
   * @param {object} [repos]
   * @param {UsuarioRepository} [repos.usuarioRepo]
   * @param {SesionRepository} [repos.sesionRepo]
   */
  constructor({ usuarioRepo, sesionRepo } = {}) {
    this.usuarioRepo = usuarioRepo || new UsuarioRepository();
    this.sesionRepo = sesionRepo || new SesionRepository();
  }

  /**
   * Inicia sesión con credenciales de usuario.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ token: string, usuario: object, expiresAt: string }>}
   */
  async iniciarSesion(email, password) {
    const emailLimpio = validarEmail(email);
    const passLimpio = validarTexto(password, 'contraseña', { min: 1, max: 100 });

    const usuario = await this.usuarioRepo.buscarPorEmail(emailLimpio);
    if (!usuario) {
      throw new AuthenticationError('Credenciales incorrectas: correo o contraseña inválidos.');
    }

    // Comprobación de contraseña
    if (usuario.password !== passLimpio) {
      throw new AuthenticationError('Credenciales incorrectas: correo o contraseña inválidos.');
    }

    // Generar token y tiempo de expiración
    const token = randomUUID();
    const duracionMs = APP_CONFIG.SESSION_DURATION_HOURS * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + duracionMs).toISOString();

    await this.sesionRepo.crear({
      token,
      usuarioId: usuario.id,
      expiresAt
    });

    return {
      token,
      usuario: typeof usuario.toJSON === 'function' ? usuario.toJSON() : usuario,
      expiresAt
    };
  }

  /**
   * Cierra la sesión activa revocando el token.
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async cerrarSesion(token) {
    if (!token) return false;
    return await this.sesionRepo.eliminar(token);
  }

  /**
   * Consulta el usuario correspondiente a la sesión actual (o null si no hay sesión válida).
   * @param {string} [token]
   * @returns {Promise<import('../models/Usuario.js').Usuario|null>}
   */
  async usuarioActual(token) {
    if (!token) {
      return null;
    }
    const sesion = await this.sesionRepo.buscarPorToken(token);
    if (!sesion) {
      return null;
    }

    // Si la sesión trae la instancia directa de usuario la retorna; de lo contrario busca en el repositorio por ID
    if (sesion.usuario) {
      return sesion.usuario;
    }

    const usuarioId = sesion.usuarioId || sesion.usuario_id;
    if (!usuarioId) {
      return null;
    }

    return await this.usuarioRepo.obtenerPorId(usuarioId);
  }

  /**
   * Valida estrictamente la existencia de una sesión activa.
   * @param {string} token
   * @returns {Promise<import('../models/Usuario.js').Usuario>}
   */
  async requerirUsuarioActual(token) {
    const usuario = await this.usuarioActual(token);
    if (!usuario) {
      throw new AuthenticationError('Sesión no válida o expirada. Por favor inicie sesión.');
    }
    return usuario;
  }
}

// Instancia singleton compartida
let defaultSesionService = null;

export function getSesionService(provider = null) {
  if (provider) {
    return new SesionService({
      usuarioRepo: new UsuarioRepository(provider),
      sesionRepo: new SesionRepository(provider)
    });
  }
  if (!defaultSesionService) {
    defaultSesionService = new SesionService();
  }
  return defaultSesionService;
}