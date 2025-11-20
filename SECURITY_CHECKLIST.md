# 🔒 Security Checklist - API Keys & Deployment

## ⚠️ CRITICAL: Protecting Your API Keys

### ✅ What's Already Protected

1. **`.gitignore` Updated**
   - ✅ `.env` and all variants are blocked
   - ✅ `**/.env*` blocks env files in all subdirectories
   - ✅ `*.key` and `*-key.txt` blocked
   - ✅ `api-keys.*` blocked

2. **Template Created**
   - ✅ `.env.local.template` has placeholders (safe to commit)
   - ✅ `.env.example` has placeholders (safe to commit)
   - ❌ `.env` should NEVER be committed (contains real keys)

---

## 🚨 Before Every Git Commit

### Pre-Commit Checklist

```bash
# 1. Check what files will be committed
git status

# 2. Verify .env is NOT in the list
# If you see .env in the list, STOP!

# 3. Double-check with:
git diff --cached

# 4. If .env appears, remove it:
git reset HEAD .env

# 5. Only then commit:
git commit -m "your message"
git push origin master
```

---

## 🔑 Your API Keys (Save to Local `.env` - Never Commit!)

**⚠️ IMPORTANT:** Your actual API keys are saved in your local `.env` file (never committed to git).

### Get Your API Keys From:

**Claude Max API:**
- URL: https://console.anthropic.com/
- Format: `sk-ant-api03-...`

**OpenAI GPT Pro API:**
- URL: https://platform.openai.com/api-keys
- Format: `sk-proj-...`

**Grok API:**
- URL: https://console.x.ai/
- Format: `xai-...`

**Gemini Pro API:**
- URL: https://makersuite.google.com/app/apikey
- Format: `AIza...`

---

## 📝 How to Set Up `.env` Safely

### Step 1: Create Local `.env` File

```bash
# Copy template
cp .env.local.template .env

# Edit the file (use VS Code, nano, vim, etc.)
# Replace placeholders with your actual keys
```

### Step 2: Verify It's Gitignored

```bash
# This should output: .env
git check-ignore .env

# If it outputs nothing, ADD IT TO .gitignore!
echo ".env" >> .gitignore
```

### Step 3: Test That It Works

```bash
# This should NOT show .env
git status

# This should show .env is ignored
git status --ignored | grep .env
```

---

## 🚀 Vercel Deployment (Environment Variables)

### ⚠️ NEVER commit API keys to GitHub!

Instead, add them to Vercel dashboard:

1. Go to https://vercel.com/
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add each key manually:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-UbtOWDon...` | All |
| `OPENAI_API_KEY` | `sk-proj-pZ-5hcto...` | All |
| `GROK_API_KEY` | `xai-...` | All |
| `GEMINI_API_KEY` | `AIza...` | All |

5. Click **Save** for each one
6. Redeploy your app

---

## 🛡️ What If I Accidentally Committed API Keys?

### 🚨 IMMEDIATE ACTION REQUIRED

1. **Rotate ALL API Keys Immediately**
   - Claude: https://console.anthropic.com/settings/keys
   - GPT: https://platform.openai.com/api-keys
   - Grok: https://console.x.ai/
   - Gemini: https://makersuite.google.com/app/apikey

2. **Remove from Git History**
   ```bash
   # Install BFG Repo Cleaner
   # Download from: https://rtyley.github.io/bfg-repo-cleaner/

   # Remove API keys from history
   bfg --replace-text api-keys.txt

   # Force push (DANGEROUS - only if necessary)
   git push --force
   ```

3. **Update `.env` with New Keys**

4. **Update Vercel with New Keys**

---

## ✅ Daily Security Checklist

Before every work session:

- [ ] Verify `.env` exists locally
- [ ] Verify `.env` is in `.gitignore`
- [ ] Never run `git add .env`
- [ ] Always check `git status` before committing
- [ ] Never share API keys in chat, Slack, email

After every work session:

- [ ] Run `git status` to verify no `.env` files staged
- [ ] Check `git diff --cached` before pushing
- [ ] Verify Vercel environment variables are set

---

## 🔍 How to Check If Keys Are Exposed

### Check GitHub Repository

```bash
# Search your entire repo for API keys
git log -p | grep -i "sk-ant-api03"
git log -p | grep -i "sk-proj"
```

If you find any matches: **ROTATE KEYS IMMEDIATELY**

### Check Vercel Deployment Logs

- Ensure logs don't print API keys
- Use environment variables, never hardcode
- Redact sensitive info in error messages

---

## 📚 Additional Resources

- **GitHub Secret Scanning:** https://docs.github.com/en/code-security/secret-scanning
- **Vercel Environment Variables:** https://vercel.com/docs/environment-variables
- **API Key Security Best Practices:** https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html

---

## 🎯 Summary

✅ **DO:**
- Use `.env` for local development
- Add keys to Vercel dashboard for production
- Check `git status` before every commit
- Rotate keys if exposed

❌ **DON'T:**
- Commit `.env` to git
- Hardcode API keys in source code
- Share keys in public channels
- Use same keys across environments

---

**Current Status:** 🔒 SECURE

Your `.gitignore` is properly configured to protect API keys. Just follow the checklist above before every commit!
