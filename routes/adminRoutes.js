/**
 * routes/adminRoutes.js
 * 
 * Rutas protegidas para validación de roles y permisos editoriales.
 */

import { Router } from 'express';
import { requerirEditor, requerirSesion } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * Endpoint de prueba protegido: Solo accesible por rol 'editor'.
 * Un visitante que intente usar directamente una operación de editor recibe 403.
 */
router.get('/check', requerirEditor, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Autorización concedida: Eres editor.',
    usuario: req.usuario.toJSON()
  });
});

/**
 * Endpoint protegido para cualquier usuario identificado (visitante o editor).
 */
router.get('/usuario-area', requerirSesion, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Acceso permitido a usuario autenticado.',
    usuario: req.usuario.toJSON()
  });
});

export default router;
