/**
 * middlewares/errorHandler.js
 * 
 * Middleware centralizado de captura y normalización de errores.
 */

import { AppError } from '../core/errors.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Si es un error controlado de la jerarquía AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Error de sintaxis JSON o parseo de Express
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        name: 'ValidationError',
        code: 'INVALID_JSON',
        message: 'El cuerpo de la solicitud no contiene un JSON válido.'
      }
    });
  }

  // Errores no controlados (500)
  console.error('[UNHANDLED_ERROR]:', err);
  return res.status(500).json({
    success: false,
    error: {
      name: 'InternalServerError',
      code: 'INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado en el servidor.'
    }
  });
}
