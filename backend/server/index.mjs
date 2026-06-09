import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import ffmpegPath from 'ffmpeg-static';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { pool } from './db.mjs';
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
  getJewelryItems,
  createJewelryItem,
  updateJewelryItem,
  deleteJewelryItem,
  createJewelryOrder,
  getJewelryOrders,
  updateJewelryOrderStatus,
  getSiteSettings,
  setSiteSetting,
  getJewelrySales,
} from './siteRepository.mjs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = process.env.DOTENV_CONFIG_PATH || path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const app = express();
const port = Number(process.env.PORT || 5175);
const projectRoot = path.resolve(__dirname, '..');
const adminMediaDir = path.join(projectRoot, 'imagens', 'videos admin');

const storage = multer.memoryStorage();

const runCommand = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `ffmpeg saiu com código ${code}`));
    });
  });

const transcodeVideoBuffer = async (file) => {
  if (!ffmpegPath) {
    throw new Error('Transcodificador de vídeo indisponível');
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'site-tatto-'));
  const inputPath = path.join(tempDir, `input${path.extname(file.originalname || '') || '.bin'}`);
  const outputPath = path.join(tempDir, 'output.mp4');

  try {
    await fs.writeFile(inputPath, file.buffer);
    await runCommand(ffmpegPath, [
      '-y',
      '-i', inputPath,
      '-movflags', '+faststart',
      '-pix_fmt', 'yuv420p',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '28',
      '-c:a', 'aac',
      '-b:a', '128k',
      outputPath,
    ]);

    const data = await fs.readFile(outputPath);
    return {
      buffer: data,
      filename: `${path.parse(file.originalname || 'video').name}.mp4`,
      mimetype: 'video/mp4',
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      callback(null, true);
      return;
    }

    callback(new Error('Apenas imagens e vídeos são permitidos'));
  },
});

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((o) => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS bloqueado'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use('/admin-media', express.static(adminMediaDir));

const badRequest = (res, message) => res.status(400).json({ error: message });

const ensureAdminMediaDir = async () => {
  await fs.mkdir(adminMediaDir, { recursive: true });
};

const ensureSiteId = async () => {
  const result = await pool.query('SELECT id FROM app.site ORDER BY created_at LIMIT 1');
  if (result.rowCount > 0) {
    return result.rows[0].id;
  }

  const inserted = await pool.query(
    'INSERT INTO app.site (name, domain) VALUES ($1, $2) RETURNING id',
    ['Studios Tatto', null]
  );
  return inserted.rows[0].id;
};

const safeDiskFilename = (filename, mimetype) => {
  const parsed = path.parse(filename || 'arquivo');
  const base = parsed.name
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'arquivo';
  const extension = parsed.ext || (String(mimetype || '').startsWith('video/') ? '.mp4' : '.bin');
  return `${Date.now()}-${base}${extension}`;
};

const mimeByExtension = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.mp4', 'video/mp4'],
  ['.mov', 'video/quicktime'],
  ['.webm', 'video/webm'],
]);

