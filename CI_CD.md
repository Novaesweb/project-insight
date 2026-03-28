# 🚀 CI/CD Pipeline - NovaesWeb

## 📋 Overview

Pipeline automatizado completo para garantir qualidade, segurança e performance em todo deploy.

## 🔄 Workflow

### 🔍 Quality Checks
- **Lint**: ESLint com regras estritas
- **Type Check**: Compilação TypeScript
- **Tests**: Unitários com Vitest
- **Bundle Analysis**: Tamanho e performance
- **Coverage**: Relatório de cobertura

### 🎭 E2E Tests
- **Multi-browser**: Chrome, Firefox, Safari
- **Mobile**: Testes em dispositivos móveis
- **Accessibility**: Verificação WCAG
- **Performance**: Core Web Vitals

### 🚀 Deploy
- **Production**: Branch `main` → Vercel
- **Staging**: Branch `develop` → Vercel Preview
- **Rollback**: Automático em caso de falha
- **Health Check**: Verificação pós-deploy

### 🔒 Security
- **Audit**: npm audit
- **Snyk**: Scan de vulnerabilidades
- **Secrets**: Gerenciamento seguro
- **Dependencies**: Verificação automática

## 📊 Performance Gates

### Bundle Size
- **Limit**: 1.6MB (1600KB)
- **Current**: 1.52MB ✅
- **Alert**: Bloqueia deploy se exceder

### Lighthouse Scores
- **Performance**: ≥ 80
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 80
- **SEO**: ≥ 80

### Test Coverage
- **Target**: 80%
- **Unit Tests**: Vitest
- **E2E Tests**: Playwright

## 🔧 Setup Local

### Pré-requisitos
```bash
# Instalar dependências
npm install

# Instalar Playwright browsers
npx playwright install

# Configurar environment variables
cp .env.example .env
```

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev

# Testes
npm run test              # Unitários
npm run test:e2e          # E2E
npm run test:e2e:ui       # E2E com UI
npm run test:e2e:debug     # E2E debug

# CI/CD
npm run ci:test           # Testes com coverage
npm run ci:e2e            # E2E para CI
npm run ci:lint           # Lint para CI
npm run ci:build          # Build para CI
npm run predeploy         # Pre-deploy checks

# Performance
npm run analyze:bundle    # Análise do bundle
npm run lighthouse        # Lighthouse CI
```

## 🚀 Deploy Automático

### Triggers
- **Push para main**: Deploy produção
- **Push para develop**: Deploy staging
- **Pull Request**: Quality checks

### Environments
- **Production**: `https://novaesweb.com`
- **Staging**: `https://novaesweb-staging.vercel.app`

### Secrets Necessários
```bash
# GitHub Secrets
VERCEL_TOKEN=xxx
VERCEL_ORG_ID=xxx
VERCEL_PROJECT_ID=xxx
SNYK_TOKEN=xxx
LHCI_GITHUB_APP_TOKEN=xxx
```

## 📈 Monitoramento

### Métricas Coletadas
- **Build Time**: Tempo de compilação
- **Bundle Size**: Tamanho dos arquivos
- **Test Results**: Success/failure rate
- **Performance**: Lighthouse scores
- **Security**: Vulnerabilidades

### Notificações
- **Slack**: Deploy status
- **Email**: Falhas críticas
- **GitHub**: Status checks
- **Sentry**: Error tracking

## 🛠️ Troubleshooting

### Build Falha
```bash
# Verificar logs
git log --oneline -10

# Testar local
npm run ci:build
npm run ci:test
```

### E2E Tests Falham
```bash
# Debug local
npm run test:e2e:debug

# Verificar screenshots
ls playwright-report/
```

### Performance Issues
```bash
# Analisar bundle
npm run analyze:bundle

# Rodar Lighthouse
npm run lighthouse
```

## 🎯 Best Practices

### Commits
- **Conventional Commits**: `feat:`, `fix:`, `docs:`
- **Semantic Versioning**: `v10.0.0`
- **Branch Protection**: Main protegido

### Code Quality
- **Zero Warnings**: ESLint sem warnings
- **Type Safety**: TypeScript strict
- **Test Coverage**: Mínimo 80%

### Performance
- **Bundle Splitting**: Chunks otimizados
- **Lazy Loading**: Componentes sob demanda
- **Image Optimization**: WebP/AVIF

## 📊 Resultados Esperados

### 🚀 Velocidade
- **Deploy**: < 5 minutos
- **Build**: < 30 segundos
- **Tests**: < 3 minutos

### 🛡️ Qualidade
- **Zero Bugs**: Produção sem erros
- **Performance**: Score > 90
- **Security**: Zero vulnerabilidades

### 📈 Impacto
- **Disponibilidade**: 99.9%
- **Rollback**: < 1 minuto
- **Monitoramento**: 24/7

---

**Este pipeline garante que NovaesWeb sempre tenha a mais alta qualidade!** 🎯
