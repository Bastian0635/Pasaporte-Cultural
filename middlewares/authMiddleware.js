/**
 * middlewares/authMiddleware.js
 * 
 * Guardas de seguridad para control de acceso:
 * - Detección y extracción de token de sesión (Cookie / Bearer Token / Header)
 * - Verificación de sesión activa (requerirSesion)
 * - Control estricto de roles (requerirRol / requerirEditor / requerirVisitante)
 * - Guarda para usuarios sin sesión (soloInvitado)
 */

import { APP_CONFIG, ROLES } from '../core/constants.js';
import { AuthenticationError, ForbiddenError } from '../core/errors.js';
import { getSesionService } from '../data/services/sesionService.js';

/**
 * Extrae el token de autenticación desde cookies o encabezados HTTP.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
export function extraerToken(req) {
  // 1. Cookies
  if (req.cookies && req.cookies[APP_CONFIG.SESSION_COOKIE_NAME]) {
    return req.cookies[APP_CONFIG.SESSION_COOKIE_NAME];
  }

  // 2. Encabezado Authorization: Bearer <token>
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 3. Encabezado personalizado x-session-token
  const customHeader = req.headers['x-session-token'];
  if (customHeader && typeof customHeader === 'string') {
    return customHeader.trim();
  }

  return null;
}

/**
 * Middleware que identifica al usuario actual a partir del token si existe,
 * adjuntándolo a req.usuario y req.token sin bloquear la petición si no existe.
 */
export function identificarUsuario(req, res, next) {
  try {
    const sesionService = req.app.get('sesionService') || getSesionService();
    const token = extraerToken(req);

    if (token) {
      const usuario = sesionService.usuarioActual(token);
      if (usuario) {
        req.token = token;
        req.usuario = usuario;
      } else {
        req.token = null;
        req.usuario = null;
      }
    } else {
      req.token = null;
      req.usuario = null;
    }
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware que exige una sesión de usuario válida.
 * Si no está autenticado, responde 401 AuthenticationError.
 */
export function requerirSesion(req, res, next) {
  identificarUsuario(req, res, () => {
    if (!req.usuario) {
      return next(new AuthenticationError('Acceso denegado: se requiere una sesión activa.'));
    }
    next();
  });
}

/**
 * Generador de middleware para exigir un rol específico ('editor' o 'visitante').
 * Regla 9: Se valida el rol tanto al entrar a las funciones de administración
 * como al ejecutar la operación de escritura. Ocultar una opción de la interfaz, por sí solo, no cumple esta regla.
 * @param {string|string[]} rolesPermitidos
 */
export function requerirRol(rolesPermitidos) {
  const permitidos = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

  return (req, res, next) => {
    requerirSesion(req, res, () => {
      if (!permitidos.includes(req.usuario.rol)) {
        return next(
          new ForbiddenError(
            `Acceso denegado: la acción requiere rol (${permitidos.join(' o ')}). Su rol actual es '${req.usuario.rol}'.`
          )
        );
      }
      next();
    });
  };
}

/**
 * Acceso exclusivo para rol Editor.
 */
export const requerirEditor = requerirRol(ROLES.EDITOR);

/**
 * Acceso exclusivo para rol Visitante.
 */
export const requerirVisitante = requerirRol(ROLES.VISITANTE);

/**
 * Guarda para páginas o endpoints de acceso de invitados (login / registro).
 * Regla de acceso: "Entrada al sistema: Sin sesión. Si ya hay sesión, llevar al resumen o devolver el estado de sesión."
 */
export function soloInvitado(req, res, next) {
  identificarUsuario(req, res, () => {
    if (req.usuario) {
      const acceptsHtml = typeof req.accepts === 'function' ? req.accepts('html') : false;
      const isApi = req.path && req.path.startsWith('/api/');
      if (acceptsHtml && !req.xhr && !isApi) {
        return res.redirect('/home');
      }
      return res.status(200).json({
        success: true,
        message: 'Usuario ya tiene una sesión iniciada.',
        autenticado: true,
        usuario: req.usuario.toJSON(),
        redirect: '/home'
      });
    }
    next();
  });
}
