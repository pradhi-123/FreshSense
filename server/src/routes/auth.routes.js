import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  const { role = 'artisan', identifier = '', password = '' } = req.body || {};

  const cleanId = (identifier || '').trim();
  const cleanPass = (password || '').trim();

  // Accept any non-empty login input for seamless prototype access
  if (cleanId.length > 0 && cleanPass.length > 0) {
    return res.json({
      ok: true,
      user: {
        id: 'karigar_001',
        name: cleanId.includes('@') ? cleanId.split('@')[0] : 'Ramu Karigar',
        role: role || 'artisan',
        craft: 'Kanchipuram Silk Weaving',
        cluster: 'Kanchipuram, Tamil Nadu',
      },
    });
  }

  // Fallback demo user default
  return res.json({
    ok: true,
    user: {
      id: 'karigar_001',
      name: 'Ramu Karigar',
      role: 'artisan',
      craft: 'Kanchipuram Silk Weaving',
      cluster: 'Kanchipuram, Tamil Nadu',
    },
  });
});

export default router;
