/**
 * scripts/seed.js
 * 
 * Script de línea de comandos para sembrar datos iniciales de forma idempotente en PostgreSQL.
 */

import 'dotenv/config';
import { getDatabaseProvider } from '../data/providers/postgresProvider.js';
import { poblarDatosIniciales } from '../data/factories/seedFactory.js';

async function runSeed() {
  console.log('🌱 Conectando a PostgreSQL y ejecutando siembra de datos de prueba...');
  const provider = getDatabaseProvider(process.env.DATABASE_URL);
  await provider.verificarConexion();
  await provider.inicializarTablas();
  const resultado = await poblarDatosIniciales(provider);

  console.log('✅ Siembra completada con éxito:');
  console.log(`   - Usuarios nuevos: ${resultado.usuariosCreados}`);
  console.log(`   - Lugares nuevos:  ${resultado.lugaresCreados}`);
  console.log(`   - Retos nuevos:    ${resultado.retosCreados}`);
  await provider.close();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Error ejecutando semilla:', err);
  process.exit(1);
});