const extensionByMime = new Map([
  ['image/png', '.png'],
  ['image/jpeg', '.jpg'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
  ['video/mp4', '.mp4'],
  ['video/quicktime', '.mov'],
  ['video/webm', '.webm'],
]);

const detectMimeType = (filename) => {
  const extension = path.extname(filename || '').toLowerCase();
  return mimeByExtension.get(extension) || 'application/octet-stream';
};

const buildDiskFilename = (originalName, mimetype, id) => {
  const parsed = path.parse(originalName || 'arquivo');
  const base = parsed.name
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || (id ? String(id).slice(0, 8) : 'arquivo');
  const ext = parsed.ext || extensionByMime.get(String(mimetype || '').toLowerCase()) || '.bin';
  return `${base}-${id || Date.now()}${ext}`;
};

const ingestAdminMediaFiles = async () => {
  let entries = [];
  try {
    entries = await fs.readdir(adminMediaDir, { withFileTypes: true });
  } catch (error) {
    console.warn('Nao foi possivel ler a pasta de midia do admin', error);
    return { inserted: 0, skipped: 0 };
  }

  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  if (files.length === 0) {
    return { inserted: 0, skipped: 0 };
  }

  const existing = await pool.query(
    'SELECT disk_filename FROM app.media_asset WHERE disk_filename IS NOT NULL'
  );
  const existingNames = new Set(existing.rows.map((row) => row.disk_filename));
  const siteId = await ensureSiteId();
  let inserted = 0;
  let skipped = 0;

  for (const filename of files) {
    if (existingNames.has(filename)) {
      skipped += 1;
      continue;
    }

    const diskPath = path.join(adminMediaDir, filename);
    const mimetype = detectMimeType(filename);

    await pool.query(
      'INSERT INTO app.media_asset (site_id, filename, mimetype, disk_filename, disk_path) VALUES ($1, $2, $3, $4, $5)',
      [siteId, filename, mimetype, filename, diskPath]
    );
    inserted += 1;
  }

  return { inserted, skipped };
};

const exportDatabaseMediaToDisk = async () => {
  await ensureAdminMediaDir();

  const result = await pool.query(
    'SELECT id, filename, mimetype, disk_filename, disk_path FROM app.media_asset ORDER BY created_at'
  );

  let exported = 0;
  let skipped = 0;

  for (const row of result.rows) {
    const existingFilename = row.disk_filename || '';
    const diskFilename = existingFilename || buildDiskFilename(row.filename, row.mimetype, row.id);
    const diskPath = path.join(adminMediaDir, diskFilename);

    try {
      await fs.access(diskPath);
      skipped += 1;
    } catch {
      const sizeResult = await pool.query(
        'SELECT octet_length(data) AS size FROM app.media_asset WHERE id = $1',
        [row.id]
      );
      const totalSize = Number(sizeResult.rows[0]?.size || 0);
      if (!totalSize) {
        skipped += 1;
        continue;
      }

      const chunkSize = 1024 * 1024;
      const fileHandle = await fs.open(diskPath, 'w');
      try {
        for (let offset = 0; offset < totalSize; offset += chunkSize) {
          const length = Math.min(chunkSize, totalSize - offset);
          const chunkResult = await pool.query(
            "SELECT encode(substring(data from $1 for $2), 'base64') AS chunk FROM app.media_asset WHERE id = $3",
            [offset + 1, length, row.id]
          );
          const chunkBase64 = chunkResult.rows[0]?.chunk;
          if (!chunkBase64) {
            continue;
          }
          const buffer = Buffer.from(chunkBase64, 'base64');
          await fileHandle.write(buffer);
        }
      } finally {
        await fileHandle.close();
      }

      exported += 1;
    }

    if (!existingFilename) {
      await pool.query(
        'UPDATE app.media_asset SET disk_filename = $1, disk_path = $2 WHERE id = $3',
        [diskFilename, diskPath, row.id]
      );
    }
  }

  return { exported, skipped };
};

const ensureDatabaseSchema = async () => {
  await pool.query('CREATE SCHEMA IF NOT EXISTS app');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app.media_asset (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
      filename text NOT NULL,
      mimetype text NOT NULL,
      data bytea NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await pool.query('ALTER TABLE app.media_asset ADD COLUMN IF NOT EXISTS disk_filename text');
  await pool.query('ALTER TABLE app.media_asset ADD COLUMN IF NOT EXISTS disk_path text');
  await pool.query('CREATE INDEX IF NOT EXISTS media_asset_disk_filename_idx ON app.media_asset (disk_filename)');
  // Tornar data nullable e limpar binários já armazenados em disco (evita OOM no pg_dump)
  await pool.query('ALTER TABLE app.media_asset ALTER COLUMN data DROP NOT NULL');
  await pool.query("UPDATE app.media_asset SET data = NULL WHERE disk_path IS NOT NULL AND disk_path <> '' AND data IS NOT NULL");

  await pool.query(`
    DO $$
    BEGIN
      IF to_regclass('app.specialist') IS NOT NULL THEN
        BEGIN
          ALTER TABLE app.specialist ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
        EXCEPTION WHEN undefined_table THEN
          NULL;
        END;
      END IF;
    END
    $$;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF to_regclass('app.portfolio_item') IS NOT NULL THEN
        BEGIN
          ALTER TABLE app.portfolio_item ADD COLUMN IF NOT EXISTS specialist_id uuid REFERENCES app.specialist(id) ON DELETE SET NULL;
        EXCEPTION WHEN undefined_table THEN
          NULL;
        END;
      END IF;
    END
    $$;
  `);
};

const bootstrapAdminMedia = async () => {
  await ensureAdminMediaDir();
  await exportDatabaseMediaToDisk();
  await ingestAdminMediaFiles();
};

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

app.put('/api/site-config', requireAdmin, async (req, res) => {
  try {
    await saveSiteConfig(req.body);
    const config = await getSiteConfig();
    res.json(config);
  } catch (error) {
    console.error('Erro ao salvar configuracao', error);
    res.status(500).json({ error: 'Falha ao salvar configuracao' });
  }
});

app.post('/api/uploads', requireAdmin, (req, res) => {
  upload.single('file')(req, res, async (error) => {
    if (error) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      console.error('Erro multer no upload:', error.message);
      return res.status(status).json({ error: error.message || 'Falha ao enviar arquivo' });
    }

    try {
      if (!req.file) {
        return badRequest(res, 'Arquivo não enviado');
      }

      const isMp4Video =
        req.file.mimetype === 'video/mp4' ||
        path.extname(req.file.originalname || '').toLowerCase() === '.mp4';

      const mediaFile = req.file.mimetype.startsWith('video/') && !isMp4Video
        ? await transcodeVideoBuffer(req.file)
        : {
            buffer: req.file.buffer,
            filename: req.file.originalname || (isMp4Video ? 'video.mp4' : 'arquivo'),
            mimetype: req.file.mimetype || (isMp4Video ? 'video/mp4' : 'application/octet-stream'),
          };

      await ensureAdminMediaDir();
      const diskFilename = safeDiskFilename(mediaFile.filename, mediaFile.mimetype);
      const diskPath = path.join(adminMediaDir, diskFilename);
      console.log('Upload: gravando arquivo em', diskPath);
      await fs.writeFile(diskPath, mediaFile.buffer);

      const siteId = await ensureSiteId();
      console.log('Upload: inserindo no DB, siteId=', siteId, 'arquivo=', diskFilename);
      const insertResult = await pool.query(
        'INSERT INTO app.media_asset (site_id, filename, mimetype, disk_filename, disk_path) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [siteId, mediaFile.filename, mediaFile.mimetype, diskFilename, diskPath]
      );
      const mediaId = insertResult.rows[0].id;
      console.log('Upload: sucesso, id=', mediaId);

      res.status(201).json({
        url: `/api/uploads/${mediaId}`,
        diskUrl: `/admin-media/${diskFilename}`,
        id: mediaId,
        name: mediaFile.filename,
        size: mediaFile.buffer.length,
        mimetype: mediaFile.mimetype,
      });
    } catch (uploadError) {
      console.error('Erro ao enviar arquivo', uploadError);
      res.status(500).json({ error: uploadError.message || 'Falha ao enviar arquivo' });
    }
  });
});

app.get('/api/uploads', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, filename, mimetype, created_at, disk_filename FROM app.media_asset ORDER BY created_at DESC LIMIT 200'
    );

    res.json(
      result.rows.map((row) => ({
        id: row.id,
        filename: row.filename,
        mimetype: row.mimetype,
        createdAt: row.created_at,
        url: `/api/uploads/${row.id}`,
        diskUrl: row.disk_filename ? `/admin-media/${row.disk_filename}` : null,
      }))
    );
  } catch (error) {
    console.error('Erro ao listar arquivos', error);
    res.status(500).json({ error: 'Falha ao listar arquivos' });
  }
});

