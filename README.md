# Shared AI-Assisted Development

A dependency-free HTML presentation about building a shared AI-assisted development workflow for a software team.

## View locally

Open `index.html` directly in a browser. No installation, build step, or internet connection is required.

### Controls

- `Right Arrow`, `Page Down`, or `Space`: next slide
- `Left Arrow` or `Page Up`: previous slide
- `Home` / `End`: first / last slide
- `Esc`: slide overview
- `N`: speaker notes

## Publish with GitHub Pages

1. Create a GitHub repository and push this repository's `main` branch.
2. Open **Settings → Pages** in GitHub.
3. Set **Source** to **GitHub Actions**.
4. Run the **Deploy GitHub Pages** workflow or push to `main`.

The published URL will be `https://<owner>.github.io/<repository>/`.

## Updating the deck

The presentation is split by responsibility:

- `index.html` contains slide content and speaker notes.
- `styles/base.css` contains the existing presentation components and slide-specific layouts.
- `styles/presentation.css` contains the reusable frame, title system, theme tokens, and generic layout components.
- `scripts/presentation.js` contains the reusable navigation and presentation behavior.

See [SLIDE-DESIGN.md](SLIDE-DESIGN.md) for the slide template, color options, theme tokens, and reusable components.

Keep the deck dependency-free so it remains usable offline and deployable as a static GitHub Page.
