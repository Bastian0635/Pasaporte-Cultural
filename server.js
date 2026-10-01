/**
 * server.js
 * 
 * Punto de entrada del servidor Pasaporte Cultural.
 * Inicializa la persistencia base, aplica el seed reproducible y levanta el servidor HTTP.
 */

import app from './app.js';
import { APP_CONFIG } from './core/constants.js';
import { poblarDatosIniciales } from './data/factories/seedFactory.js';
import { getDatabaseProvider } from './data/providers/sqliteProvider.js';

// Inicializar persistencia y datos de demostración si es necesario
const provider = getDatabaseProvider();
const statsSeed = poblarDatosIniciales(provider);

console.log('----------------------------------------------------');
console.log('🏛️  PASAPORTE CULTURAL - SISTEMA INICIADO');
console.log('----------------------------------------------------');
console.log(`📦 Persistencia: SQLite inicializada en ${provider.dbPath}`);
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
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`🌐 Interfaz web y panel de control: http://localhost:${PORT}`);
  console.log('----------------------------------------------------');
});
