const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

// File paths
const inputFilePath = path.join(process.cwd(), 'scrip', 'captacao-whatsapp-limpa.xlsx');
const outputHtmlPath = path.join(process.cwd(), 'scrip', 'prospectador-whatsapp.html');

console.log('Lendo o arquivo Excel...');
const workbook = xlsx.readFile(inputFilePath);
const sheetName = workbook.SheetNames.includes('WhatsApp') ? 'WhatsApp' : workbook.SheetNames[workbook.SheetNames.length - 1];
const sheet = workbook.Sheets[sheetName];

// Extract data to JSON
const data = xlsx.utils.sheet_to_json(sheet);

console.log(`Foram encontrados ${data.length} registros. Gerando dashboard HTML...`);

// Format whatsapp number
function formatWhatsApp(rawNumber) {
  if (!rawNumber) return '';
  // Remove non-numeric characters
  let clean = rawNumber.toString().replace(/\D/g, '');
  
  // se tem 12 ou mais dígitos e começa com 55, tá OK
  if (!clean.startsWith('55') && clean.length >= 10) {
    clean = '55' + clean;
  }
  return clean;
}

// Generate HTML Content
let htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prospectador WhatsApp Rapido - NovaesWeb</title>
  <style>
    :root {
      --bg: #07000D;
      --surface: #130a1c;
      --primary: #ec4899;
      --text: #ffffff;
      --muted: #a1a1aa;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 2rem;
    }
    .header {
      margin-bottom: 2rem;
      text-align: center;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .card {
      background: var(--surface);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.05);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
      color: var(--muted);
    }
    .btn {
      display: inline-block;
      text-align: center;
      background: var(--primary);
      color: white;
      text-decoration: none;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-weight: bold;
      margin-top: 1rem;
      transition: opacity 0.2s;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      justify-content: center;
    }
    input[type="text"], textarea {
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(255,255,255,0.2);
      background: transparent;
      color: white;
      width: 100%;
      max-width: 400px;
    }
    textarea {
      height: 80px;
      resize: vertical;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Prospectador Rápido - WhatsApp</h1>
    <p>Foram carregados ${data.length} contatos da lista limpa.</p>
  </div>

    <div style="width: 100%; max-width: 600px; text-align: left;">
      <label style="display:block; margin-bottom: 0.5rem; color: var(--muted); font-size: 0.85rem; text-transform: uppercase;">Modelo de Mensagem (Use {empresa})</label>
      <textarea id="templateMsg">[Oie|Olá|Oi, tudo bem?], sou da NovaesWeb e [vim|estou passando para] mostrar uma [proposta|ideia|solução] de um site totalmente modificado para a {empresa}, [totalmente|completamente] diferente de [tudo que você já viu|qualquer outro]. [Posso te mostrar como ficaria seu site?|Posso te enviar uma prévia de como ficaria?] [Algo rápido, tenho certeza que vai gostar muito!|É super rápido e tenho certeza que você vai curtir demais!|É jogo rápido e tenho certeza absoluta que vai gostar!]</textarea>
      <p style="font-size: 0.75rem; color: var(--muted); margin-top: 0.5rem;">
        O Spintax usa o formato <strong>[Opção 1|Opção 2|Opção 3]</strong>.
      </p>
    </div>
    
    <div style="width: 100%; max-width: 600px; text-align: left; display: flex; gap: 1rem;">
      <input type="text" id="searchInput" placeholder="Buscar por empresa ou ramo..." style="flex: 1;">
    </div>
    
    <!-- AUTO SENDER SECTION -->
    <div style="width: 100%; max-width: 600px; text-align: center; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 1rem; padding: 1.5rem; margin-top: 1rem;">
      <h3 style="margin-top: 0; color: #34d399;">Automação de Disparo</h3>
      <p style="font-size: 0.85rem; color: var(--muted); margin-bottom: 1rem;">O sistema abrirá a aba do WhatsApp automaticamente. <strong>Deixe o WhatsApp Web aberto e logado.</strong></p>
      
      <div style="display: flex; gap: 1rem; justify-content: center; align-items: center;">
        <div>
          <label style="font-size: 0.75rem; color: var(--muted); display: block;">Quantidade</label>
          <input type="number" id="autoCount" value="20" style="width: 80px; text-align: center; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white;">
        </div>
        <div>
          <label style="font-size: 0.75rem; color: var(--muted); display: block;">Intervalo</label>
          <select id="autoInterval" style="padding: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.2); background: var(--surface); color: white;">
            <option value="60000">1 Minuto</option>
            <option value="120000">2 Minutos</option>
            <option value="300000">5 Minutos</option>
          </select>
        </div>
        <button id="startAutoBtn" style="padding: 0.6rem 1rem; border-radius: 0.5rem; background: #059669; color: white; border: none; font-weight: bold; cursor: pointer; align-self: flex-end;">🚀 Iniciar Disparo</button>
        <button id="stopAutoBtn" style="padding: 0.6rem 1rem; border-radius: 0.5rem; background: #dc2626; color: white; border: none; font-weight: bold; cursor: pointer; align-self: flex-end; display: none;">🛑 Parar</button>
      </div>
      
      <div id="autoStatus" style="margin-top: 1rem; font-size: 0.9rem; font-weight: bold; color: #f59e0b; display: none;">
        Status: Aguardando...
      </div>
    </div>
  </div>

  <div class="grid" id="leadsGrid">
`;

data.forEach((row, index) => {
  const empresa = row['Empresa'] || row['Title'] || row['Nome'] || 'Empresa';
  const categoria = row['O que faz'] || row['Categoria'] || row['Category'] || 'Sem categoria';
  const rawPhone = row['Numero WhatsApp'] || row['Phone'] || row['Telefone'] || '';
  const phone = formatWhatsApp(rawPhone);
  
  if (!phone) return; // Skip if no phone

  htmlContent += `
    <div class="card" data-search="\${empresa.toLowerCase()} \${categoria.toLowerCase()}">
      <div class="card-header">
        <span class="badge">\${categoria}</span>
        <h3 class="empresa-nome">\${empresa}</h3>
        <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 0;">📞 \${rawPhone}</p>
      </div>
      <a href="#" class="btn whatsapp-btn" data-phone="\${phone}" data-empresa="\${empresa}" target="_blank">
        Iniciar Conversa
      </a>
    </div>
  `;
});

htmlContent += `
  </div>

  <script>
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const cards = document.querySelectorAll('.card');
    
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      cards.forEach(card => {
        if (card.dataset.search.includes(term)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });

    // Spintax parser function: matches [Option A|Option B]
    function parseSpintax(text) {
      let result = text;
      const spintaxRegex = /\\[([^\\[\\]]+)\\]/g;
      
      let match;
      while ((match = spintaxRegex.exec(result)) !== null) {
        const options = match[1].split('|');
        const randomChoice = options[Math.floor(Math.random() * options.length)];
        result = result.replace(match[0], randomChoice);
        // Reset regex index because we modified the string
        spintaxRegex.lastIndex = 0;
      }
      return result;
    }

    // Dynamic link generation on click
    const buttons = document.querySelectorAll('.whatsapp-btn');
    const templateInput = document.getElementById('templateMsg');

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const phone = btn.dataset.phone;
        const empresa = btn.dataset.empresa;
        const rawTemplate = templateInput.value;
        
        // 1. Replace variables
        let message = rawTemplate.replace(/{empresa}/gi, empresa);
        
        // 2. Resolve Spintax [A|B]
        message = parseSpintax(message);
        
        const encodedMessage = encodeURIComponent(message);
        const url = \`https://wa.me/\${phone}?text=\${encodedMessage}\`;
        
        // Change color to mark as visited
        btn.style.background = '#059669'; // Emerald
        btn.innerHTML = 'Conversa Iniciada ✓';
        
        window.open(url, '_blank');
      });
    });

    // AUTO SENDER LOGIC
    const startAutoBtn = document.getElementById('startAutoBtn');
    const stopAutoBtn = document.getElementById('stopAutoBtn');
    const autoStatus = document.getElementById('autoStatus');
    const autoCountInput = document.getElementById('autoCount');
    const autoIntervalSelect = document.getElementById('autoInterval');
    
    let autoIntervalId = null;
    let autoCounter = 0;
    let autoTarget = 0;
    
    startAutoBtn.addEventListener('click', () => {
      autoTarget = parseInt(autoCountInput.value, 10);
      const intervalMs = parseInt(autoIntervalSelect.value, 10);
      
      if (isNaN(autoTarget) || autoTarget <= 0) {
        alert('Por favor, defina uma quantidade válida para disparar.');
        return;
      }
      
      autoCounter = 0;
      startAutoBtn.style.display = 'none';
      stopAutoBtn.style.display = 'block';
      autoStatus.style.display = 'block';
      
      sendNextAuto(); // envia o primeiro imediatamente
      
      if (autoCounter < autoTarget) {
        autoIntervalId = setInterval(sendNextAuto, intervalMs);
      }
    });
    
    stopAutoBtn.addEventListener('click', () => {
      stopAutoSending('Disparo pausado.');
    });
    
    function stopAutoSending(reason) {
      if (autoIntervalId) clearInterval(autoIntervalId);
      autoIntervalId = null;
      startAutoBtn.style.display = 'block';
      stopAutoBtn.style.display = 'none';
      autoStatus.innerHTML = \`Status: \${reason}\`;
    }
    
    function sendNextAuto() {
      // Find the next un-clicked button
      const allBtns = Array.from(document.querySelectorAll('.whatsapp-btn'));
      // A button is un-clicked if it does not have the text "Enviada ✓"
      const nextBtn = allBtns.find(btn => btn.innerHTML.indexOf('Conversa Iniciada') === -1);
      
      if (!nextBtn) {
        stopAutoSending('Fim da lista! Todos os contatos já foram contatados.');
        return;
      }
      
      autoCounter++;
      
      autoStatus.innerHTML = \`Status: Enviando \${autoCounter} de \${autoTarget}... (\${nextBtn.dataset.empresa})\`;
      
      // Simulate click
      nextBtn.click();
      
      if (autoCounter >= autoTarget) {
        stopAutoSending('Concluído! Meta atingida.');
      }
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(outputHtmlPath, htmlContent, 'utf-8');
console.log('✅ Pronto! O painel de disparo rápido foi gerado.');
console.log('Abra o arquivo no seu navegador:', outputHtmlPath);
