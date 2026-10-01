/**
 * routes/accessRoutes.js
 * 
 * Rutas para el flujo de autenticación, sesión y acceso.
 */

import { Router } from 'express';
import { accessController } from '../modules/access/accessController.js';
import { soloInvitado, requerirSesion } from '../middlewares/authMiddleware.js';

const router = Router();

// Login (solo accesible sin sesión activa o devuelve estado)
router.post('/login', accessController.login);

// Logout (requiere sesión o limpia cookies)
router.post('/logout', accessController.logout);

// Consulta del usuario actual (Sesión.usuarioActual)
router.get('/me', accessController.obtenerUsuarioActual);

// Usuarios de prueba para agilizar demostración de roles
router.get('/demo-users', accessController.obtenerUsuariosDemo);

export default router;
