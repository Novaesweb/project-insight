const xlsx = require('xlsx');
const path = require('path');
const { exec } = require('child_process');

// Configurações de Segurança Recomendadas
const RECOMMENDED_MIN_INTERVAL = 60; // segundos
const RECOMMENDED_MAX_DAILY = 40;    // contatos por dia

// Parse arguments
const startIndex = parseInt(process.argv[2]) || 0; 
const count = parseInt(process.argv[3]) || 5;      
const baseIntervalSec = parseInt(process.argv[4]) || 90; 

const inputFilePath = path.join(process.cwd(), 'scrip', 'captacao-whatsapp-limpa.xlsx');
const workbook = xlsx.readFile(inputFilePath);
const sheetName = workbook.SheetNames.includes('WhatsApp') ? 'WhatsApp' : workbook.SheetNames[workbook.SheetNames.length - 1];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

function formatWhatsApp(rawNumber) {
  if (!rawNumber) return '';
  let clean = rawNumber.toString().replace(/\D/g, '');
  if (!clean.startsWith('55') && clean.length >= 10) clean = '55' + clean;
  return clean;
}

function parseSpintax(text) {
  let result = text;
  const spintaxRegex = /\[([^\[\]]+)\]/g;
  let match;
  while ((match = spintaxRegex.exec(result)) !== null) {
    const options = match[1].split('|');
    const randomChoice = options[Math.floor(Math.random() * options.length)];
    result = result.replace(match[0], randomChoice);
    spintaxRegex.lastIndex = 0;
  }
  return result;
}

// Template com ainda mais variações para segurança máxima
const template = '[Oie|Olá|Oi, tudo bem?|Oi!], sou da NovaesWeb e [vim|estou passando para|queria] mostrar uma [proposta|ideia|solução|amostra] de um site totalmente modificado para a {empresa}, [totalmente|completamente|algo] diferente de [tudo que você já viu|qualquer outro|o que existe no mercado]. [Posso te mostrar como ficaria seu site?|Posso te enviar uma prévia de como ficaria?|Topa ver como ficaria?] [Algo rápido, tenho certeza que vai gostar muito!|É super rápido e tenho certeza que você vai curtir demais!|É jogo rápido e tenho certeza absoluta que vai gostar!|Prometo ser breve e você vai curtir!]';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para gerar um intervalo aleatório baseado no tempo base
// Ex: se base for 90s, vai variar entre 67s e 112s
function getRandomInterval(baseSec) {
  const min = baseSec * 0.75;
  const max = baseSec * 1.25;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function run() {
  console.log('\n--- MODO DE SEGURANÇA ATIVADO ---');
  if (baseIntervalSec < RECOMMENDED_MIN_INTERVAL) {
    console.log(`⚠️ ATENÇÃO: O intervalo de ${baseIntervalSec}s é baixo. O recomendado é >60s.`);
  }
  if (count > RECOMMENDED_MAX_DAILY) {
    console.log(`⚠️ ATENÇÃO: Disparar ${count} de uma vez pode ser perigoso. Tente lotes menores.`);
  }

  let validLeads = [];
  for (let i = 0; i < data.length; i++) {
    const rawPhone = data[i]['Numero WhatsApp'] || data[i]['Phone'] || data[i]['Telefone'] || '';
    const phone = formatWhatsApp(rawPhone);
    if (phone) {
      validLeads.push({ ...data[i], phone });
    }
  }

  const nextLeads = validLeads.slice(startIndex, startIndex + count);

  console.log(`\nIniciando disparo de ${nextLeads.length} leads (Início no índice ${startIndex})...`);

  for (let i = 0; i < nextLeads.length; i++) {
    const row = nextLeads[i];
    const empresa = row['Empresa'] || row['Title'] || row['Nome'] || 'Empresa';
    
    let message = template.replace(/{empresa}/gi, empresa);
    message = parseSpintax(message);
    const url = `https://wa.me/${row.phone}?text=${encodeURIComponent(message)}`;
    
    console.log(`\n[${i+1}/${count}] Enviando para: ${empresa}`);
    
    exec(`powershell -NoProfile -Command "Start-Process '${url}'"`, (error) => {
      if (error) console.error("Erro ao abrir aba:", error);
    });
    
    if (i < nextLeads.length - 1) {
      const waitTime = getRandomInterval(baseIntervalSec);
      console.log(`Aguardando intervalo humano de ${waitTime} segundos para o próximo...`);
      await delay(waitTime * 1000);
    }
  }
  console.log('\n✅ Lote finalizado com segurança!');
}

run();
