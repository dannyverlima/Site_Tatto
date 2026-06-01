import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const adminMediaDir = path.join(projectRoot, 'backend', 'imagens', 'videos admin');
const publicDir = path.join(projectRoot, 'frontend', 'public', 'gallery');

const API_URL = process.env.API_URL || 'http://localhost:5175/api';

// Garantir que o diretório public/gallery existe
async function ensurePublicDir() {
  try {
    await fs.mkdir(publicDir, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretório:', error.message);
  }
}

// Copiar imagens para public
async function copyImagesToPublic() {
  try {
    const files = await fs.readdir(adminMediaDir);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    
    console.log(`📋 Copiando ${imageFiles.length} imagens para public/gallery...`);
    
    for (const file of imageFiles) {
      const src = path.join(adminMediaDir, file);
      const dst = path.join(publicDir, file);
      
      try {
        await fs.copyFile(src, dst);
        console.log(`  ✓ ${file}`);
      } catch (error) {
        console.warn(`  ⚠ Erro ao copiar ${file}: ${error.message}`);
      }
    }
    
    console.log('✅ Imagens copiadas\n');
  } catch (error) {
    console.error('Erro ao copiar imagens:', error.message);
  }
}

// Obter especialistas
async function getSpecialists() {
  try {
    const res = await fetch(`${API_URL}/specialists`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.warn('⚠ Aviso: Não foi possível conectar à API:', error.message);
    return [];
  }
}

// Obter items de portfolio existentes
async function getPortfolioItems() {
  try {
    const res = await fetch(`${API_URL}/portfolio`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.warn('⚠ Aviso: Não foi possível conectar à API:', error.message);
    return [];
  }
}

// Criar item de portfolio
async function createPortfolioItem(item) {
  try {
    const res = await fetch(`${API_URL}/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    
    if (!res.ok) {
      console.error(`  ✗ Erro ao criar item: ${res.status} ${res.statusText}`);
      return false;
    }
    
    await res.json();
    console.log(`  ✓ Adicionado ao portfolio: ${item.title}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Erro ao criar item: ${error.message}`);
    return false;
  }
}

// Extrair nome do arquivo e criar título
function extractTitle(filename) {
  // Remove extensão
  let clean = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  // Remove UUID no final (padrão de UUID v4)
  clean = clean.replace(/-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i, '');
  // Substitui hífens e underscores por espaços
  const title = clean.replace(/[-_]/g, ' ').trim();
  // Capitaliza primeira letra de cada palavra
  return title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

// Main
async function main() {
  console.log('\n🎨 Iniciando adição de imagens ao portfolio...\n');
  console.log(`📁 Diretório de origem: ${adminMediaDir}`);
  console.log(`📁 Diretório de destino: ${publicDir}\n`);

  // Garantir que o diretório public existe
  await ensurePublicDir();

  // Obter lista de imagens
  let imageFiles = [];
  try {
    const files = await fs.readdir(adminMediaDir);
    imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  } catch (error) {
    console.error('❌ Erro ao ler diretório de imagens:', error.message);
    return;
  }

  if (imageFiles.length === 0) {
    console.log('ℹ️  Nenhuma imagem encontrada.');
    return;
  }

  console.log(`📸 Encontradas ${imageFiles.length} imagens\n`);

  // Copiar imagens para public
  await copyImagesToPublic();

  // Tentar conectar à API
  console.log('🔗 Conectando à API...');
  const specialists = await getSpecialists();
  const existing = await getPortfolioItems();
  const existingTitles = new Set(existing.map(item => item.title));

  if (specialists.length === 0 && existing.length === 0) {
    console.log('⚠️  Aviso: API não respondendo. Imagens foram copiadas para public/gallery');
    console.log('    Você pode:');
    console.log('    1. Iniciar o servidor com: npm run dev');
    console.log('    2. Executar novamente este script');
    return;
  }

  console.log(`👥 Especialistas: ${specialists.length}`);
  console.log(`📊 Items no portfolio: ${existing.length}\n`);
  console.log('📤 Adicionando imagens ao portfolio...\n');

  // Adicionar imagens
  let added = 0;
  let skipped = 0;

  for (const filename of imageFiles) {
    const title = extractTitle(filename);
    
    // Verificar se já existe
    if (existingTitles.has(title)) {
      console.log(`  ⏭️  ${title} (já existe)`);
      skipped++;
      continue;
    }

    // URL da imagem (relativa ao public)
    const imageUrl = `/gallery/${filename}`;

    // Criar item
    const item = {
      title,
      imageUrl,
      style: 'Tatuagem',
      specialistId: specialists.length > 0 ? specialists[0]?.id : null,
    };

    const success = await createPortfolioItem(item);
    if (success) {
      added++;
      // Delay pequeno entre requisições
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`\n✅ Concluído!`);
  console.log(`   ✓ Adicionados: ${added}`);
  console.log(`   ⏭️  Pulados: ${skipped}`);
  console.log(`   📊 Total processado: ${added + skipped}/${imageFiles.length}`);
  
  if (added > 0) {
    console.log('\n🎉 Imagens adicionadas com sucesso ao portfolio!');
  }
}

main().catch(console.error);
