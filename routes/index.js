/**
 * routes/index.js
 * 
 * Agregador principal de rutas de la API.
 */

import { Router } from 'express';
import accessRoutes from './accessRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/access', accessRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    sprint: 'Sprint 1 - Cimientos, Modelos y Control de Acceso'
  });
});

export default router;
