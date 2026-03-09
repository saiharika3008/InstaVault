# InstaVault 

**A personal content organiser to save and categorise your favourite posts from Instagram, YouTube, Pinterest, TikTok, and more — all in one place.**

>  **Status: Frontend prototype** — core UI is functional; backend and user authentication are not yet implemented.

🔗 **Live Demo → [myinstavault.netlify.app](https://myinstavault.netlify.app)**

>  To run locally: clone the repo, run `npm install` then `npm run dev`.

---

![Landing Page](https://github.com/saiharika3008/InstaVault/blob/master/src/Screenshots%20-%20instavault/landing.png)

---

##  Features

-  **Dashboard** — See your stats (boards, posts saved, tags used, activity this week) and recently saved posts at a glance
-  **Boards** — Create custom boards to organise content by theme, mood, or topic
-  **Save Posts** — Add links from Instagram, YouTube, Pinterest, TikTok and more; platform is auto-detected and badged
-  **Tags** — Label posts with custom hashtags and filter by them
-  **Journal** — Write notes attached to each board
-  **Locked Boards** — PIN-protect boards for private content
-  **Recently Deleted** — Recover accidentally removed posts
-  **Persistent Storage** — Everything saves automatically via `localStorage`; survives page reloads
-  **Responsive Layout** — Works on desktop and mobile; sidebar collapses to a top panel on smaller screens 
-  **Export saved data as JSON**

---

##  Screenshots

### Dashboard
![Dashboard](https://github.com/saiharika3008/InstaVault/blob/master/src/Screenshots%20-%20instavault/dashboard.png)

### Vault — Saved Posts View
![Vault](https://github.com/saiharika3008/InstaVault/blob/master/src/Screenshots%20-%20instavault/vault.png)

---

##  Tech Stack

| Layer      | Technology             |
|------------|------------------------|
| UI         | React 18               |
| Bundler    | Vite                   |
| Styling    | CSS Modules            |
| Storage    | Browser `localStorage` |
| Deployment | Netlify                |

---

##  Planned Features

- [ ] User authentication and account system
- [ ] Backend integration for cloud sync across devices
- [ ] API connections to fetch post previews automatically
