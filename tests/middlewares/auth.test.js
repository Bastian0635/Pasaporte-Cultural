import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { PostgresProvider } from '../../data/providers/postgresProvider.js';
import { UsuarioRepository } from '../../data/repositories/UsuarioRepository.js';
import { SesionRepository } from '../../data/repositories/SesionRepository.js';
import { SesionService } from '../../data/services/sesionService.js';
import { SeedFactory } from '../../data/factories/seedFactory.js';
import { requerirSesion, requerirEditor, soloInvitado } from '../../middlewares/authMiddleware.js';
import { AuthenticationError, ForbiddenError } from '../../core/errors.js';

describe('Middlewares: Verificación de Sesión y Control de Roles (PostgreSQL)', () => {
  let provider;
  let usuarioRepo;
  let sesionRepo;
  let sesionService;
  let tokenVisitante;
  let tokenEditor;

  beforeEach(async () => {
    provider = new PostgresProvider();
    await provider.inicializarTablas();

    // IF EXISTS evita excepciones si alguna tabla condicional aún no fue creada
    await provider.exec(
      'TRUNCATE TABLE sesiones, favoritos, visitas, visits, retos, lugares, usuarios CASCADE;'
    );

    usuarioRepo = new UsuarioRepository(provider);
    sesionRepo = new SesionRepository(provider);
    sesionService = new SesionService({ usuarioRepo, sesionRepo });

    const factory = new SeedFactory({ provider, usuarioRepo });
    await factory.poblarSiEsNecesario();

    tokenVisitante = (await sesionService.iniciarSesion('visitante@pasaporte.com', 'Visitante123!')).token;
    tokenEditor = (await sesionService.iniciarSesion('editor@pasaporte.com', 'Editor123!')).token;
  });

  after(async () => {
    if (provider) {
      await provider.close();
    }
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

  test('requerirSesion bloquea con 401 si no hay token de autenticación', async () => {
    const { req, res } = crearMockContext(null);

    let capturedErr = null;
    await requerirSesion(req, res, (err) => {
      capturedErr = err;
    });

    assert.ok(capturedErr instanceof AuthenticationError);
    assert.equal(capturedErr.statusCode, 401);
  });

  test('requerirSesion permite el paso si el token es válido', async () => {
    const { req, res } = crearMockContext(tokenVisitante);

    let calledNext = false;
    await requerirSesion(req, res, (err) => {
      assert.ifError(err);
      calledNext = true;
    });

    assert.ok(calledNext);
    assert.ok(req.usuario);
    assert.equal(req.usuario.email, 'visitante@pasaporte.com');
  });

  test('Regla 9: requerirEditor deniega acceso a visitante con 403 ForbiddenError', async () => {
    const { req, res } = crearMockContext(tokenVisitante);

    let capturedErr = null;
    await requerirEditor(req, res, (err) => {
      capturedErr = err;
    });

    assert.ok(capturedErr instanceof ForbiddenError, 'Debe ser ForbiddenError');
    assert.equal(capturedErr.statusCode, 403, 'Debe devolver código HTTP 403');
  });

  test('requerirEditor autoriza exitosamente a usuario con rol editor', async () => {
    const { req, res } = crearMockContext(tokenEditor);

    let calledNext = false;
    await requerirEditor(req, res, (err) => {
      assert.ifError(err);
      calledNext = true;
    });

    assert.ok(calledNext);
    assert.ok(req.usuario);
    assert.equal(req.usuario.esEditor(), true);
  });

  test('soloInvitado permite continuar si no hay sesión', async () => {
    const { req, res } = crearMockContext(null);

    let calledNext = false;
    await soloInvitado(req, res, (err) => {
      assert.ifError(err);
      calledNext = true;
    });

    assert.ok(calledNext);
  });

  test('soloInvitado responde con estado y redirección si ya hay sesión activa', async () => {
    const { req, res, getStatus, getJson } = crearMockContext(tokenVisitante);

    await soloInvitado(req, res, () => {
      assert.fail('No debería llamar a next si ya hay sesión');
    });

    assert.equal(getStatus(), 200);
    assert.equal(getJson().autenticado, true);
    assert.equal(getJson().redirect, '/home');
  });
});