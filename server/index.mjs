import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import {
  getSiteConfig,
  saveSiteConfig,
  getSiteSummary,
  getContactInfo,
  getLocation,
  getSocialLinks,
  getSiteLinks,
  getReviews,
  createReview,
  createContactSubmission,
  createCourseEnrollment,
  getSpecialists,
  createSpecialist,
  updateSpecialist,
  deleteSpecialist,
  getPortfolioItems,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getCourse,
  updateCourse,
  createCourseFeature,
  updateCourseFeature,
  deleteCourseFeature,
  createCourseHighlight,
  updateCourseHighlight,
  deleteCourseHighlight,
  createCourseExtraInfo,
  updateCourseExtraInfo,
  deleteCourseExtraInfo,
} from './siteRepository.mjs';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || new URL('./.env', import.meta.url).pathname });

const app = express();
const port = Number(process.env.PORT || 5175);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const safeExtension = extension || '.png';
    callback(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExtension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
      return;
    }

    callback(new Error('Apenas imagens são permitidas'));
  },
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir));

const badRequest = (res, message) => res.status(400).json({ error: message });

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/site', async (_req, res) => {
  try {
    const site = await getSiteSummary();
    res.json(site);
  } catch (error) {
    console.error('Erro ao carregar site', error);
    res.status(500).json({ error: 'Falha ao carregar site' });
  }
});

app.get('/api/site-config', async (_req, res) => {
  try {
    const config = await getSiteConfig();
    res.json(config);
  } catch (error) {
    console.error('Erro ao carregar configuracao', error);
    res.status(500).json({ error: 'Falha ao carregar configuracao' });
  }
});

app.put('/api/site-config', async (req, res) => {
  try {
    await saveSiteConfig(req.body);
    const config = await getSiteConfig();
    res.json(config);
  } catch (error) {
    console.error('Erro ao salvar configuracao', error);
    res.status(500).json({ error: 'Falha ao salvar configuracao' });
  }
});

app.post('/api/uploads', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return badRequest(res, 'Arquivo não enviado');
    }

    res.status(201).json({
      url: `/uploads/${req.file.filename}`,
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error('Erro ao enviar arquivo', error);
    res.status(500).json({ error: error.message || 'Falha ao enviar arquivo' });
  }
});

app.get('/api/contact-info', async (_req, res) => {
  try {
    const info = await getContactInfo();
    res.json(info);
  } catch (error) {
    console.error('Erro ao carregar contatos', error);
    res.status(500).json({ error: 'Falha ao carregar contatos' });
  }
});

app.get('/api/location', async (_req, res) => {
  try {
    const location = await getLocation();
    res.json(location);
  } catch (error) {
    console.error('Erro ao carregar localizacao', error);
    res.status(500).json({ error: 'Falha ao carregar localizacao' });
  }
});

app.get('/api/social-links', async (_req, res) => {
  try {
    const links = await getSocialLinks();
    res.json(links);
  } catch (error) {
    console.error('Erro ao carregar redes sociais', error);
    res.status(500).json({ error: 'Falha ao carregar redes sociais' });
  }
});

app.get('/api/site-links', async (req, res) => {
  try {
    const placement = typeof req.query.placement === 'string' ? req.query.placement : null;
    const links = await getSiteLinks(placement);
    res.json(links);
  } catch (error) {
    console.error('Erro ao carregar links do site', error);
    res.status(500).json({ error: 'Falha ao carregar links do site' });
  }
});

app.get('/api/reviews', async (_req, res) => {
  try {
    const reviews = await getReviews();
    res.json(reviews);
  } catch (error) {
    console.error('Erro ao carregar avaliacoes', error);
    res.status(500).json({ error: 'Falha ao carregar avaliacoes' });
  }
});

app.post('/api/reviews', async (req, res) => {
  const { name, rating, comment } = req.body || {};
  if (!name || !comment || typeof rating === 'undefined') {
    return badRequest(res, 'Dados invalidos');
  }
  if (Number(rating) < 1 || Number(rating) > 5) {
    return badRequest(res, 'Avaliacao invalida');
  }

  try {
    await createReview({ name, rating, comment });
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Erro ao criar avaliacao', error);
    res.status(500).json({ error: 'Falha ao criar avaliacao' });
  }
});