app.post('/api/admin-media/ingest', async (_req, res) => {
  try {
    const result = await ingestAdminMediaFiles();
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('Erro ao ingerir midia do admin', error);
    res.status(500).json({ error: 'Falha ao ingerir midia do admin' });
  }
});

app.get('/api/uploads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT filename, mimetype, data, disk_path FROM app.media_asset WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    const media = result.rows[0];
    const safeFilename = String(media.filename || 'arquivo')
      .replace(/[\r\n"]/g, '_')
      .replace(/[^\x20-\x7E]/g, '_');
    res.setHeader('Content-Type', media.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);

    // Arquivo armazenado no banco (legado)
    if (media.data) {
      return res.send(media.data);
    }

    // Arquivo em disco — streaming com suporte a range requests (necessário para vídeo)
    if (media.disk_path) {
      const filePath = path.resolve(media.disk_path);
      try {
        const stat = await fs.stat(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
          const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
          const start = parseInt(startStr, 10);
          const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
          const chunkSize = end - start + 1;

          res.status(206);
          res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Content-Length', chunkSize);
          return createReadStream(filePath, { start, end }).pipe(res);
        }

        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', fileSize);
        return createReadStream(filePath).pipe(res);
      } catch {
        return res.status(404).json({ error: 'Arquivo não encontrado em disco' });
      }
    }

    return res.status(404).json({ error: 'Conteúdo do arquivo não encontrado' });
  } catch (error) {
    console.error('Erro ao recuperar arquivo', error);
    res.status(500).json({ error: 'Falha ao recuperar arquivo' });
  }
});

