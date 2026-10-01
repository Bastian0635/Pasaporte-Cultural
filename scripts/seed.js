/**
 * scripts/seed.js
 * 
 * Script de línea de comandos para sembrar datos iniciales de forma idempotente.
 */

import { getDatabaseProvider } from '../data/providers/sqliteProvider.js';
import { poblarDatosIniciales } from '../data/factories/seedFactory.js';

console.log('🌱 Ejecutando siembra de datos de prueba...');
const provider = getDatabaseProvider();
const resultado = poblarDatosIniciales(provider);

console.log('✅ Siembra completada con éxito:');
console.log(`   - Usuarios nuevos: ${resultado.usuariosCreados}`);
console.log(`   - Lugares nuevos:  ${resultado.lugaresCreados}`);
console.log(`   - Retos nuevos:    ${resultado.retosCreados}`);
process.exit(0);
