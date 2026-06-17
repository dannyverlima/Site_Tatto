import { existsSync } from 'fs';
import { execSync } from 'child_process';

// Se frontend/src nao existe, o dist ja foi pre-compilado (deploy via ZIP)
if (existsSync('frontend/src')) {
  console.log('Compilando frontend...');
  execSync('vite build --config frontend/vite.config.ts', { stdio: 'inherit' });
} else {
  console.log('frontend/dist ja compilado no ZIP, saltando vite build.');
}
