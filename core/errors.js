/**
 * Tipos de error personalizados para la aplicación Pasaporte Cultural.
 */

export class AppError extends Error {
  /**
   * @param {string} message - Mensaje descriptivo para el usuario/cliente
   * @param {number} statusCode - Código HTTP
   * @param {string} code - Código de error interno identificable
   * @param {any} [details=null] - Detalles adicionales del error (por ejemplo, errores de campo)
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        name: this.name,
        code: this.code,
        message: this.message,
        details: this.details
      }
    };
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Acceso no autenticado o credenciales inválidas') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tiene los permisos necesarios para realizar esta acción') {
    super(message, 403, 'FORBIDDEN_ACCESS');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'El recurso solicitado no fue encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Existe un conflicto con el estado actual del recurso') {
    super(message, 409, 'CONFLICT');
  }
}
