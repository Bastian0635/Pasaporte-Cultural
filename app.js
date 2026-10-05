/**
 * app.js
 * 
 * Configuración de la aplicación Express: middlewares globales, CORS, rutas y manejo de errores.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { getSesionService } from './data/services/sesionService.js';
import { getDatabaseProvider } from './data/providers/postgresProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(customProvider = null) {
  const app = express();

  const provider = customProvider || getDatabaseProvider();
  const sesionService = getSesionService(provider);

  // Inyectar servicios en la app para acceso en middlewares/controladores
  app.set('provider', provider);
  app.set('sesionService', sesionService);

  // 1. Configuración de CORS (debe preceder el montaje de rutas /api)
  app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // 2. Middlewares estándar
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Servir archivos estáticos para la interfaz visual
  app.use(express.static(path.join(__dirname, 'public')));

  // 3. Rutas API
  app.use('/api', apiRoutes);

  // Manejador centralizado de errores
  app.use(errorHandler);

  return app;
}

const app = createApp();
export default app;