app.use((error, _req, res, next) => {
  if (!(error instanceof multer.MulterError)) {
    return next(error);
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Arquivo muito grande para envio' });
  }

  return res.status(400).json({ error: error.message || 'Falha ao enviar arquivo' });
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

const sanitize = (str) => String(str || '').replace(/<[^>]*>/g, '').trim();

app.post('/api/reviews', async (req, res) => {
  const name = sanitize(req.body?.name);
  const comment = sanitize(req.body?.comment);
  const { rating } = req.body || {};
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

const sendContactEmail = async ({ name, email, phone, message }) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const contactEmail = process.env.CONTACT_EMAIL || 'dannyverlima@gmail.com';
  if (!smtpUser || !smtpPass) {
    console.warn('Email não configurado: defina SMTP_USER e SMTP_PASS no .env');
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  });
  await transporter.sendMail({
    from: `"Studios Tatto" <${smtpUser}>`,
    to: contactEmail,
    replyTo: email,
    subject: `Nova mensagem de contato — ${name}`,
    text: `Nome: ${name}\nEmail: ${email}\nTelefone: ${phone || '—'}\n\n${message}`,
    html: `<p><strong>Nome:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Telefone:</strong> ${phone || '—'}</p><p><strong>Mensagem:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
  });
};

app.post('/api/contact-submissions', async (req, res) => {
  const name = sanitize(req.body?.name);
  const message = sanitize(req.body?.message);
  const { email, phone } = req.body || {};
  if (!name || !email || !phone || !message) {
    return badRequest(res, 'Todos os campos são obrigatórios');
  }

  try {
    await createContactSubmission({ name, email, phone, message });
    sendContactEmail({ name, email, phone, message }).catch((err) => {
      console.error('Falha ao enviar email de contato:', err.message);
    });
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

app.post('/api/specialists', requireAdmin, async (req, res) => {
  const { name, specialty, description, imageUrl, experience, instagram, whatsapp } = req.body || {};
  if (!name || !specialty || !imageUrl) {
    return badRequest(res, 'Nome, especialidade e imagem são obrigatórios');
  }

  try {
    const id = await createSpecialist({ name, specialty, description, imageUrl, experience, instagram, whatsapp });
    res.status(201).json({ id, ok: true });
  } catch (error) {
    console.error('Erro ao criar especialista', error);
    res.status(500).json({ error: error.message || 'Falha ao criar especialista' });
  }
});

app.put('/api/specialists/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, specialty, description, imageUrl, experience, instagram, whatsapp, sortOrder, isActive } = req.body || {};

  try {
    await updateSpecialist(id, { name, specialty, description, imageUrl, experience, instagram, whatsapp, sortOrder, isActive });
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao atualizar especialista', error);
    res.status(500).json({ error: error.message || 'Falha ao atualizar especialista' });
  }
});

app.delete('/api/specialists/:id', requireAdmin, async (req, res) => {
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

app.post('/api/portfolio', requireAdmin, async (req, res) => {
  const { title, style, imageUrl, specialistId } = req.body || {};
  if (!title || !imageUrl) {
    return badRequest(res, 'Título e imagem são obrigatórios');
  }

  try {
    const id = await createPortfolioItem({ title, style, imageUrl, specialistId });
    res.status(201).json({ id, ok: true });
  } catch (error) {
    console.error('Erro ao criar portfolio item', error);
    res.status(500).json({ error: error.message || 'Falha ao criar portfolio item' });
  }
});

app.put('/api/portfolio/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, style, imageUrl, sortOrder, isPublished, specialistId } = req.body || {};

  try {
    await updatePortfolioItem(id, { title, style, imageUrl, sortOrder, isPublished, specialistId });
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao atualizar portfolio item', error);
    res.status(500).json({ error: error.message || 'Falha ao atualizar portfolio item' });
  }
});

app.delete('/api/portfolio/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await deletePortfolioItem(id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao deletar portfolio item', error);
    res.status(500).json({ error: 'Falha ao deletar portfolio item' });
  }
});

// ============= JEWELRY STORE ENDPOINTS =============

// ---- Auth ----

const JWT_SECRET = process.env.JWT_SECRET || 'jewelry_secret_change_me_in_production';
const JWT_EXPIRES = '30d';

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Preencha todos os campos' });
    if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    const existing = await pool.query('SELECT id FROM app.jewelry_customer WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Este email já está cadastrado' });
    const hash = await bcryptjs.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO app.jewelry_customer (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name.trim(), email.toLowerCase().trim(), hash]
    );
    const user = result.rows[0];
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    console.error('Erro no cadastro:', err);
    res.status(500).json({ error: 'Erro interno ao criar conta' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Preencha email e senha' });
    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM app.jewelry_customer WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Email ou senha inválidos' });
    const user = result.rows[0];
    const valid = await bcryptjs.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email ou senha inválidos' });
    res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno ao autenticar' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Não autorizado' });
    const token = auth.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, name, email FROM app.jewelry_customer WHERE id = $1',
      [payload.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});
// ---- End Auth ----

// ============= ADMIN AUTH =============
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'admin_change_me';

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });
  try {
    req.adminPayload = jwt.verify(token, ADMIN_JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

app.post('/api/admin/login', (req, res) => {
  const { password, role } = req.body || {};
  const expectedPass = role === 'joalheria'
    ? (process.env.JOALHERIA_ADMIN_PASS || 'Admin@joia')
    : (process.env.ADMIN_PASS || 'Admin@tatto');
  if (!password || password !== expectedPass) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }
  const token = jwt.sign({ role: role || 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});
// ============= END ADMIN AUTH =============

app.get('/api/jewelry', async (req, res) => {
  try {
    const includeInactive = String(req.query.all || '') === '1';
    const featuredOnly = String(req.query.featured || '') === '1';
    const category = req.query.category ? String(req.query.category) : null;
    const items = await getJewelryItems({ includeInactive, featuredOnly, category });
    res.json(items);
  } catch (error) {
    console.error('Erro ao carregar joias', error);
    res.status(500).json({ error: 'Falha ao carregar joias' });
  }
});

app.post('/api/jewelry', requireAdmin, async (req, res) => {
  const { name, description, price, imageUrls, isActive, stock, discountPercent, isFeatured, category } = req.body || {};
  if (!name) {
    return badRequest(res, 'Nome é obrigatório');
  }

  try {
    const id = await createJewelryItem({ name, description, price, imageUrls, isActive, stock, discountPercent, isFeatured, category });
    res.status(201).json({ id, ok: true });
  } catch (error) {
    console.error('Erro ao criar joia', error);
    res.status(500).json({ error: error.message || 'Falha ao criar joia' });
  }
});

app.put('/api/jewelry/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, imageUrls, isActive, stock, discountPercent, isFeatured, category } = req.body || {};

  try {
    await updateJewelryItem(id, { name, description, price, imageUrls, isActive, stock, discountPercent, isFeatured, category });
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao atualizar joia', error);
    res.status(500).json({ error: error.message || 'Falha ao atualizar joia' });
  }
});

// ============= JEWELRY ORDERS ADMIN =============
app.get('/api/jewelry-orders', requireAdmin, async (_req, res) => {
  try {
    const orders = await getJewelryOrders();
    res.json(orders);
  } catch (error) {
    console.error('Erro ao carregar pedidos de joias', error);
    res.status(500).json({ error: 'Falha ao carregar pedidos' });
  }
});

app.put('/api/jewelry-orders/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) {
    return badRequest(res, 'Status é obrigatório');
  }
  try {
    await updateJewelryOrderStatus(id, { status });
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao atualizar pedido', error);
    res.status(500).json({ error: error.message || 'Falha ao atualizar pedido' });
  }
});

// ============= SITE SETTINGS =============
app.get('/api/site-settings', async (req, res) => {
  try {
    const keysParam = typeof req.query.keys === 'string' ? req.query.keys.split(',').filter(Boolean) : [];
    const settings = await getSiteSettings(keysParam);
    res.json(settings);
  } catch (error) {
    console.error('Erro ao carregar configuracoes', error);
    res.status(500).json({ error: 'Falha ao carregar configuracoes' });
  }
});

app.put('/api/site-settings', requireAdmin, async (req, res) => {
  const body = req.body || {};
  try {
    for (const [key, value] of Object.entries(body)) {
      await setSiteSetting(key, value);
    }
    const settings = await getSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error('Erro ao salvar configuracoes', error);
    res.status(500).json({ error: error.message || 'Falha ao salvar configuracoes' });
  }
});

// ============= JEWELRY SALES / FATURAMENTO =============
app.get('/api/jewelry-sales', requireAdmin, async (req, res) => {
  try {
    const months = Math.min(36, Math.max(1, Number(req.query.months || 12)));
    const data = await getJewelrySales({ months });
    res.json(data);
  } catch (error) {
    console.error('Erro ao carregar faturamento', error);
    res.status(500).json({ error: 'Falha ao carregar faturamento' });
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

app.put('/api/course', requireAdmin, async (req, res) => {
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
app.post('/api/course/features', requireAdmin, async (req, res) => {
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

app.put('/api/course/features/:id', requireAdmin, async (req, res) => {
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

app.delete('/api/course/features/:id', requireAdmin, async (req, res) => {
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
app.post('/api/course/highlights', requireAdmin, async (req, res) => {
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

app.put('/api/course/highlights/:id', requireAdmin, async (req, res) => {
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

app.delete('/api/course/highlights/:id', requireAdmin, async (req, res) => {
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
app.post('/api/course/extra-info', requireAdmin, async (req, res) => {
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

app.put('/api/course/extra-info/:id', requireAdmin, async (req, res) => {
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

app.delete('/api/course/extra-info/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await deleteCourseExtraInfo(id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Erro ao deletar informação extra', error);
    res.status(500).json({ error: 'Falha ao deletar informação extra' });
  }
});

const startServer = async () => {
  try {
    await ensureDatabaseSchema();
    app.listen(port, () => {
      console.log(`API rodando em http://localhost:${port}`);
    });
    bootstrapAdminMedia().catch((error) => {
      console.error('Falha ao sincronizar midias do admin', error);
    });
  } catch (error) {
    console.error('Falha ao iniciar API', error);
    process.exit(1);
  }
};

startServer();
