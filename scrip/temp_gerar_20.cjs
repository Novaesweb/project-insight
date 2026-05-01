const xlsx = require('xlsx');
const path = require('path');
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

const template = '[Oie|Olá|Oi, tudo bem?], sou da NovaesWeb e [vim|estou passando para] mostrar uma [proposta|ideia|solução] de um site totalmente modificado para a {empresa}, [totalmente|completamente] diferente de [tudo que você já viu|qualquer outro]. [Posso te mostrar como ficaria seu site?|Posso te enviar uma prévia de como ficaria?] [Algo rápido, tenho certeza que vai gostar muito!|É super rápido e tenho certeza que você vai curtir demais!|É jogo rápido e tenho certeza absoluta que vai gostar!]';

let count = 0;
for (let i = 0; i < data.length && count < 20; i++) {
  const row = data[i];
  const empresa = row['Empresa'] || row['Title'] || row['Nome'] || 'Empresa';
  const rawPhone = row['Numero WhatsApp'] || row['Phone'] || row['Telefone'] || '';
  const phone = formatWhatsApp(rawPhone);
  
  if (phone) {
    let message = template.replace(/{empresa}/gi, empresa);
    message = parseSpintax(message);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    console.log(`${count + 1}. **${empresa}**: [▶️ Enviar Mensagem](${url})`);
    count++;
  }
}
