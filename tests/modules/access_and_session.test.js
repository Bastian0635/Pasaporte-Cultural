import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SqliteProvider } from '../../data/providers/sqliteProvider.js';
import { UsuarioRepository } from '../../data/repositories/UsuarioRepository.js';
import { SesionRepository } from '../../data/repositories/SesionRepository.js';
import { SesionService } from '../../data/services/sesionService.js';
import { SeedFactory } from '../../data/factories/seedFactory.js';
import { AuthenticationError } from '../../core/errors.js';

describe('Módulo de Acceso y Servicio de Sesión', () => {
  let provider;
  let usuarioRepo;
  let sesionRepo;
  let sesionService;

  beforeEach(() => {
    provider = new SqliteProvider(':memory:');
    usuarioRepo = new UsuarioRepository(provider);
    sesionRepo = new SesionRepository(provider);
    sesionService = new SesionService({ usuarioRepo, sesionRepo });

    const factory = new SeedFactory({ provider });
    factory.poblarSiEsNecesario();
  });

  test('Permite iniciar sesión con credenciales válidas de visitante y editor', () => {
    // 1. Visitante
    const sesionVisitante = sesionService.iniciarSesion('visitante@pasaporte.com', 'Visitante123!');
    assert.ok(sesionVisitante.token);
    assert.equal(sesionVisitante.usuario.rol, 'visitante');
    assert.equal(sesionVisitante.usuario.nombre, 'Carlos Visitante');

    // 2. Editor
    const sesionEditor = sesionService.iniciarSesion('editor@pasaporte.com', 'Editor123!');
    assert.ok(sesionEditor.token);
    assert.equal(sesionEditor.usuario.rol, 'editor');
    assert.equal(sesionEditor.usuario.nombre, 'Elena Editora');
  });

  test('Rechaza el inicio de sesión con contraseña incorrecta o correo inexistente', () => {
    assert.throws(
      () => sesionService.iniciarSesion('visitante@pasaporte.com', 'ClaveIncorrecta'),
      AuthenticationError
    );

    assert.throws(
      () => sesionService.iniciarSesion('noexiste@pasaporte.com', 'Cualquiera123'),
      AuthenticationError
    );
  });

  test('Operación Sesión.usuarioActual(): retorna usuario o ausencia de sesión (null)', () => {
    // Ausencia de sesión (sin token o token no encontrado)
    assert.equal(sesionService.usuarioActual(null), null);
    assert.equal(sesionService.usuarioActual('token-inexistente'), null);

    // Con sesión activa
    const { token } = sesionService.iniciarSesion('editor@pasaporte.com', 'Editor123!');
    const usuarioActual = sesionService.usuarioActual(token);

    assert.ok(usuarioActual);
    assert.equal(usuarioActual.email, 'editor@pasaporte.com');
    assert.equal(usuarioActual.esEditor(), true);
  });

  test('Cerrar sesión (logout) invalida el token y usuarioActual pasa a ser null', () => {
    const { token } = sesionService.iniciarSesion('visitante@pasaporte.com', 'Visitante123!');
    assert.ok(sesionService.usuarioActual(token));

    // Cerrar sesión
    const cerrada = sesionService.cerrarSesion(token);
    assert.equal(cerrada, true);

    // Debe resultar en ausencia de sesión
    assert.equal(sesionService.usuarioActual(token), null);
  });
});
