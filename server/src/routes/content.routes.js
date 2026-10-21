import { Router } from 'express';
import { getLandingContent } from '../controllers/content.controller.js';

const router = Router();

router.get('/landing', getLandingContent);

export default router;