app.post('/api/contact-submissions', async (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name || !email || !message) {
    return badRequest(res, 'Dados invalidos');
  }

  try {
    await createContactSubmission({ name, email, phone, message });
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Erro ao salvar contato', error);
    res.status(500).json({ error: 'Falha ao salvar contato' });
  }
});

app.post('/api/course-enrollments', async (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name || !email) {
    return badRequest(res, 'Dados invalidos');
  }

  try {
    await createCourseEnrollment({ name, email, phone, message });
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Erro ao salvar inscricao', error);
    res.status(500).json({ error: 'Falha ao salvar inscricao' });
  }
});

// ============= SPECIALISTS ENDPOINTS =============
app.get('/api/specialists', async (_req, res) => {
  try {
    const specialists = await getSpecialists();
    res.json(specialists);
  } catch (error) {
    console.error('Erro ao carregar especialistas', error);
    res.status(500).json({ error: 'Falha ao carregar especialistas' });
  }
});

app.post('/api/specialists', async (req, res) => {
  const { name, specialty, imageUrl, experience, instagram, whatsapp } = req.body || {};
  if (!name || !specialty || !imageUrl) {
    return badRequest(res, 'Nome, especialidade e imagem são obrigatórios');
  }

  try {
    const id = await createSpecialist({ name, specialty, imageUrl, experience, instagram, whatsapp });
    res.status(201).json({ id, ok: true });
  } catch (error) {
    console.error('Erro ao criar especialista', error);
    res.status(500).json({ error: error.message || 'Falha ao criar especialista' });
  }
});

app.put('/api/specialists/:id', async (req, res) => {
  const { id } = req.params;
  const { name, specialty, imageUrl, experience, instagram, whatsapp, sortOrder, isActive } = req.body || {};

  try {
    await updateSpecialist(id, { name, specialty, imageUrl, experience, instagram, whatsapp, sortOrder, isActive });
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao atualizar especialista', error);
    res.status(500).json({ error: error.message || 'Falha ao atualizar especialista' });
  }
});

app.delete('/api/specialists/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await deleteSpecialist(id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao deletar especialista', error);
    res.status(500).json({ error: 'Falha ao deletar especialista' });
  }
});

// ============= PORTFOLIO ENDPOINTS =============
app.get('/api/portfolio', async (_req, res) => {
  try {
    const items = await getPortfolioItems();
    res.json(items);
  } catch (error) {
    console.error('Erro ao carregar portfolio', error);
    res.status(500).json({ error: 'Falha ao carregar portfolio' });
  }
});

app.post('/api/portfolio', async (req, res) => {
  const { title, style, imageUrl } = req.body || {};
  if (!title || !imageUrl) {
    return badRequest(res, 'Título e imagem são obrigatórios');
  }

  try {
    const id = await createPortfolioItem({ title, style, imageUrl });
    res.status(201).json({ id, ok: true });
  } catch (error) {
    console.error('Erro ao criar portfolio item', error);
    res.status(500).json({ error: error.message || 'Falha ao criar portfolio item' });
  }
});

app.put('/api/portfolio/:id', async (req, res) => {
  const { id } = req.params;
  const { title, style, imageUrl, sortOrder, isPublished } = req.body || {};

  try {
    await updatePortfolioItem(id, { title, style, imageUrl, sortOrder, isPublished });
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao atualizar portfolio item', error);
    res.status(500).json({ error: error.message || 'Falha ao atualizar portfolio item' });
  }
});

app.delete('/api/portfolio/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await deletePortfolioItem(id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao deletar portfolio item', error);
    res.status(500).json({ error: 'Falha ao deletar portfolio item' });
  }
});

