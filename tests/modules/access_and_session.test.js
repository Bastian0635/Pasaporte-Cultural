import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { PostgresProvider } from '../../data/providers/postgresProvider.js';
import { UsuarioRepository } from '../../data/repositories/UsuarioRepository.js';
import { SesionRepository } from '../../data/repositories/SesionRepository.js';
import { SesionService } from '../../data/services/sesionService.js';
import { SeedFactory } from '../../data/factories/seedFactory.js';
import { AuthenticationError } from '../../core/errors.js';

describe('Módulo de Acceso y Servicio de Sesión (PostgreSQL)', () => {
  let provider;
  let usuarioRepo;
  let sesionRepo;
  let sesionService;

  beforeEach(async () => {
    provider = new PostgresProvider();
    await provider.inicializarTablas();
    await provider.exec('TRUNCATE TABLE sesiones, favoritos, visitas, visits, retos, lugares, usuarios CASCADE;');

    usuarioRepo = new UsuarioRepository(provider);
    sesionRepo = new SesionRepository(provider);
    sesionService = new SesionService({ usuarioRepo, sesionRepo });

    const factory = new SeedFactory({ provider, usuarioRepo });
    await factory.poblarSiEsNecesario();
  });

  after(async () => {
    if (provider) {
      await provider.close();
    }
  });

  test('Permite iniciar sesión con credenciales válidas de visitante y editor', async () => {
    // 1. Visitante
    const sesionVisitante = await sesionService.iniciarSesion('visitante@pasaporte.com', 'Visitante123!');
    assert.ok(sesionVisitante.token);
    assert.equal(sesionVisitante.usuario.rol, 'visitante');
    assert.equal(sesionVisitante.usuario.nombre, 'Carlos Visitante');

    // 2. Editor
    const sesionEditor = await sesionService.iniciarSesion('editor@pasaporte.com', 'Editor123!');
    assert.ok(sesionEditor.token);
    assert.equal(sesionEditor.usuario.rol, 'editor');
    assert.equal(sesionEditor.usuario.nombre, 'Elena Editora');
  });

  test('Rechaza el inicio de sesión con contraseña incorrecta o correo inexistente', async () => {
    await assert.rejects(
      async () => await sesionService.iniciarSesion('visitante@pasaporte.com', 'ClaveIncorrecta'),
      AuthenticationError
    );

    await assert.rejects(
      async () => await sesionService.iniciarSesion('noexiste@pasaporte.com', 'Cualquiera123'),
      AuthenticationError
    );
  });

  test('Operación Sesión.usuarioActual(): retorna usuario o ausencia de sesión (null)', async () => {
    // Ausencia de sesión (sin token o token no encontrado)
    assert.equal(await sesionService.usuarioActual(null), null);
    assert.equal(await sesionService.usuarioActual('token-inexistente'), null);

    // Con sesión activa
    const { token } = await sesionService.iniciarSesion('editor@pasaporte.com', 'Editor123!');
    const usuarioActual = await sesionService.usuarioActual(token);

    assert.ok(usuarioActual);
    assert.equal(usuarioActual.email, 'editor@pasaporte.com');
    assert.equal(usuarioActual.esEditor(), true);
  });

  test('Cerrar sesión (logout) invalida el token y usuarioActual pasa a ser null', async () => {
    const { token } = await sesionService.iniciarSesion('visitante@pasaporte.com', 'Visitante123!');
    assert.ok(await sesionService.usuarioActual(token));

    // Cerrar sesión
    const cerrada = await sesionService.cerrarSesion(token);
    assert.equal(cerrada, true);

    // Debe resultar en ausencia de sesión
    assert.equal(await sesionService.usuarioActual(token), null);
  });
});
