# 🌿 Branch Strategy

## Overview

This repository uses a **dual-branch strategy** to maintain both a clean template and a customized portfolio version.

---

## 📋 Branch Structure

### `main` - Template Branch
- **Purpose:** Clean template for buyers/colleagues
- **Content:** Placeholder images, example projects, generic text
- **Updates:** Only documentation, bug fixes, feature improvements
- **Status:** Public-ready, shareable

### `portfolio` - Custom Branch
- **Purpose:** Personal portfolio with real projects
- **Content:** Your actual projects, real images, custom branding
- **Updates:** Your work, real data, personalizations
- **Status:** Private, personal use

---

## 🚫 CRITICAL RULE

### ⛔ NEVER MERGE `portfolio` → `main`

**Why?**
- `main` must stay generic for template buyers
- Your personal projects should not leak to template
- Maintains clean separation of concerns

**Protected by:**
- Git hook in `.git/hooks/pre-commit`
- Manual discipline
- This documentation

---

## ✅ Allowed Workflows

### Working on Portfolio (99% of the time)
```bash
git checkout portfolio
git add .
git commit -m "feat: add new project"
git push origin portfolio
```

### Updating Template (rare)
```bash
git checkout main
# Only edit:
# - content/catalogs.json (template examples)
# - README.md, docs/
# - Bug fixes in shared code
git add [specific files]
git commit -m "docs: update template"
git push origin main
```

### Syncing Bug Fixes (main → portfolio)
```bash
git checkout portfolio
git merge main --no-ff
# Resolve conflicts (usually only in catalogs.json)
git push origin portfolio
```

---

## 🛡️ Protection Mechanisms

### 1. Git Hook
- **File:** `.git/hooks/pre-commit` / `.git/hooks/pre-commit.bat`
- **Action:** Blocks merge commits from portfolio to main
- **Trigger:** Automatically on every commit

### 2. Visual Reminder
- This document (BRANCH_STRATEGY.md)
- Reminder in root README.md

### 3. Manual Discipline
- Always check branch before committing
- Use `git branch` to verify current branch

---

## 📊 Deployment Strategy

### Template (main)
- **Target:** Gumroad buyers / colleagues
- **Deploy:** Not deployed (template for download)
- **Format:** GitHub repository / ZIP file

### Portfolio (portfolio)
- **Target:** Your personal website
- **Deploy:** Vercel / Netlify
- **URL:** your-domain.com

---

## ⚠️ Emergency: Accidental Merge

**If you accidentally merged portfolio → main:**

```bash
# 1. Don't panic!
git checkout main

# 2. Reset to before merge
git reset --hard HEAD~1

# 3. Force push (careful!)
git push origin main --force

# 4. Verify
git log --oneline -5
```

**Prevention:** Always create Pull Requests, never direct merge.

---

## 📝 Quick Reference

| Action | Command | Branch |
|--------|---------|--------|
| Add project | `git commit -m "feat: ..."` | `portfolio` |
| Update template | `git commit -m "docs: ..."` | `main` |
| Sync fixes | `git merge main` | `portfolio` |
| **NEVER** | `git merge portfolio` | `main` ❌ |

---

**Last Updated:** November 2025  
**Maintained by:** Melik Musinian

