import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validarTexto,
  validarEmail,
  validarRol,
  validarCategoria,
  validarCodigoRegistro,
  validarMetaReto,
  validarRangoFechasReto,
  validarIdentificador
} from '../../core/validators.js';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError
} from '../../core/errors.js';
import {
  obtenerFechaString,
  obtenerMesString,
  sonMismoDia,
  estaEnRango
} from '../../core/dateUtils.js';

describe('Capa Core: Tipos de Error Personalizados', () => {
  test('AppError y sus subclases contienen códigos y status HTTP correctos', () => {
    const valErr = new ValidationError('Dato no válido', { campo: 'nombre' });
    assert.equal(valErr.statusCode, 400);
    assert.equal(valErr.code, 'VALIDATION_ERROR');
    assert.deepEqual(valErr.details, { campo: 'nombre' });

    const authErr = new AuthenticationError();
    assert.equal(authErr.statusCode, 401);
    assert.equal(authErr.code, 'AUTHENTICATION_REQUIRED');

    const forbErr = new ForbiddenError();
    assert.equal(forbErr.statusCode, 403);
    assert.equal(forbErr.code, 'FORBIDDEN_ACCESS');

    const notFound = new NotFoundError();
    assert.equal(notFound.statusCode, 404);
    assert.equal(notFound.code, 'NOT_FOUND');

    const conflict = new ConflictError();
    assert.equal(conflict.statusCode, 409);
    assert.equal(conflict.code, 'CONFLICT');
  });
});

describe('Capa Core: Validadores Puros', () => {
  test('validarTexto valida obligatoriedad y límites de caracteres', () => {
    assert.equal(validarTexto('  Museo del Prado  ', 'nombre'), 'Museo del Prado');

    assert.throws(() => validarTexto('', 'nombre'), ValidationError);
    assert.throws(() => validarTexto('ab', 'nombre', { min: 3 }), ValidationError);
    assert.throws(() => validarTexto('123456', 'nombre', { max: 5 }), ValidationError);
  });

  test('validarEmail valida formato de correo electrónico', () => {
    assert.equal(validarEmail('Visitante@Pasaporte.com'), 'visitante@pasaporte.com');

    assert.throws(() => validarEmail('invalido'), ValidationError);
    assert.throws(() => validarEmail('invalido@'), ValidationError);
    assert.throws(() => validarEmail('@correo.com'), ValidationError);
  });

  test('validarRol solo admite visitante o editor', () => {
    assert.equal(validarRol('visitante'), 'visitante');
    assert.equal(validarRol('EDITOR'), 'editor');

    assert.throws(() => validarRol('admin_super'), ValidationError);
    assert.throws(() => validarRol('otro'), ValidationError);
  });

  test('validarCategoria solo admite museo, galería o centro cultural', () => {
    assert.equal(validarCategoria('museo'), 'museo');
    assert.equal(validarCategoria('galería'), 'galería');
    assert.equal(validarCategoria('centro cultural'), 'centro cultural');

    assert.throws(() => validarCategoria('parque'), ValidationError);
  });

  test('validarCodigoRegistro valida caracteres permitidos', () => {
    assert.equal(validarCodigoRegistro('oro-bog-01'), 'ORO-BOG-01');

    assert.throws(() => validarCodigoRegistro('código con espacios'), ValidationError);
    assert.throws(() => validarCodigoRegistro('ab'), ValidationError); // muy corto
  });

  test('validarMetaReto exige entero mayor que cero (Regla 5)', () => {
    assert.equal(validarMetaReto(3), 3);
    assert.equal(validarMetaReto('5'), 5);

    assert.throws(() => validarMetaReto(0), ValidationError);
    assert.throws(() => validarMetaReto(-1), ValidationError);
    assert.throws(() => validarMetaReto(2.5), ValidationError);
    assert.throws(() => validarMetaReto('no_num'), ValidationError);
  });

  test('validarRangoFechasReto rechaza fecha inicio posterior a fecha fin (Regla 5)', () => {
    const rangoValido = validarRangoFechasReto('2026-01-01', '2026-12-31');
    assert.equal(rangoValido.fechaInicio, '2026-01-01');
    assert.equal(rangoValido.fechaFin, '2026-12-31');

    assert.throws(() => validarRangoFechasReto('2026-12-31', '2026-01-01'), ValidationError);
  });
});

describe('Capa Core: Manejo de Fechas y Criterio de Día (Regla 3)', () => {
  test('formatea correctamente a YYYY-MM-DD y detecta si es mismo día', () => {
    const fechaA = new Date('2026-10-15T09:00:00Z');
    const fechaB = new Date('2026-10-15T18:30:00Z');
    const fechaC = new Date('2026-10-16T09:00:00Z');

    assert.equal(sonMismoDia(fechaA, fechaB), true);
    assert.equal(sonMismoDia(fechaA, fechaC), false);
  });

  test('estaEnRango evalúa ventana de período con extremos inclusivos (Regla 6)', () => {
    assert.equal(estaEnRango('2026-05-10', '2026-05-01', '2026-05-31'), true);
    assert.equal(estaEnRango('2026-05-01', '2026-05-01', '2026-05-31'), true); // Extremo inicial
    assert.equal(estaEnRango('2026-05-31', '2026-05-01', '2026-05-31'), true); // Extremo final
    assert.equal(estaEnRango('2026-04-30', '2026-05-01', '2026-05-31'), false);
    assert.equal(estaEnRango('2026-06-01', '2026-05-01', '2026-05-31'), false);
  });
});
