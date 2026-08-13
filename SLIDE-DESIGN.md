# Reusable slide design

The presentation uses four layers:

- `index.html`: slide content and speaker notes
- `styles/base.css`: existing presentation components and slide-specific layouts
- `styles/presentation.css`: reusable frame, title, generic components, and theme tokens
- `scripts/presentation.js`: navigation, overview, notes, progress, and slide decoration

## Create a slide

```html
<section class="slide" data-section="Section name" data-chapter="Chapter name" data-accent="cyan">
  <header class="slide-header">
    <span class="kicker">Short context label</span>
  </header>
  <div class="slide-body">
    <h2>The stable title style with <span class="accent">variable emphasis.</span></h2>
    <!-- Slide-specific content -->
  </div>
  <footer class="slide-footer">
    <span>Optional footer text</span>
    <span class="slide-count"></span>
  </footer>
  <aside class="speaker-notes">
    <p>Presenter-only notes.</p>
  </aside>
</section>
```

`PresentationDeck` automatically applies the reusable title class, inserts the logo, numbers the slide, and wires navigation.

Adjacent slides with the same `data-chapter` value form one chapter. The deck generates clickable chapter navigation automatically, so adding or reordering slides does not require numbered ranges.

Use `.title-slide`, `.dark-slide`, or `.closing-slide` for explicit dark variants. Their appearance does not depend on slide order.

## Change the title color

Use an existing accent:

```html
<section class="slide" data-accent="coral">
```

Available values are `cyan`, `mint`, `coral`, and `yellow`. For a presentation-specific color, define it on the slide:

```html
<section class="slide" style="--slide-accent: #00695c">
```

The title shape, size, spacing, and typography remain unchanged; only the emphasis and frame accents change.

## Theme a new presentation

Override tokens near the top of `styles/presentation.css`:

```css
:root {
  --deck-background: #e8edf3;
  --slide-surface: #ffffff;
  --slide-ink: #000d6e;
  --slide-radius: 8px;
  --slide-title-size: clamp(2.25rem, 4.2vw, 4.7rem);
  --slide-title-width: 22ch;
}
```

Keep semantic content components independent from a specific slide:

- `.component-grid` with optional `--columns`
- `.component-card`
- `.component-callout`
- `.component-code`

Example:

```html
<div class="component-grid" style="--columns: 2">
  <article class="component-card">First point</article>
  <article class="component-card">Second point</article>
</div>
```
