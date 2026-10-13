# 🚀 Guia de Deploy — GitHub

## Opção 1: Repositório Novo (recomendado)

```bash
# 1. Inicializar git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Primeiro commit
git commit -m "feat: Calculadora de Reprecificação Argus Prime - Reforma Tributária"

# 4. Criar repo no GitHub (via gh CLI)
gh repo create atintilio/calculadora-reprecificacao --public --source=. --push

# OU manualmente:
# - Criar repo em https://github.com/new
# - Nome: calculadora-reprecificacao
# - Organization: argus-prime
# - Public
# - Depois rodar:

git branch -M main
git remote add origin git@github.com:argus-prime/calculadora-reprecificacao.git
git push -u origin main
```

---

## Opção 2: Repo Existente

```bash
git init
git add .
git commit -m "feat: Calculadora de Reprecificação Argus Prime"
git branch -M main
git remote add origin <URL_DO_SEU_REPO>
git push -u origin main
```

---

## 🌐 GitHub Pages (Deploy Automático)

### Passo 1: Criar workflow

Crie o arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
  
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Passo 2: Ativar GitHub Pages

1. Vá em **Settings → Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Pronto! O site será deployado automaticamente a cada push na `main`

---

## 🎨 Alternativa: Vercel (1-click)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Seguir prompts:
# - Set up and deploy? Y
# - Which scope? argus-prime
# - Link to existing project? N
# - Project name? calculadora-reprecificacao
# - Directory? ./
# - Override settings? N
```

Acesso em: `https://calculadora-reprecificacao.vercel.app`

---

## 🐳 Alternativa: Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## 📋 Checklist Pré-Push

- [ ] `.gitignore` configurado ✅
- [ ] `README.md` completo ✅
- [ ] Build testado (`npm run build`) ✅
- [ ] Sem secrets/credenciais no código ✅
- [ ] Licença definida (opcional)

---

## 🔒 Segurança

Antes do push, verifique se **NÃO** há:
- ❌ Chaves de API
- ❌ Tokens de acesso
- ❌ Credenciais de banco
- ❌ Arquivos `.env` com dados sensíveis

O `.gitignore` já exclui `node_modules/`, `dist/` e `.env*`.

---

## 📦 Estrutura do Repo

```
calculadora-reprecificacao/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD GitHub Pages
├── src/
│   ├── core/                   # Motor de cálculo
│   ├── modules/                # 5 módulos funcionais
│   ├── components/             # UI components
│   ├── store/                  # Zustand
│   ├── types/                  # Zod schemas
│   ├── App.tsx
│   └── main.tsx
├── public/                     # Assets estáticos
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🎯 Comandos Úteis

```bash
# Ver status
git status

# Ver diff antes do commit
git diff

# Commit com mensagem descritiva
git commit -m "feat: adiciona módulo 5 - elasticidade carteira"

# Push forçado (cuidado!)
git push --force

# Ver histórico
git log --oneline

# Criar tag de release
git tag v1.0.0
git push origin v1.0.0
```

---

## 📝 Convenção de Commits (Recomendado)

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação, CSS
refactor: refatoração sem mudar comportamento
test: adicionar testes
chore: manutenção, deps
```

Exemplo:
```bash
git commit -m "feat: adiciona solver de nova nota no módulo 2"
git commit -m "fix: corrige cálculo de créditos no cenário 2027"
git commit -m "docs: atualiza README com roadmap"
```

---

**Pronto!** Escolha a opção que melhor se adapta ao seu fluxo e boa sorte com o deploy 🚀
