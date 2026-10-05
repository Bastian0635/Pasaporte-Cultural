/**
 * data/factories/seedFactory.js
 * 
 * Carga inicial de datos de demostración de manera reproducible e idempotente para PostgreSQL.
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
import { getDatabaseProvider } from '../providers/postgresProvider.js';

export class SeedFactory {
  /**
   * @param {object} [opciones={}]
   * @param {import('../providers/postgresProvider.js').PostgresProvider} [opciones.provider]
   * @param {UsuarioRepository} [opciones.usuarioRepo]
   * @param {LugarRepository} [opciones.lugarRepo]
   * @param {RetoRepository} [opciones.retoRepo]
   */
  constructor({ provider = null, usuarioRepo = null, lugarRepo = null, retoRepo = null } = {}) {
    const activeProvider = provider || getDatabaseProvider();
    this.provider = activeProvider;
    this.usuarioRepo = usuarioRepo || new UsuarioRepository(activeProvider);
    this.lugarRepo = lugarRepo || new LugarRepository(activeProvider);
    this.retoRepo = retoRepo || new RetoRepository(activeProvider);
  }

  /**
   * Ejecuta la inicialización de datos de demostración respetando datos existentes.
   * @returns {Promise<{ usuariosCreados: number, lugaresCreados: number, retosCreados: number }>}
   */
  async poblarSiEsNecesario() {
    let usuariosCreados = 0;
    let lugaresCreados = 0;
    let retosCreados = 0;

    // 1. Usuarios demo (solo si ni el id ni el email existen previamente)
    for (const u of USUARIOS_DEMO) {
      const existePorId = u.id ? await this.usuarioRepo.obtenerPorId(u.id) : null;
      const existePorEmail = u.email ? await this.usuarioRepo.buscarPorEmail(u.email) : null;

      if (!existePorId && !existePorEmail) {
        const nuevoUsuario = new Usuario({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          password: u.password,
          rol: u.rol
        });
        await this.usuarioRepo.guardar(nuevoUsuario);
        usuariosCreados++;
      }
    }

    // 2. Lugares demo (solo si ni el id ni el código de registro existen)
    for (const l of LUGARES_DEMO) {
      const existePorId = l.id ? await this.lugarRepo.obtenerPorId(l.id) : null;
      const existePorCodigo = l.codigoRegistro ? await this.lugarRepo.obtenerPorCodigo(l.codigoRegistro) : null;

      if (!existePorId && !existePorCodigo) {
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
        await this.lugarRepo.guardar(nuevoLugar);
        lugaresCreados++;
      }
    }

    // 3. Retos demo (solo si el ID no existe)
    for (const r of RETOS_DEMO) {
      const existente = await this.retoRepo.obtenerPorId(r.id);
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
        await this.retoRepo.guardar(nuevoReto);
        retosCreados++;
      }
    }

    return { usuariosCreados, lugaresCreados, retosCreados };
  }
}

/**
 * Función de conveniencia para inicializar tablas y poblar la base de datos activa.
 * Garantiza que al iniciar el servidor por primera vez, cree las tablas automáticamente si no existen
 * y pueble los lugares, retos y usuarios de prueba.
 * @param {import('../providers/postgresProvider.js').PostgresProvider} [provider=null]
 * @returns {Promise<{ usuariosCreados: number, lugaresCreados: number, retosCreados: number }>}
 */
export async function poblarDatosIniciales(provider = null) {
  const activeProvider = provider || getDatabaseProvider();

  // Asegurar que las tablas existan antes de sembrar los datos
  if (typeof activeProvider.inicializarTablas === 'function') {
    await activeProvider.inicializarTablas();
  }

  const factory = new SeedFactory({ provider: activeProvider });
  return await factory.poblarSiEsNecesario();
}