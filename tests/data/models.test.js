import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Usuario } from '../../data/models/Usuario.js';
import { Lugar } from '../../data/models/Lugar.js';
import { Visita } from '../../data/models/Visita.js';
import { Favorito } from '../../data/models/Favorito.js';
import { Reto } from '../../data/models/Reto.js';
import { ValidationError } from '../../core/errors.js';

describe('Capa Data: Modelos de Entidades', () => {
  test('Usuario: instanciación, roles y serialización segura toJSON()', () => {
    const usuario = new Usuario({
      id: 'usr-1',
      nombre: 'Carlos Visitante',
      email: 'carlos@pasaporte.com',
      password: 'MiPassword123',
      rol: 'visitante'
    });

    assert.equal(usuario.esVisitante(), true);
    assert.equal(usuario.esEditor(), false);

    const json = usuario.toJSON();
    assert.equal(json.id, 'usr-1');
    assert.equal(json.nombre, 'Carlos Visitante');
    assert.equal(json.email, 'carlos@pasaporte.com');
    assert.equal(json.rol, 'visitante');
    assert.equal(json.password, undefined, 'La contraseña NO debe exponerse en toJSON');
  });

  test('Lugar: validaciones, estado activo y toJSON()', () => {
    const lugar = new Lugar({
      id: 'lug-1',
      nombre: 'Museo de Arte Moderno',
      categoria: 'museo',
      municipio: 'Medellín',
      direccion: 'Carrera 44 # 19A-100',
      descripcion: 'Epicentro del arte moderno y contemporáneo.',
      horario: '10:00 a.m. a 6:00 p.m.',
      codigoRegistro: 'MAMM-01',
      activo: true
    });

    assert.equal(lugar.estaActivo(), true);
    lugar.desactivar();
    assert.equal(lugar.estaActivo(), false);

    assert.throws(() => new Lugar({
      nombre: 'Lugar Inválido',
      categoria: 'categoria_falsa',
      municipio: 'Bogotá',
      direccion: 'Calle 10',
      descripcion: 'Desc',
      horario: '9-5',
      codigoRegistro: 'COD-1'
    }), ValidationError);
  });

  test('Visita: calcula día civil y almacena relaciones', () => {
    const visita = new Visita({
      id: 'vis-1',
      usuarioId: 'usr-1',
      lugarId: 'lug-1',
      fechaHora: '2026-10-15T15:30:00Z'
    });

    assert.equal(visita.usuarioId, 'usr-1');
    assert.equal(visita.lugarId, 'lug-1');
    assert.ok(visita.obtenerDia());
    assert.equal(visita.obtenerDia(), '2026-10-15');
  });

  test('Favorito: almacena relación usuario y lugar', () => {
    const fav = new Favorito({
      id: 'fav-1',
      usuarioId: 'usr-1',
      lugarId: 'lug-1'
    });

    assert.equal(fav.usuarioId, 'usr-1');
    assert.equal(fav.lugarId, 'lug-1');
    assert.ok(fav.createdAt);
  });

  test('Reto: valida meta positiva, período y toJSON()', () => {
    const reto = new Reto({
      id: 'ret-1',
      titulo: 'Explorador Cultural',
      descripcion: 'Conoce tres museos durante el año',
      categoria: 'museo',
      meta: 3,
      fechaInicio: '2026-01-01',
      fechaFin: '2026-12-31',
      activo: true
    });

    assert.equal(reto.meta, 3);
    assert.equal(reto.estaActivo(), true);

    assert.throws(() => new Reto({
      titulo: 'Reto Inválido',
      descripcion: 'Desc',
      categoria: 'museo',
      meta: 0, // Invalido
      fechaInicio: '2026-01-01',
      fechaFin: '2026-12-31'
    }), ValidationError);
  });
});
