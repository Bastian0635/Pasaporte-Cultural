/**
 * server.js
 * 
 * Punto de entrada del servidor Pasaporte Cultural.
 * Inicializa la persistencia base PostgreSQL, aplica el seed reproducible y levanta el servidor HTTP.
 */

import 'dotenv/config';
import app from './app.js';
import { APP_CONFIG } from './core/constants.js';
import { poblarDatosIniciales } from './data/factories/seedFactory.js';
import { getDatabaseProvider } from './data/providers/postgresProvider.js';

async function bootstrap() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn('⚠️  ADVERTENCIA: Variable DATABASE_URL no encontrada en el entorno/.env. Usando conexión por defecto.');
    }

    // Inicializar persistencia y verificar conexión asíncrona a PostgreSQL
    const provider = getDatabaseProvider(databaseUrl);
    await provider.verificarConexion();
    await provider.inicializarTablas();

    // Poblar datos iniciales si no existen
    const statsSeed = await poblarDatosIniciales(provider);

    console.log('----------------------------------------------------');
    console.log('🏛️  PASAPORTE CULTURAL - SISTEMA INICIADO');
    console.log('----------------------------------------------------');
    console.log(`📦 Persistencia: PostgreSQL conectada en localhost:5432 / Pasaporte_Cultural`);
    console.log(`🌱 Semilla inicial:`);
    console.log(`   - Usuarios creados: ${statsSeed.usuariosCreados}`);
    console.log(`   - Lugares creados:  ${statsSeed.lugaresCreados}`);
    console.log(`   - Retos creados:    ${statsSeed.retosCreados}`);
    console.log('----------------------------------------------------');
    console.log('👤 Usuarios de demostración listos:');
    console.log('   1. Visitante: visitante@pasaporte.com / Visitante123!');
    console.log('   2. Editor:    editor@pasaporte.com    / Editor123!');
    console.log('----------------------------------------------------');

    const PORT = APP_CONFIG.PORT;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
      console.log(`🌐 Interfaz web y panel de control: http://localhost:${PORT}`);
      console.log('----------------------------------------------------');
    });

    return server;
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor con PostgreSQL:', error);
    process.exit(1);
  }
}

bootstrap();