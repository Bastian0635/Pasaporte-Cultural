/**
 * data/factories/demoData.js
 * 
 * Datos de demostración iniciales para Pasaporte Cultural:
 * - 2 usuarios de prueba (1 visitante, 1 editor)
 * - 12 lugares divididos entre museo, galería y centro cultural
 * - 3 retos (con al menos uno activo en el período actual)
 */

import { ROLES, CATEGORIAS } from '../../core/constants.js';

export const USUARIOS_DEMO = [
  {
    id: 'usr-visitante-01',
    nombre: 'Carlos Visitante',
    email: 'visitante@pasaporte.com',
    password: 'Visitante123!',
    rol: ROLES.VISITANTE
  },
  {
    id: 'usr-editor-01',
    nombre: 'Elena Editora',
    email: 'editor@pasaporte.com',
    password: 'Editor123!',
    rol: ROLES.EDITOR
  }
];

export const LUGARES_DEMO = [
  // --- MUSEOS (4) ---
  {
    id: 'lug-museo-01',
    nombre: 'Museo del Oro',
    categoria: CATEGORIAS.MUSEO,
    municipio: 'Bogotá',
    direccion: 'Carrera 6 # 15-88, Parque Santander',
    descripcion: 'Alberga una de las mayores colecciones de orfebrería prehispánica del mundo, con piezas maestras de las culturas Muisca, Calima, Quimbaya y Tairona.',
    horario: 'Martes a sábado de 9:00 a.m. a 7:00 p.m., domingos de 10:00 a.m. a 5:00 p.m.',
    imagen: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'ORO-BOG-01',
    activo: true
  },
  {
    id: 'lug-museo-02',
    nombre: 'Museo de Antioquia',
    categoria: CATEGORIAS.MUSEO,
    municipio: 'Medellín',
    direccion: 'Calle 52 # 52-43, Plaza Botero',
    descripcion: 'Institución emblemática que custodia la más amplia colección donada por el maestro Fernando Botero, junto a obras de artistas nacionales e internacionales.',
    horario: 'Lunes a sábado de 10:00 a.m. a 5:30 p.m.',
    imagen: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'ANT-MED-02',
    activo: true
  },
  {
    id: 'lug-museo-03',
    nombre: 'Museo Nacional de Colombia',
    categoria: CATEGORIAS.MUSEO,
    municipio: 'Bogotá',
    direccion: 'Carrera 7 # 28-66',
    descripcion: 'El museo más antiguo de Colombia, emplazado en la histórica edificación panóptica, con colecciones de arte, historia, arqueología y etnografía.',
    horario: 'Martes a domingo de 9:00 a.m. a 5:00 p.m.',
    imagen: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'NAC-BOG-03',
    activo: true
  },
  {
    id: 'lug-museo-04',
    nombre: 'Museo de Arte Moderno de Medellín (MAMM)',
    categoria: CATEGORIAS.MUSEO,
    municipio: 'Medellín',
    direccion: 'Carrera 44 # 19A-100, Ciudad del Río',
    descripcion: 'Epicentro del arte moderno y contemporáneo antioqueño, con exposiciones temporales, cine independiente y la colección Débora Arango.',
    horario: 'Martes a viernes de 11:00 a.m. a 7:00 p.m., fines de semana de 11:00 a.m. a 6:00 p.m.',
    imagen: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'MAMM-MED-04',
    activo: true
  },

  // --- GALERÍAS (4) ---
  {
    id: 'lug-galeria-01',
    nombre: 'Galería Casas Riegner',
    categoria: CATEGORIAS.GALERIA,
    municipio: 'Bogotá',
    direccion: 'Calle 70A # 7-30, Quinta Camacho',
    descripcion: 'Espacio de vanguardia enfocado en artistas emergentes y consolidados que investigan prácticas conceptuales e históricas colombianas.',
    horario: 'Lunes a viernes de 10:00 a.m. a 6:00 p.m., sábados de 10:00 a.m. a 2:00 p.m.',
    imagen: 'https://images.unsplash.com/photo-1577720643272-265f09367456?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'CAS-BOG-05',
    activo: true
  },
  {
    id: 'lug-galeria-02',
    nombre: 'Galería Lokkus Arte Contemporáneo',
    categoria: CATEGORIAS.GALERIA,
    municipio: 'Medellín',
    direccion: 'Carrera 36 # 10A-35, El Poblado',
    descripcion: 'Plataforma para el pensamiento crítico contemporáneo, conectando creadores locales con curadurías interdisciplinarias.',
    horario: 'Martes a viernes de 10:00 a.m. a 6:00 p.m., sábados de 11:00 a.m. a 4:00 p.m.',
    imagen: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'LOK-MED-06',
    activo: true
  },
  {
    id: 'lug-galeria-03',
    nombre: 'Galería La Cometa',
    categoria: CATEGORIAS.GALERIA,
    municipio: 'Bogotá',
    direccion: 'Carrera 10 # 94A-25, Chicó',
    descripcion: 'Una de las galerías pioneras en la proyección del arte latinoamericano contemporáneo y moderno con presencia internacional.',
    horario: 'Lunes a viernes de 10:00 a.m. a 7:00 p.m., sábados de 11:00 a.m. a 4:00 p.m.',
    imagen: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'COM-BOG-07',
    activo: true
  },
  {
    id: 'lug-galeria-04',
    nombre: 'Galería Espacio El Dorado',
    categoria: CATEGORIAS.GALERIA,
    municipio: 'Bogotá',
    direccion: 'Carrera 4A # 26C-49, La Macarena',
    descripcion: 'Proyecto arquitectónico y cultural dedicado a exposiciones de gran formato, debate cultural y proyectos editoriales.',
    horario: 'Martes a sábado de 11:00 a.m. a 6:00 p.m.',
    imagen: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'ELD-BOG-08',
    activo: true
  },

  // --- CENTROS CULTURALES (4) ---
  {
    id: 'lug-centro-01',
    nombre: 'Centro Cultural Gabriel García Márquez',
    categoria: CATEGORIAS.CENTRO_CULTURAL,
    municipio: 'Bogotá',
    direccion: 'Calle 11 # 5-60, La Candelaria',
    descripcion: 'Magnífica obra diseñada por Rogelio Salmona que reúne librería, auditorios, salas de exposiciones y actividades literarias en honor a Gabo.',
    horario: 'Lunes a sábado de 9:00 a.m. a 7:00 p.m., domingos de 10:30 a.m. a 5:00 p.m.',
    imagen: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'GGM-BOG-09',
    activo: true
  },
  {
    id: 'lug-centro-02',
    nombre: 'Parque Explora y Centro Cultural',
    categoria: CATEGORIAS.CENTRO_CULTURAL,
    municipio: 'Medellín',
    direccion: 'Carrera 53 # 73-75, Zona Norte',
    descripcion: 'Espacio interactivo de divulgación científica, tecnológica y artística con acuario de agua dulce y talleres comunitarios.',
    horario: 'Martes a viernes de 8:30 a.m. a 5:30 p.m., fines de semana de 10:00 a.m. a 6:30 p.m.',
    imagen: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'EXP-MED-10',
    activo: true
  },
  {
    id: 'lug-centro-03',
    nombre: 'Centro de Memoria, Paz y Reconciliación',
    categoria: CATEGORIAS.CENTRO_CULTURAL,
    municipio: 'Bogotá',
    direccion: 'Carrera 19B # 24-86',
    descripcion: 'Lugar de encuentro pedagógico y conmemorativo dedicado a la reflexión sobre el patrimonio social y la paz.',
    horario: 'Lunes a viernes de 9:00 a.m. a 5:00 p.m., sábados de 9:00 a.m. a 1:00 p.m.',
    imagen: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'MEM-BOG-11',
    activo: true
  },
  {
    id: 'lug-centro-04',
    nombre: 'Centro Cultural Banco de la República',
    categoria: CATEGORIAS.CENTRO_CULTURAL,
    municipio: 'Cartagena',
    direccion: 'Calle de las Damas # 3-28, Centro Amurallado',
    descripcion: 'Mansión colonial restaurada con museo del oro Zenú, biblioteca especializada y conciertos de cámara.',
    horario: 'Martes a sábado de 9:00 a.m. a 5:00 p.m.',
    imagen: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    codigoRegistro: 'BRC-CTG-12',
    activo: true
  }
];

export const RETOS_DEMO = [
  {
    id: 'ret-museos-2026',
    titulo: 'Conoce tres museos distintos durante el ciclo cultural',
    descripcion: 'Explora y registra tu visita en al menos 3 museos para completar tu primer sello mayor del pasaporte.',
    categoria: CATEGORIAS.MUSEO,
    meta: 3,
    fechaInicio: '2026-01-01',
    fechaFin: '2026-12-31',
    activo: true
  },
  {
    id: 'ret-galerias-otoño',
    titulo: 'Circuito de galerías de arte contemporáneo',
    descripcion: 'Sumérgete en la creatividad actual visitando 2 galerías del circuito cultural.',
    categoria: CATEGORIAS.GALERIA,
    meta: 2,
    fechaInicio: '2026-09-01',
    fechaFin: '2026-11-30',
    activo: true
  },
  {
    id: 'ret-centros-verano',
    titulo: 'Ruta de centros culturales de temporada',
    descripcion: 'Reto finalizado correspondiente a la temporada pasada para verificar el historial de retos.',
    categoria: CATEGORIAS.CENTRO_CULTURAL,
    meta: 3,
    fechaInicio: '2026-01-01',
    fechaFin: '2026-12-31',
    activo: true
  }
];
