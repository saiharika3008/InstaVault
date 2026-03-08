# InstaVault – Instagram Content Organizer

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Then open http://localhost:5173 in your browser.

## Deploy to Vercel (free)

```bash
npm install -g vercel
vercel
```

## Deploy to Netlify (free)

```bash
npm run build
# Upload the /dist folder to netlify.com
```

## Project Structure

```
instavault/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.module.css
    ├── index.css
    └── components/
        ├── Header.jsx
        ├── Header.module.css
        ├── CategoryList.jsx
        ├── CategoryList.module.css
        ├── ItemList.jsx
        ├── ItemList.module.css
        ├── AddCategoryForm.jsx
        ├── AddCategoryForm.module.css
        ├── AddItemForm.jsx
        └── AddItemForm.module.css
```

## Features
- Add / Delete categories
- Add / Delete Instagram posts (links or text) per category
- Data persists across page reloads via localStorage
- Responsive layout (sidebar on mobile becomes top panel)
