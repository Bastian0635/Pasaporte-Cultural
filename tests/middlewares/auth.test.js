import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SqliteProvider } from '../../data/providers/sqliteProvider.js';
import { UsuarioRepository } from '../../data/repositories/UsuarioRepository.js';
import { SesionRepository } from '../../data/repositories/SesionRepository.js';
import { SesionService } from '../../data/services/sesionService.js';
import { SeedFactory } from '../../data/factories/seedFactory.js';
import { requerirSesion, requerirEditor, soloInvitado } from '../../middlewares/authMiddleware.js';
import { AuthenticationError, ForbiddenError } from '../../core/errors.js';

describe('Middlewares: Verificación de Sesión y Control de Roles', () => {
  let provider;
  let usuarioRepo;
  let sesionRepo;
  let sesionService;
  let tokenVisitante;
  let tokenEditor;

  beforeEach(() => {
    provider = new SqliteProvider(':memory:');
    usuarioRepo = new UsuarioRepository(provider);
    sesionRepo = new SesionRepository(provider);
    sesionService = new SesionService({ usuarioRepo, sesionRepo });

    const factory = new SeedFactory({ provider });
    factory.poblarSiEsNecesario();

    tokenVisitante = sesionService.iniciarSesion('visitante@pasaporte.com', 'Visitante123!').token;
    tokenEditor = sesionService.iniciarSesion('editor@pasaporte.com', 'Editor123!').token;
  });

  // Helper para simular req/res de Express
  function crearMockContext(token = null) {
    const req = {
      cookies: token ? { pasaporte_session: token } : {},
      headers: {},
      app: {
        get: (key) => (key === 'sesionService' ? sesionService : null)
      }
    };

    let statusCode = 200;
    let jsonBody = null;
    let redirectedUrl = null;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonBody = data;
        return this;
      },
      redirect(url) {
        redirectedUrl = url;
        return this;
      },
      accepts: () => false
    };

    return { req, res, getStatus: () => statusCode, getJson: () => jsonBody };
  }

  test('requerirSesion bloquea con 401 si no hay token de autenticación', (t, done) => {
    const { req, res } = crearMockContext(null);

    requerirSesion(req, res, (err) => {
      assert.ok(err instanceof AuthenticationError);
      assert.equal(err.statusCode, 401);
      done();
    });
  });

  test('requerirSesion permite el paso si el token es válido', (t, done) => {
    const { req, res } = crearMockContext(tokenVisitante);

    requerirSesion(req, res, (err) => {
      assert.ifError(err);
      assert.ok(req.usuario);
      assert.equal(req.usuario.email, 'visitante@pasaporte.com');
      done();
    });
  });

  test('Regla 9: requerirEditor deniega acceso a visitante con 403 ForbiddenError', (t, done) => {
    const { req, res } = crearMockContext(tokenVisitante);

    requerirEditor(req, res, (err) => {
      assert.ok(err instanceof ForbiddenError, 'Debe ser ForbiddenError');
      assert.equal(err.statusCode, 403, 'Debe devolver código HTTP 403');
      done();
    });
  });

  test('requerirEditor autoriza exitosamente a usuario con rol editor', (t, done) => {
    const { req, res } = crearMockContext(tokenEditor);

    requerirEditor(req, res, (err) => {
      assert.ifError(err);
      assert.ok(req.usuario);
      assert.equal(req.usuario.esEditor(), true);
      done();
    });
  });

  test('soloInvitado permite continuar si no hay sesión', (t, done) => {
    const { req, res } = crearMockContext(null);

    soloInvitado(req, res, (err) => {
      assert.ifError(err);
      done();
    });
  });

  test('soloInvitado responde con estado y redirección si ya hay sesión activa', () => {
    const { req, res, getStatus, getJson } = crearMockContext(tokenVisitante);

    soloInvitado(req, res, () => {
      assert.fail('No debería llamar a next si ya hay sesión');
    });

    assert.equal(getStatus(), 200);
    assert.equal(getJson().autenticado, true);
    assert.equal(getJson().redirect, '/home');
  });
});
