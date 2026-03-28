#!/usr/bin/env node

// Script para otimizar imagens automaticamente
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const config = {
  inputDir: './src/assets',
  outputDir: './public/optimized',
  formats: ['webp', 'avif'],
  quality: {
    webp: 75,
    avif: 50,
    jpg: 80
  },
  sizes: [320, 640, 768, 1024, 1280, 1536] // Responsive sizes
};

// Garantir que o diretório de saída exista
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Obter todas as imagens do diretório de assets
function getAllImages(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (/\.(jpg|jpeg|png|gif)$/i.test(item)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Otimizar imagem com sharp
function optimizeImage(inputPath, outputPath, format, quality) {
  try {
    const command = `npx sharp "${inputPath}" -q ${quality} -format ${format} "${outputPath}"`;
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Optimized: ${path.basename(inputPath)} -> ${format.toUpperCase()} (${quality}%)`);
    return true;
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
    return false;
  }
}

// Gerar imagens responsivas
function generateResponsiveImages(inputPath, baseName, extension) {
  const results = [];
  
  for (const size of config.sizes) {
    const sizePath = path.join(
      config.outputDir,
      `${baseName}-${size}w.${extension}`
    );
    
    try {
      const command = `npx sharp "${inputPath}" -q ${config.quality.jpg} -resize ${size} "${sizePath}"`;
      execSync(command, { stdio: 'inherit' });
      results.push(sizePath);
      console.log(`✅ Generated: ${baseName}-${size}w.jpg`);
    } catch (error) {
      console.error(`❌ Error generating ${size}w:`, error.message);
    }
  }
  
  return results;
}

// Processar todas as imagens
function processImages() {
  const images = getAllImages(config.inputDir);
  console.log(`📁 Found ${images.length} images to optimize`);
  
  const stats = {
    original: 0,
    optimized: 0,
    saved: 0
  };
  
  for (const imagePath of images) {
    const fileName = path.basename(imagePath);
    const baseName = path.parse(fileName).name;
    const extension = path.parse(fileName).ext.toLowerCase();
    
    // Calcular tamanho original
    const originalSize = fs.statSync(imagePath).size;
    stats.original += originalSize;
    
    // Gerar formatos modernos
    for (const format of config.formats) {
      const outputPath = path.join(config.outputDir, `${baseName}.${format}`);
      
      if (optimizeImage(imagePath, outputPath, format, config.quality[format])) {
        const optimizedSize = fs.statSync(outputPath).size;
        stats.optimized += optimizedSize;
        stats.saved += (originalSize - optimizedSize);
      }
    }
    
    // Gerar imagens responsivas (apenas para JPEG)
    if (['.jpg', '.jpeg'].includes(extension)) {
      generateResponsiveImages(imagePath, baseName, 'jpg');
    }
  }
  
  // Exibir estatísticas
  console.log('\n📊 Optimization Results:');
  console.log(`Original size: ${(stats.original / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized size: ${(stats.optimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Space saved: ${(stats.saved / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Compression: ${((stats.saved / stats.original) * 100).toFixed(1)}%`);
}

// Verificar dependências
function checkDependencies() {
  try {
    execSync('npx sharp --version', { stdio: 'pipe' });
    return true;
  } catch {
    console.log('📦 Installing Sharp for image optimization...');
    execSync('npm install --save-dev sharp', { stdio: 'inherit' });
    return true;
  }
}

// Executar otimização
if (checkDependencies()) {
  console.log('🚀 Starting image optimization...');
  processImages();
  console.log('✅ Image optimization completed!');
} else {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}
