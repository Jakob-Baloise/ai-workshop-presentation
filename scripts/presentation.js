class PresentationDeck {
  constructor(root = document) {
    this.root = root;
    this.slides = [...root.querySelectorAll('.slide')];
    this.progressBar = root.querySelector('.progress-bar');
    this.notesPanel = root.querySelector('.notes-panel');
    this.notesContent = root.querySelector('.notes-content');
    this.chapterRail = root.querySelector('.chapter-rail');
    this.railItems = [];
    this.logoTemplate = root.querySelector('#brand-logo-template');
    this.currentIndex = 0;
    this.touchStartX = 0;
  }

  start() {
    this.buildChapterRail();
    this.decorateSlides();
    this.bindEvents();

    const hashIndex = Number(location.hash.replace('#/', '')) - 1;
    this.render(Number.isInteger(hashIndex) && hashIndex >= 0 ? hashIndex : 0, false);
  }

  decorateSlides() {
    this.slides.forEach(slide => {
      slide.tabIndex = -1;
      slide.querySelector('.slide-body > h2, .slide-body > div > h2')?.classList.add('slide-title');

      if (!this.logoTemplate) return;

      const logo = this.logoTemplate.content.cloneNode(true);
      const isTitleSlide = slide.classList.contains('title-slide');
      const target = isTitleSlide ? slide.querySelector('.brand-mark') : slide.querySelector('.slide-header');
      if (!isTitleSlide) logo.firstElementChild.classList.add('header-logo');
      target?.appendChild(logo);
    });
  }

  buildChapterRail() {
    if (!this.chapterRail) return;

    const chapters = [];
    this.slides.forEach((slide, index) => {
      const name = slide.dataset.chapter || slide.dataset.section || `Slide ${index + 1}`;
      const currentChapter = chapters.at(-1);
      if (currentChapter?.name === name) {
        currentChapter.to = index;
      } else {
        chapters.push({ name, from: index, to: index });
      }
    });

    this.chapterRail.replaceChildren(...chapters.map(chapter => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'rail-item';
      button.dataset.action = 'chapter';
      button.dataset.slideIndex = chapter.from;
      button.dataset.from = chapter.from;
      button.dataset.to = chapter.to;
      button.textContent = chapter.name;
      return button;
    }));
    this.railItems = [...this.chapterRail.querySelectorAll('.rail-item')];
  }

  bindEvents() {
    document.addEventListener('keydown', event => this.handleKeydown(event));
    document.addEventListener('click', event => this.handleClick(event));
    document.addEventListener('touchstart', event => {
      this.touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });
    document.addEventListener('touchend', event => {
      const distance = event.changedTouches[0].screenX - this.touchStartX;
      if (Math.abs(distance) > 55) this.move(distance < 0 ? 1 : -1);
    }, { passive: true });
    window.addEventListener('hashchange', () => this.renderFromHash());
  }

  boundedIndex(index) {
    return Math.max(0, Math.min(index, this.slides.length - 1));
  }

  render(index, updateHash = true) {
    this.currentIndex = this.boundedIndex(index);

    if (document.activeElement?.classList.contains('slide') && this.slides.indexOf(document.activeElement) !== this.currentIndex) {
      document.activeElement.blur();
    }

    this.slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === this.currentIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.querySelector('.slide-count').textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${this.slides.length}`;
    });

    const currentSlide = this.slides[this.currentIndex];
    const notes = currentSlide.querySelector('.speaker-notes');
    this.notesContent.innerHTML = notes ? notes.innerHTML : '<p>No speaker notes for this slide.</p>';
    this.progressBar.style.height = `${((this.currentIndex + 1) / this.slides.length) * 100}%`;
    this.progressBar.style.background = 'var(--slide-accent)';
    document.body.style.setProperty('--slide-accent', getComputedStyle(currentSlide).getPropertyValue('--slide-accent'));
    document.body.classList.toggle('title-view', currentSlide.matches('.title-slide, .dark-slide, .closing-slide'));

    this.railItems.forEach(item => {
      const from = Number(item.dataset.from);
      const to = Number(item.dataset.to);
      const isActive = this.currentIndex >= from && this.currentIndex <= to;
      item.classList.toggle('active', isActive);
      if (isActive) {
        item.setAttribute('aria-current', 'step');
      } else {
        item.removeAttribute('aria-current');
      }
    });

    document.title = `${this.currentIndex + 1}/${this.slides.length} · ${currentSlide.dataset.section}`;
    if (updateHash) history.replaceState(null, '', `#/${this.currentIndex + 1}`);
  }

  move(offset) {
    if (!document.body.classList.contains('overview')) this.render(this.currentIndex + offset);
  }

  toggleNotes() {
    const isOpen = this.notesPanel.classList.toggle('open');
    this.notesPanel.setAttribute('aria-hidden', String(!isOpen));
  }

  toggleOverview(forceClose = false) {
    const shouldOpen = forceClose ? false : !document.body.classList.contains('overview');
    document.body.classList.toggle('overview', shouldOpen);
  }

  handleKeydown(event) {
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      this.move(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      this.move(-1);
    } else if (event.key === 'Home') {
      this.render(0);
    } else if (event.key === 'End') {
      this.render(this.slides.length - 1);
    } else if (event.key.toLowerCase() === 'n') {
      this.toggleNotes();
    } else if (event.key === 'Escape') {
      this.toggleOverview();
    }
  }

  handleClick(event) {
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      const actions = {
        next: () => this.move(1),
        previous: () => this.move(-1),
        notes: () => this.toggleNotes(),
        overview: () => this.toggleOverview(),
        chapter: () => this.render(Number(actionButton.dataset.slideIndex))
      };
      actions[actionButton.dataset.action]?.();
      return;
    }

    const selectedSlide = event.target.closest('.slide');
    if (selectedSlide && document.body.classList.contains('overview')) {
      this.render(this.slides.indexOf(selectedSlide));
      this.toggleOverview(true);
    }
  }

  renderFromHash() {
    const requestedIndex = Number(location.hash.replace('#/', '')) - 1;
    if (Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < this.slides.length) {
      this.render(requestedIndex, false);
    }
  }
}

window.PresentationDeck = PresentationDeck;
new PresentationDeck().start();
