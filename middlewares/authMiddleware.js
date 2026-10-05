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
  if (req.cookies && req.cookies[APP_CONFIG.SESSION_COOKIE_NAME]) {
    return req.cookies[APP_CONFIG.SESSION_COOKIE_NAME];
  }

  if (req.cookies && req.cookies.pasaporte_session) {
    return req.cookies.pasaporte_session;
  }

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  const customHeader = req.headers['x-session-token'];
  if (customHeader && typeof customHeader === 'string') {
    return customHeader.trim();
  }

  return null;
}

/**
 * Middleware que identifica al usuario actual a partir del token si existe,
 * adjuntándolo a req.usuario y req.token.
 */
export async function identificarUsuario(req, res, next) {
  try {
    const sesionService = req.app?.get('sesionService') || getSesionService();
    const token = extraerToken(req);

    if (token) {
      const usuario = await sesionService.usuarioActual(token);
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
    if (typeof next === 'function') next();
  } catch (err) {
    if (typeof next === 'function') next(err);
  }
}

/**
 * Middleware que exige una sesión de usuario válida.
 */
export async function requerirSesion(req, res, next) {
  try {
    await identificarUsuario(req, res);
    if (!req.usuario) {
      const err = new AuthenticationError('Acceso denegado: se requiere una sesión activa.');
      if (typeof next === 'function') return next(err);
      throw err;
    }
    if (typeof next === 'function') next();
  } catch (err) {
    if (typeof next === 'function') next(err);
  }
}

/**
 * Generador de middleware para exigir un rol específico.
 */
export function requerirRol(rolesPermitidos) {
  const permitidos = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

  return async (req, res, next) => {
    try {
      await requerirSesion(req, res);
      if (!req.usuario) return;

      const rolUsuario = req.usuario.rol;
      if (!permitidos.includes(rolUsuario)) {
        const err = new ForbiddenError(
          `Acceso denegado: la acción requiere rol (${permitidos.join(' o ')}). Su rol actual es '${rolUsuario}'.`
        );
        if (typeof next === 'function') return next(err);
        throw err;
      }
      if (typeof next === 'function') next();
    } catch (err) {
      if (typeof next === 'function') next(err);
    }
  };
}

export const requerirEditor = requerirRol(ROLES.EDITOR);
export const requerirVisitante = requerirRol(ROLES.VISITANTE);

/**
 * Guarda para acceso de invitados.
 */
export async function soloInvitado(req, res, next) {
  try {
    await identificarUsuario(req, res);

    if (req.usuario) {
      const acceptsHtml = typeof req.accepts === 'function' ? req.accepts('html') : false;
      const isApi = req.path && req.path.startsWith('/api/');

      if (acceptsHtml && !req.xhr && !isApi) {
        return res.redirect('/home');
      }

      const usuarioJSON = typeof req.usuario.toJSON === 'function' ? req.usuario.toJSON() : req.usuario;

      return res.status(200).json({
        success: true,
        message: 'Usuario ya tiene una sesión iniciada.',
        autenticado: true,
        usuario: usuarioJSON,
        redirect: '/home'
      });
    }

    if (typeof next === 'function') next();
  } catch (err) {
    if (typeof next === 'function') next(err);
  }
}