// ============= COURSE ENDPOINTS =============
app.get('/api/course', async (_req, res) => {
  try {
    const course = await getCourse();
    res.json(course || {});
  } catch (error) {
    console.error('Erro ao carregar curso', error);
    res.status(500).json({ error: 'Falha ao carregar curso' });
  }
});

app.put('/api/course', async (req, res) => {
  const { title, description, nextClass, price, priceNote } = req.body || {};

  try {
    const course = await getCourse();
    if (!course) {
      return badRequest(res, 'Nenhum curso configurado');
    }

    await updateCourse(course.id, { title, description, nextClass, price, priceNote });
    const updated = await getCourse();
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar curso', error);
    res.status(500).json({ error: error.message || 'Falha ao atualizar curso' });
  }
});

// ============= COURSE FEATURES ENDPOINTS =============
app.post('/api/course/features', async (req, res) => {
  const { title, description } = req.body || {};
  if (!title || !description) {
    return badRequest(res, 'Título e descrição são obrigatórios');
  }

  try {
    const course = await getCourse();
    if (!course) {
      return badRequest(res, 'Nenhum curso configurado');
    }

    const id = await createCourseFeature(course.id, { title, description });
    res.status(201).json({ id, ok: true });
  } catch (error) {
    console.error('Erro ao criar feature', error);
    res.status(500).json({ error: error.message || 'Falha ao criar feature' });
  }
});

app.put('/api/course/features/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, sortOrder } = req.body || {};

  try {
    await updateCourseFeature(id, { title, description, sortOrder });
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao atualizar feature', error);
    res.status(500).json({ error: error.message || 'Falha ao atualizar feature' });
  }
});

app.delete('/api/course/features/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await deleteCourseFeature(id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao deletar feature', error);
    res.status(500).json({ error: 'Falha ao deletar feature' });
  }
});

// ============= COURSE HIGHLIGHTS ENDPOINTS =============
app.post('/api/course/highlights', async (req, res) => {
  const { text } = req.body || {};
  if (!text) {
    return badRequest(res, 'Texto é obrigatório');
  }

  try {
    const course = await getCourse();
    if (!course) {
      return badRequest(res, 'Nenhum curso configurado');
    }

    const id = await createCourseHighlight(course.id, { text });
    res.status(201).json({ id, ok: true });
  } catch (error) {
    console.error('Erro ao criar highlight', error);
    res.status(500).json({ error: error.message || 'Falha ao criar highlight' });
  }
});

app.put('/api/course/highlights/:id', async (req, res) => {
  const { id } = req.params;
  const { text, sortOrder } = req.body || {};

  try {
    await updateCourseHighlight(id, { text, sortOrder });
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao atualizar highlight', error);
    res.status(500).json({ error: error.message || 'Falha ao atualizar highlight' });
  }
});

app.delete('/api/course/highlights/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await deleteCourseHighlight(id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao deletar highlight', error);
    res.status(500).json({ error: 'Falha ao deletar highlight' });
  }
});

// ============= COURSE EXTRA INFO ENDPOINTS =============
app.post('/api/course/extra-info', async (req, res) => {
  const { text } = req.body || {};
  if (!text) {
    return badRequest(res, 'Texto é obrigatório');
  }

  try {
    const course = await getCourse();
    if (!course) {
      return badRequest(res, 'Nenhum curso configurado');
    }

    const id = await createCourseExtraInfo(course.id, { text });
    res.status(201).json({ id, ok: true });
  } catch (error) {
    console.error('Erro ao criar informação extra', error);
    res.status(500).json({ error: error.message || 'Falha ao criar informação extra' });
  }
});

app.put('/api/course/extra-info/:id', async (req, res) => {
  const { id } = req.params;
  const { text, sortOrder } = req.body || {};

  try {
    await updateCourseExtraInfo(id, { text, sortOrder });
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao atualizar informação extra', error);
    res.status(500).json({ error: error.message || 'Falha ao atualizar informação extra' });
  }
});

app.delete('/api/course/extra-info/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await deleteCourseExtraInfo(id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao deletar informação extra', error);
    res.status(500).json({ error: 'Falha ao deletar informação extra' });
  }
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
