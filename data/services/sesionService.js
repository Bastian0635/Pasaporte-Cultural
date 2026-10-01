/**
 * data/services/sesionService.js
 * 
 * Servicio central para la autenticación y ciclo de vida de la sesión de usuario.
 * Implementa la operación requerida: Sesión.usuarioActual() -> usuario o ausencia de sesión.
 */

import { randomUUID } from 'node:crypto';
import { AuthenticationError, ValidationError } from '../../core/errors.js';
import { validarEmail, validarTexto } from '../../core/validators.js';
import { APP_CONFIG } from '../../core/constants.js';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { SesionRepository } from '../repositories/SesionRepository.js';

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
   * @returns {{ token: string, usuario: object, expiresAt: string }}
   */
  iniciarSesion(email, password) {
    const emailLimpio = validarEmail(email);
    const passLimpio = validarTexto(password, 'contraseña', { min: 1, max: 100 });

    const usuario = this.usuarioRepo.buscarPorEmail(emailLimpio);
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

    this.sesionRepo.crear({
      token,
      usuarioId: usuario.id,
      expiresAt
    });

    return {
      token,
      usuario: usuario.toJSON(),
      expiresAt
    };
  }

  /**
   * Cierra la sesión activa revocando el token.
   * @param {string} token
   * @returns {boolean}
   */
  cerrarSesion(token) {
    if (!token) return false;
    return this.sesionRepo.eliminar(token);
  }

  /**
   * Consulta el usuario correspondiente a la sesión actual (o null si no hay sesión válida).
   * Corresponde a la firma requerida:
   * Sesión.usuarioActual() -> usuario o ausencia de sesión
   * @param {string} [token]
   * @returns {import('../models/Usuario.js').Usuario|null}
   */
  usuarioActual(token) {
    if (!token) {
      return null;
    }
    const sesion = this.sesionRepo.buscarPorToken(token);
    if (!sesion) {
      return null;
    }
    return sesion.usuario;
  }

  /**
   * Valida estrictamente la existencia de una sesión activa.
   * Lanza AuthenticationError si la sesión es nula o expiró.
   * @param {string} token
   * @returns {import('../models/Usuario.js').Usuario}
   */
  requerirUsuarioActual(token) {
    const usuario = this.usuarioActual(token);
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
