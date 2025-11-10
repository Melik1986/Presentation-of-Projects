# 🌟 Starlight - Getting Started

> Thank you for purchasing Starlight! This guide will get you up and running in 5 minutes.

---

## What You Bought

**Starlight** is a professional portfolio template with:

- ✨ **6 pre-configured categories** - Web Dev, Design, Photography, 3D Art, Mobile Apps, Video
- 🎬 **GSAP animations** - Smooth sticky cards and folder effects
- 🎵 **Audio integration** - YouTube and SoundCloud support
- 📱 **Fully responsive** - Looks great on all devices (mobile shows 4 folders, desktop shows 6)
- 📝 **JSON-based content** - No database needed, edit one file
- 🚀 **Deploy ready** - Works on Vercel free tier

---

## Quick Setup (5 Minutes)

### Step 1: Install Dependencies

Open terminal in project folder and run:

```bash
bun install
```

**Don't have Bun?** Use npm instead:
```bash
npm install
```

### Step 2: Start Development Server

```bash
bun dev
```

Open http://localhost:3000 in your browser.

You should see 6 colored folders with placeholder images.

---

### Step 3: Replace Images

Navigate to `public/img/catalog-X/` folders (X = 1 to 6).

**For each catalog, replace 7 images:**

**Main page folders** (portrait):
- `preview-1.png` (800 × 1200px)
- `preview-2.png` (800 × 1200px)
- `preview-3.png` (800 × 1200px)

**Catalog pages** (landscape):
- `card-1.png` (1200 × 800px)
- `card-2.png` (1200 × 800px)
- `card-3.png` (1200 × 800px)
- `card-4.png` (1200 × 800px)

**Tips:**
- Use JPG or PNG format
- Optimize images (recommended: < 500KB)
- Keep the same filenames

---

### Step 4: Edit Your Content

Open `content/catalogs.json` in any code editor.

#### Update Homepage (lines 3-6):

```json
"homepage": {
  "title": "Your Name Here",  ← Replace with your name
  "description": "Replace with your professional title..."  ← Your bio
}
```

#### Update Each Catalog:

Find each catalog (6 total) and update:

**Example for Catalog 1 (Web Development):**

```json
{
  "id": "web-development",  ← Don't change
  "name": "Web Development",  ← Folder name on main page
  
  "content": {
    "cards": [
      {
        "index": "01",
        "title": "E-Commerce Platform",  ← Your project name
        "description": "Replace with your online store..."  ← Your description
      }
    ]
  }
}
```

Repeat for all 4 cards in each catalog.

---

### Step 5: Customize Colors (Optional)

In `content/catalogs.json`, each catalog has a `"theme"` section:

```json
"theme": {
  "folderGradient": "#C7D5E0",  ← Folder color (main page)
  "accentColor": "#3b82f6",     ← Accent color (catalog page)
  "backgroundColor": "#0a0a0a"  ← Page background
}
```

**Current folder colors (soft matte):**
- Catalog 1: `#C7D5E0` (soft blue)
- Catalog 2: `#E8D4D9` (soft rose)
- Catalog 3: `#D4E8D9` (soft mint)
- Catalog 4: `#E0D4E8` (soft lavender)
- Catalog 5: `#E8DDD4` (soft peach)
- Catalog 6: `#E8D4D4` (soft coral)

**Try online color picker:** https://htmlcolorcodes.com/

---

### Step 6: Deploy to Vercel

1. **Create Vercel account** (free): https://vercel.com
2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```
3. **Build your project:**
   ```bash
   bun run build
   ```
4. **Deploy:**
   ```bash
   vercel deploy
   ```
5. **Follow prompts** - it's automatic!

**Your portfolio is live!** 🎉

---

## Common Questions

### Q: Images not showing?

**A:** Check these:
- File paths in `catalogs.json` must start with `/img/`
- Filenames must match exactly (case-sensitive)
- Files must be in correct `catalog-X` folder

### Q: How to add more projects?

**A:** In `catalogs.json`, add more objects in the `"cards": []` array:

```json
"cards": [
  { ... existing card ... },
  { ... existing card ... },
  {
    "index": "05",
    "title": "New Project",
    "image": "/img/catalog-1/card-5.png",
    "description": "New project description"
  }
]
```

### Q: How to disable audio?

**A:** In `catalogs.json`, set track to null:

```json
"track": null
```

### Q: Can I add more categories?

**A:** Yes! Copy an existing catalog object and:
- Change `"id"` to unique value
- Create new folder `public/img/catalog-7/`
- Add 7 images
- Update content

### Q: Mobile shows 6 folders?

**A:** By design, mobile shows only first 4 folders to avoid crowding. This is automatic.

### Q: How to change folder display name?

**A:** In `catalogs.json`, edit `"folder.displayName"`:

```json
"folder": {
  "displayName": "my work",  ← Changes text on folder
  "variant": "variant-1"
}
```

### Q: Something's broken?

**A:** Try:
1. Delete `.next` folder
2. Run `bun dev` again
3. Hard refresh browser (Ctrl + Shift + R)

---

## Advanced Customization

**Need more control?** Check these docs:

- [docs/CONTENT_MANAGEMENT.md](docs/CONTENT_MANAGEMENT.md) - Detailed content guide
- [docs/AUDIO_INTEGRATION.md](docs/AUDIO_INTEGRATION.md) - Audio setup
- [docs/SECURITY.md](docs/SECURITY.md) - Security features

---

## Support

**Email:** [your-support-email]

**Before contacting:**
1. Check FAQ above
2. Read [docs/CONTENT_MANAGEMENT.md](docs/CONTENT_MANAGEMENT.md)
3. Clear `.next` folder and restart

---

## License

Single commercial use license.
You can use this template for **one portfolio website**.

**Enjoy building your portfolio!** 🚀

