import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { PostgresProvider } from '../../data/providers/postgresProvider.js';
import { UsuarioRepository } from '../../data/repositories/UsuarioRepository.js';
import { LugarRepository } from '../../data/repositories/LugarRepository.js';
import { RetoRepository } from '../../data/repositories/RetoRepository.js';
import { VisitaRepository } from '../../data/repositories/VisitaRepository.js';
import { FavoritoRepository } from '../../data/repositories/FavoritoRepository.js';
import { SeedFactory } from '../../data/factories/seedFactory.js';
import { Visita } from '../../data/models/Visita.js';

describe('Capa Persistencia y Seed Data (PostgreSQL)', () => {
  let provider;
  let usuarioRepo;
  let lugarRepo;
  let retoRepo;
  let visitaRepo;
  let favRepo;
  let factory;

  beforeEach(async () => {
    provider = new PostgresProvider();
    await provider.inicializarTablas();
    await provider.exec('TRUNCATE TABLE sesiones, favoritos, visitas, visits, retos, lugares, usuarios CASCADE;');

    usuarioRepo = new UsuarioRepository(provider);
    lugarRepo = new LugarRepository(provider);
    retoRepo = new RetoRepository(provider);
    visitaRepo = new VisitaRepository(provider);
    favRepo = new FavoritoRepository(provider);

    factory = new SeedFactory({ provider, usuarioRepo, lugarRepo, retoRepo });
  });

  after(async () => {
    if (provider) {
      await provider.close();
    }
  });

  test('La carga inicial crea al menos 12 lugares, 3 retos y 2 usuarios de prueba', async () => {
    const res = await factory.poblarSiEsNecesario();

    assert.equal(res.usuariosCreados, 2, 'Debe crear 2 usuarios iniciales');
    assert.equal(res.lugaresCreados, 12, 'Debe crear 12 lugares iniciales');
    assert.equal(res.retosCreados, 3, 'Debe crear 3 retos iniciales');

    // Verificar usuarios
    const visitante = await usuarioRepo.buscarPorEmail('visitante@pasaporte.com');
    assert.ok(visitante);
    assert.equal(visitante.rol, 'visitante');

    const editor = await usuarioRepo.buscarPorEmail('editor@pasaporte.com');
    assert.ok(editor);
    assert.equal(editor.rol, 'editor');

    // Verificar lugares y distribución de categorías
    const lugares = await lugarRepo.listarTodos();
    assert.equal(lugares.length, 12);

    const museos = lugares.filter((l) => l.categoria === 'museo');
    const galerias = lugares.filter((l) => l.categoria === 'galería');
    const centros = lugares.filter((l) => l.categoria === 'centro cultural');

    assert.equal(museos.length, 4);
    assert.equal(galerias.length, 4);
    assert.equal(centros.length, 4);

    // Verificar retos
    const retos = await retoRepo.listarTodos();
    assert.equal(retos.length, 3);
  });

  test('La semilla es reproducible e idempotente: no duplica ni sobrescribe en reinicios', async () => {
    // Primera ejecución
    await factory.poblarSiEsNecesario();

    // Segunda ejecución (simula reinicio del servidor)
    const resReinicio = await factory.poblarSiEsNecesario();

    assert.equal(resReinicio.usuariosCreados, 0, 'No debe duplicar usuarios en reinicio');
    assert.equal(resReinicio.lugaresCreados, 0, 'No debe duplicar lugares en reinicio');
    assert.equal(resReinicio.retosCreados, 0, 'No debe duplicar retos en reinicio');

    assert.equal(await usuarioRepo.contar(), 2);
    assert.equal(await lugarRepo.contar(), 12);
    assert.equal(await retoRepo.contar(), 3);
  });

  test('No sobrescribe modificaciones hechas por usuarios o editores (Regla de oro)', async () => {
    await factory.poblarSiEsNecesario();

    // El editor desactiva un lugar
    const lugar = await lugarRepo.obtenerPorCodigo('ORO-BOG-01');
    await lugarRepo.desactivar(lugar.id);

    const lugarDesactivado = await lugarRepo.obtenerPorId(lugar.id);
    assert.equal(lugarDesactivado.estaActivo(), false);

    // Se simula un reinicio del sistema con la semilla
    await factory.poblarSiEsNecesario();

    // El lugar DEBE permanecer desactivado, no restaurarse a activo
    const lugarTrasReinicio = await lugarRepo.obtenerPorId(lugar.id);
    assert.equal(lugarTrasReinicio.estaActivo(), false, 'La semilla no debe sobrescribir el estado editado');
  });

  test('Conserva las visitas y favoritos registrados por el usuario', async () => {
    await factory.poblarSiEsNecesario();

    const visitante = await usuarioRepo.buscarPorEmail('visitante@pasaporte.com');
    const lugar = await lugarRepo.obtenerPorCodigo('ORO-BOG-01');

    // Registrar favorito y visita
    await favRepo.establecer(visitante.id, lugar.id, true);
    await visitaRepo.guardar(new Visita({
      usuarioId: visitante.id,
      lugarId: lugar.id,
      fechaHora: '2026-10-15T10:00:00Z'
    }));

    assert.equal(await favRepo.existe(visitante.id, lugar.id), true);
    assert.equal(await visitaRepo.contarPorUsuario(visitante.id), 1);

    // Se simula nuevo reinicio del sistema
    await factory.poblarSiEsNecesario();

    // Los datos del usuario permanecen intactos
    assert.equal(await favRepo.existe(visitante.id, lugar.id), true);
    assert.equal(await visitaRepo.contarPorUsuario(visitante.id), 1);
  });
});