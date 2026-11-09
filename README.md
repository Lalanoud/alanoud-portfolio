# Alanoud Alotaibi – Portfolio

A single-page personal portfolio for an Applied Computing graduate (Computer Networks Track, King Saud University) focused on AI agents and IT infrastructure.

## Features

- One page with smooth scrolling, active-section navigation, and a responsive mobile menu
- Sections: Hero, About, Education, Experience, Projects, Skills, Certifications, Contact
- Floating chat button (bottom-right) that opens the AI agent, hosted on Render, in an on-page window
- CV available to view and download
- Accessible markup, keyboard focus styles, and reduced-motion support
- No build step, no backend, no paid services

## Technologies

HTML, CSS, and vanilla JavaScript. Fonts (Newsreader, Instrument Sans) load from Google Fonts with system fallbacks.

## Structure

```
index.html
assets/
  css/style.css
  js/main.js
  Alanoud-Alotaibi-CV.pdf
.nojekyll
```

All paths are relative, so the site works under any repository name.

## Screenshots

Add screenshots here after deployment, for example `assets/screenshots/home.png`.

## Deploy to GitHub Pages

1. Sign in to GitHub and select **New repository**. Name it (for example `portfolio`), keep it **Public**, and create it.
2. On the new repository page, select **uploading an existing file**.
3. Drag in **everything inside this folder** (`index.html`, `README.md`, `.nojekyll`, and the `assets` folder), not the folder itself. Select **Commit changes**.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, then **Save**.
6. Wait one to two minutes. Your site will be at `https://<your-username>.github.io/<repository-name>/`.

If you name the repository `<your-username>.github.io`, the site is served at `https://<your-username>.github.io/`.

## Updating content

Edit `index.html` directly. To replace the CV, overwrite `assets/Alanoud-Alotaibi-CV.pdf` with a file of the same name.

## AI assistant chat widget

The floating chat is built into the page and sends `POST` requests to the FastAPI backend on Render (`/chat`). The request and response field names are set in the `AGENT` object at the top of the chat code in `assets/js/main.js`.

### Backend

The backend lives in the separate `ai-agent-backend` project (FastAPI on Render). `/chat` takes `{"question": "..."}` and returns `{"answer": "..."}`. Allowed origins are set by the `ALLOWED_ORIGINS` environment variable on Render. To test locally, run `python -m http.server 8000` in this folder and open `http://localhost:8000`. Opening `index.html` directly from disk (`file://`) is blocked by CORS.
