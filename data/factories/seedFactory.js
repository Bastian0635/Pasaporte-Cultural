/**
 * data/factories/seedFactory.js
 * 
 * Carga inicial de datos de demostración de manera reproducible e idempotente.
 * REGLA CLAVE: No sobrescribe favoritos, visitas ni modificaciones existentes
 * realizadas por usuarios o editores en reinicios posteriores.
 */

import { USUARIOS_DEMO, LUGARES_DEMO, RETOS_DEMO } from './demoData.js';
import { Usuario } from '../models/Usuario.js';
import { Lugar } from '../models/Lugar.js';
import { Reto } from '../models/Reto.js';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { LugarRepository } from '../repositories/LugarRepository.js';
import { RetoRepository } from '../repositories/RetoRepository.js';

export class SeedFactory {
  /**
   * @param {object} [opciones={}]
   * @param {import('../providers/sqliteProvider.js').SqliteProvider} [opciones.provider]
   * @param {UsuarioRepository} [opciones.usuarioRepo]
   * @param {LugarRepository} [opciones.lugarRepo]
   * @param {RetoRepository} [opciones.retoRepo]
   */
  constructor({ provider = null, usuarioRepo = null, lugarRepo = null, retoRepo = null } = {}) {
    this.usuarioRepo = usuarioRepo || new UsuarioRepository(provider);
    this.lugarRepo = lugarRepo || new LugarRepository(provider);
    this.retoRepo = retoRepo || new RetoRepository(provider);
  }

  /**
   * Ejecuta la inicialización de datos de demostración respetando datos existentes.
   * @returns {{ usuariosCreados: number, lugaresCreados: number, retosCreados: number }}
   */
  poblarSiEsNecesario() {
    let usuariosCreados = 0;
    let lugaresCreados = 0;
    let retosCreados = 0;

    // 1. Usuarios demo (solo si el correo no existe en la base de datos)
    for (const u of USUARIOS_DEMO) {
      const existente = this.usuarioRepo.buscarPorEmail(u.email);
      if (!existente) {
        const nuevoUsuario = new Usuario({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          password: u.password,
          rol: u.rol
        });
        this.usuarioRepo.guardar(nuevoUsuario);
        usuariosCreados++;
      }
    }

    // 2. Lugares demo (solo si el código de registro no existe en la base de datos)
    for (const l of LUGARES_DEMO) {
      const existente = this.lugarRepo.obtenerPorCodigo(l.codigoRegistro);
      if (!existente) {
        const nuevoLugar = new Lugar({
          id: l.id,
          nombre: l.nombre,
          categoria: l.categoria,
          municipio: l.municipio,
          direccion: l.direccion,
          descripcion: l.descripcion,
          horario: l.horario,
          imagen: l.imagen,
          codigoRegistro: l.codigoRegistro,
          activo: l.activo
        });
        this.lugarRepo.guardar(nuevoLugar);
        lugaresCreados++;
      }
    }

    // 3. Retos demo (solo si el ID o título del reto no existe)
    for (const r of RETOS_DEMO) {
      const existente = this.retoRepo.obtenerPorId(r.id);
      if (!existente) {
        const nuevoReto = new Reto({
          id: r.id,
          titulo: r.titulo,
          descripcion: r.descripcion,
          categoria: r.categoria,
          meta: r.meta,
          fechaInicio: r.fechaInicio,
          fechaFin: r.fechaFin,
          activo: r.activo
        });
        this.retoRepo.guardar(nuevoReto);
        retosCreados++;
      }
    }

    return { usuariosCreados, lugaresCreados, retosCreados };
  }
}

/**
 * Función de conveniencia para poblar la base de datos activa.
 */
export function poblarDatosIniciales(provider = null) {
  const usuarioRepo = new UsuarioRepository(provider);
  const lugarRepo = new LugarRepository(provider);
  const retoRepo = new RetoRepository(provider);

  const factory = new SeedFactory({ usuarioRepo, lugarRepo, retoRepo });
  return factory.poblarSiEsNecesario();
}
