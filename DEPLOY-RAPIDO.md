# 🚀 Deploy Rápido — GitHub @atintilio

## Comando Único (copiar e colar no terminal)

```bash
# Inicializar git e fazer primeiro commit
git init
git add .
git commit -m "feat: Calculadora de Reprecificação Argos Prime - Reforma Tributária"

# Criar repo no GitHub e fazer push
gh repo create atintilio/calculadora-reprecificacao --public --source=. --push
```

---

## Ou Passo a Passo Manual

```bash
# 1. Inicializar git
git init

# 2. Adicionar arquivos
git add .

# 3. Primeiro commit
git commit -m "feat: Calculadora de Reprecificação Argos Prime"

# 4. Renomear branch para main
git branch -M main

# 5. Adicionar remote
git remote add origin git@github.com:atintilio/calculadora-reprecificacao.git

# 6. Push
git push -u origin main
```

---

## 🌐 Ativar GitHub Pages

Depois do push:

1. Acesse: https://github.com/atintilio/calculadora-reprecificacao/settings/pages
2. Em **Source**, selecione **GitHub Actions**
3. Pronto! O site estará disponível em:
   **https://atintilio.github.io/calculadora-reprecificacao/**

---

## ✅ Pronto!

O workflow `.github/workflows/deploy.yml` já está configurado para fazer deploy automático a cada push na branch `main`.

---

## 📝 Próximos Commits (sugestão)

```bash
# Após ajustes
git add .
git commit -m "docs: atualiza README com instruções de uso"
git push

# Nova feature
git add .
git commit -m "feat: adiciona exportação de relatório PDF"
git push
```

---

**URL do repositório:** https://github.com/atintilio/calculadora-reprecificacao  
**URL do site:** https://atintilio.github.io/calculadora-reprecificacao/
