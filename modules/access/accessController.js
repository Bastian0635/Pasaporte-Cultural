/**
 * modules/access/accessController.js
 * 
 * Controlador del módulo de acceso y autenticación.
 * Coordina los casos de uso de inicio de sesión, cierre de sesión y consulta del usuario actual.
 */

import { APP_CONFIG } from '../../core/constants.js';
import { getSesionService } from '../../data/services/sesionService.js';
import { extraerToken } from '../../middlewares/authMiddleware.js';
import { USUARIOS_DEMO } from '../../data/factories/demoData.js';

export class AccessController {
  /**
   * @param {import('../../data/services/sesionService.js').SesionService} [sesionService]
   */
  constructor(sesionService = null) {
    this.sesionService = sesionService || getSesionService();
  }

  /**
   * Procesa el inicio de sesión.
   * POST /api/access/login
   */
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      const { token, usuario, expiresAt } = await this.sesionService.iniciarSesion(email, password);

      // Guardar cookie HTTP segura para navegación web
      res.cookie(APP_CONFIG.SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: APP_CONFIG.SESSION_DURATION_HOURS * 60 * 60 * 1000
      });

      return res.status(200).json({
        success: true,
        message: `Bienvenido(a), ${usuario.nombre}.`,
        token,
        usuario,
        expiresAt
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Procesa el cierre de sesión.
   * POST /api/access/logout
   */
  logout = async (req, res, next) => {
    try {
      const token = extraerToken(req);
      if (token) {
        await this.sesionService.cerrarSesion(token);
      }

      res.clearCookie(APP_CONFIG.SESSION_COOKIE_NAME);

      return res.status(200).json({
        success: true,
        message: 'Sesión finalizada correctamente.'
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Consulta el usuario correspondiente a la sesión actual (o ausencia de sesión).
   * Implementa la especificación: Sesión.usuarioActual() -> usuario o ausencia de sesión
   * GET /api/access/me
   */
  obtenerUsuarioActual = async (req, res, next) => {
    try {
      const token = extraerToken(req);
      const usuario = await this.sesionService.usuarioActual(token);

      if (!usuario) {
        return res.status(200).json({
          success: true,
          autenticado: false,
          usuario: null
        });
      }

      return res.status(200).json({
        success: true,
        autenticado: true,
        usuario: usuario.toJSON(),
        rol: usuario.rol
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Retorna los usuarios de prueba para fácil selección en la interfaz de demostración.
   * GET /api/access/demo-users
   */
  obtenerUsuariosDemo = async (req, res, next) => {
    try {
      const demos = USUARIOS_DEMO.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        password: u.password,
        rol: u.rol
      }));

      return res.status(200).json({
        success: true,
        data: demos
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const accessController = new AccessController();
