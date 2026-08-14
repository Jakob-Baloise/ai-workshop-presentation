# Shared AI-Assisted Development

A dependency-free presentation about building a shared AI-assisted development workflow for a software team.

- `index.html`: full technical workshop deck
- `overview.html`: shorter management overview of the team's shared setup, workflow, goals, blockers, and next steps

## View locally

Open either HTML file directly in a browser. No installation, build step, or internet connection is required.

### Controls

- `Right Arrow`, `Page Down`, or `Space`: next slide
- `Left Arrow` or `Page Up`: previous slide
- `Home` / `End`: first / last slide
- `Esc`: slide overview
- `N`: speaker notes; in the management overview, opens the **Talk track** in Presenter context
- `C`: Presenter context for the active management slide
- `D`: optional deep dive after the active slide, when available

In `overview.html`, normal navigation follows the 10-slide core presentation and skips optional technical detail. Use the **Deep dive** control or `D` to enter that detail; the next arrow returns to the core presentation.

## Publish with GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the complete repository, including both presentations and their shared assets.

1. Commit all presentation files, including `overview.html` and `styles/overview.css`.
2. Push the `main` branch to GitHub.
3. Open **Settings → Pages** in GitHub.
4. Set **Source** to **GitHub Actions** if it is not already selected.
5. Open **Actions → Deploy GitHub Pages** and confirm that the deployment completed successfully.

Published presentations:

- Technical deck: `https://jakob-baloise.github.io/ai-workshop-presentation/`
- Management overview: `https://jakob-baloise.github.io/ai-workshop-presentation/overview.html`

Because the HTML uses relative asset paths, both pages work under the repository path without a separate build or configuration step.

## Updating the deck

The presentation is split by responsibility:

- `index.html` contains the full technical deck.
- `overview.html` contains the management overview, a simple PBI example, an artifact walkthrough, optional detail, speaker notes, and contextual explanations.
- `styles/base.css` contains the existing presentation components and slide-specific layouts.
- `styles/presentation.css` contains the reusable frame, title system, theme tokens, and generic layout components.
- `styles/overview.css` contains the overview deck's management-oriented diagrams and layouts.
- `scripts/presentation.js` contains the reusable navigation and presentation behavior.

See [SLIDE-DESIGN.md](SLIDE-DESIGN.md) for the slide template, color options, theme tokens, and reusable components.

Keep the deck dependency-free so it remains usable offline and deployable as a static GitHub Page.
