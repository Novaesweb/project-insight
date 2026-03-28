# 🏓 Supabase Ping - Keep Alive

## 🎯 Objetivo

Manter o Supabase ativo e evitar que o site congele durante atualizações programadas (normalmente a cada 7 dias).

## 🔄 Como Funciona

O GitHub Actions executa um ping a cada 6 horas no Supabase para manter a conexão ativa.

## 📋 Configuração Necessária

### 1️⃣ **GitHub Secrets**

Você precisa configurar os seguintes secrets no seu repositório GitHub:

```bash
# Vá para: Settings > Secrets and variables > Actions
# Adicione os seguintes secrets:

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 2️⃣ **Onde encontrar as credenciais:**

1. **Acesse o Supabase Dashboard**: https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá para Settings > API**
4. **Copie a URL e a Anonymous Key**

```
Exemplo:
URL: https://abcdefgh.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔧 Implementação

### **Arquivos Criados:**

1. **`.github/workflows/supabase-ping.yml`** - Workflow automático
2. **`supabase/ping_functions.sql`** - Funções RPC (opcional)

### **Frequência do Ping:**
- **Automático**: A cada 6 horas (00:00, 06:00, 12:00, 18:00)
- **Manual**: Pode ser executado via GitHub Actions

## 📊 O que o Ping Faz

### **Teste 1**: Acessibilidade
```bash
curl -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/"
```

### **Teste 2**: Funcionamento da API
```bash
curl -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/"
```

### **Teste 3**: Manter conexão ativa
```bash
curl -X GET -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/"
```

## 🚀 Benefícios

### ✅ **Proteção Contra Congelamento**
- **Site nunca fica inativo** por mais de 6 horas
- **Conexão constante** mantida com Supabase
- **Atualizações semanais** executadas sem problemas

### 📈 **Monitoramento**
- **Status do projeto** verificado 4x ao dia
- **Alertas automáticos** se houver problemas
- **Logs completos** para troubleshooting

### 🔄 **Recuperação Automática**
- **Ping falha** → Notificação imediata
- **Múltiplas tentativas** em cada ping
- **Status detalhado** em cada execução

## 🛠️ Troubleshooting

### ❌ **Se o ping falhar:**

1. **Verifique as credenciais** no GitHub Secrets
2. **Confirme a URL do Supabase** está correta
3. **Verifique se o projeto está ativo** no dashboard
4. **Execute manualmente** o workflow se necessário

### 📝 **Logs de Execução:**

Os resultados de cada ping ficam disponíveis nos logs do GitHub Actions:
- **Status**: Success/failure
- **HTTP codes**: Respostas do Supabase
- **Timestamps**: Horários de execução
- **Error messages**: Detalhes de falhas

## 🎯 **Boas Práticas**

### ✅ **Segurança**
- **Nunca** commite credenciais no código
- **Use sempre** GitHub Secrets
- **Rotate keys** periodicamente

### 📊 **Monitoramento**
- **Verifique os logs** regularmente
- **Monitore o status** do projeto
- **Configure alertas** se necessário

### 🔄 **Manutenção**
- **Atualize as credenciais** se mudar
- **Teste o workflow** manualmente após mudanças
- **Monitore a frequência** dos pings

## 🚀 **Deploy do Ping**

### **Automático:**
O workflow será executado automaticamente após o commit.

### **Manual:**
```bash
# Via GitHub CLI
gh workflow run supabase-ping

# Via Interface GitHub
1. Vá para Actions > supabase-ping
2. Clique em "Run workflow"
3. Confirme a execução
```

## 📈 **Status Esperado**

Após configurado corretamente, você deverá ver:

```
✅ Supabase acessível (HTTP 200)
✅ API Supabase funcionando
✅ Conexão mantida ativa
📊 Status: ✅ Supabase totalmente ativo
🚀 Site protegido contra congelamento
```

---

## 🎯 **Resultado Final**

Com este sistema implementado:
- **Seu site nunca mais congela** durante atualizações
- **Monitoramento 24/7** da saúde do Supabase
- **Alertas automáticos** se houver problemas
- **Tranquilidade** para manutenções programadas

**Seu NovaesWeb ficará sempre online!** 🚀
