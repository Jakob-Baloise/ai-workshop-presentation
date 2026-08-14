class PresentationDeck {
  constructor(root = document) {
    this.root = root;
    this.slides = [...root.querySelectorAll('.slide')];
    this.progressBar = root.querySelector('.progress-bar');
    this.notesPanel = root.querySelector('.notes-panel');
    this.notesContent = root.querySelector('.notes-content');
    this.contextPanel = root.querySelector('.context-panel');
    this.contextTitle = root.querySelector('.context-title');
    this.contextTabs = root.querySelector('.context-tabs');
    this.contextContent = root.querySelector('.context-content');
    this.deepDiveButton = root.querySelector('[data-action="deep-dive"]');
    this.chapterRail = root.querySelector('.chapter-rail');
    this.railItems = [];
    this.logoTemplate = root.querySelector('#brand-logo-template');
    this.currentIndex = 0;
    this.touchStartX = 0;
    this.optionalMode = false;
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

    const usesOptionalSlides = this.coreSlides.length !== this.slides.length;
    this.slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === this.currentIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      const coreIndex = this.slides.slice(0, slideIndex + 1).filter(candidate => candidate.dataset.optional !== 'true').length;
      const detailMarker = slide.dataset.optional === 'true' ? 'D' : '';
      const currentNumber = usesOptionalSlides ? `${String(coreIndex).padStart(2, '0')}${detailMarker}` : String(slideIndex + 1).padStart(2, '0');
      const total = usesOptionalSlides ? this.coreSlides.length : this.slides.length;
      slide.querySelector('.slide-count').textContent = `${currentNumber} / ${total}`;
    });

    const currentSlide = this.slides[this.currentIndex];
    currentSlide.scrollTop = 0;
    const notes = currentSlide.querySelector('.speaker-notes');
    if (this.notesContent) this.notesContent.innerHTML = notes ? notes.innerHTML : '<p>No speaker notes for this slide.</p>';
    this.updateContext(currentSlide);
    this.updateDeepDive(currentSlide);
    this.progressBar.style.height = `${((this.corePosition(currentSlide) + 1) / this.coreSlides.length) * 100}%`;
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

    document.title = `${currentSlide.querySelector('.slide-count').textContent.replaceAll(' ', '')} · ${currentSlide.dataset.section}`;
    if (updateHash) history.replaceState(null, '', `#/${this.currentIndex + 1}`);
  }

  move(offset) {
    if (document.body.classList.contains('overview')) return;

    let targetIndex = this.currentIndex + offset;
    if (!this.optionalMode) {
      while (this.slides[targetIndex]?.dataset.optional === 'true') targetIndex += offset;
    }

    const targetSlide = this.slides[targetIndex];
    if (!targetSlide) return;
    if (targetSlide.dataset.optional !== 'true') this.optionalMode = false;
    this.render(targetIndex);
  }

  toggleNotes() {
    if (!this.notesPanel) {
      this.openTalkTrack();
      return;
    }
    this.closeContext();
    const isOpen = this.notesPanel.classList.toggle('open');
    this.notesPanel.setAttribute('aria-hidden', String(!isOpen));
  }

  openTalkTrack() {
    if (!this.contextPanel) return;
    this.closeNotes();
    this.contextPanel.classList.add('open');
    this.contextPanel.setAttribute('aria-hidden', 'false');
    const talkTab = this.contextTabs?.querySelector('[data-context-key="talk"]');
    if (talkTab) this.selectContextTab(talkTab.dataset.contextTarget);
  }

  toggleContext() {
    if (!this.contextPanel) return;
    this.closeNotes();
    const isOpen = this.contextPanel.classList.toggle('open');
    this.contextPanel.setAttribute('aria-hidden', String(!isOpen));
  }

  closeNotes() {
    if (this.notesPanel?.contains(document.activeElement)) {
      this.root.querySelector('.controls [data-action="notes"]')?.focus();
    }
    this.notesPanel?.classList.remove('open');
    this.notesPanel?.setAttribute('aria-hidden', 'true');
  }

  closeContext() {
    if (this.contextPanel?.contains(document.activeElement)) {
      this.root.querySelector('.controls [data-action="context"]')?.focus();
    }
    this.contextPanel?.classList.remove('open');
    this.contextPanel?.setAttribute('aria-hidden', 'true');
  }

  updateContext(slide) {
    if (!this.contextPanel || !this.contextTabs || !this.contextContent) return;

    const sections = [];
    const speakerNotes = slide.querySelector('.speaker-notes');
    if (speakerNotes?.textContent.trim()) {
      const talkTrack = document.createElement('section');
      talkTrack.dataset.context = 'talk';
      talkTrack.dataset.label = 'Talk track';
      talkTrack.innerHTML = `<h3>How to present this slide</h3>${speakerNotes.innerHTML}`;
      sections.push(talkTrack);
    }
    sections.push(...slide.querySelectorAll('.slide-context [data-context]'));
    const hasContext = sections.length > 0;
    const contextButton = this.root.querySelector('[data-action="context"]');
    if (contextButton) {
      contextButton.disabled = !hasContext;
      contextButton.setAttribute('aria-disabled', String(!hasContext));
    }
    this.contextTitle.textContent = slide.dataset.section || 'Slide context';
    this.contextTabs.replaceChildren();
    this.contextContent.replaceChildren();

    if (!hasContext) {
      this.contextContent.innerHTML = '<p>No additional context for this slide.</p>';
      return;
    }

    sections.forEach((section, index) => {
      const id = `${slide.dataset.section || 'slide'}-${section.dataset.context}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'context-tab';
      button.dataset.action = 'context-tab';
      button.dataset.contextTarget = id;
      button.dataset.contextKey = section.dataset.context;
      button.textContent = section.dataset.label || section.querySelector('h3')?.textContent || section.dataset.context;
      button.id = `${id}-tab`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', id);
      button.setAttribute('aria-selected', String(index === 0));

      const panel = document.createElement('section');
      panel.id = id;
      panel.className = 'context-section';
      panel.classList.toggle('talk-track', section.dataset.context === 'talk');
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);
      panel.hidden = index !== 0;
      panel.innerHTML = section.innerHTML;
      this.contextTabs.appendChild(button);
      this.contextContent.appendChild(panel);
    });
  }

  selectContextTab(targetId) {
    this.contextTabs?.querySelectorAll('.context-tab').forEach(tab => {
      tab.setAttribute('aria-selected', String(tab.dataset.contextTarget === targetId));
    });
    this.contextContent?.querySelectorAll('.context-section').forEach(section => {
      section.hidden = section.id !== targetId;
    });
  }

  updateDeepDive(slide) {
    if (!this.deepDiveButton) return;
    const hasDeepDive = this.slides[this.currentIndex + 1]?.dataset.optional === 'true' && slide.dataset.optional !== 'true';
    this.deepDiveButton.hidden = !hasDeepDive;
    this.deepDiveButton.disabled = !hasDeepDive;
  }

  enterDeepDive() {
    if (this.slides[this.currentIndex + 1]?.dataset.optional !== 'true') return;
    this.optionalMode = true;
    this.render(this.currentIndex + 1);
  }

  get coreSlides() {
    return this.slides.filter(slide => slide.dataset.optional !== 'true');
  }

  corePosition(slide) {
    if (slide.dataset.optional !== 'true') return this.coreSlides.indexOf(slide);
    const previousCore = this.slides.slice(0, this.currentIndex).reverse().find(candidate => candidate.dataset.optional !== 'true');
    return Math.max(0, this.coreSlides.indexOf(previousCore));
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
    } else if (event.key.toLowerCase() === 'c') {
      this.toggleContext();
    } else if (event.key.toLowerCase() === 'd') {
      this.enterDeepDive();
    } else if (event.key === 'Escape') {
      if (this.notesPanel?.classList.contains('open')) this.closeNotes();
      else if (this.contextPanel?.classList.contains('open')) this.closeContext();
      else this.toggleOverview();
    }
  }

  handleClick(event) {
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      const actions = {
        next: () => this.move(1),
        previous: () => this.move(-1),
        notes: () => this.toggleNotes(),
        context: () => this.toggleContext(),
        'context-tab': () => this.selectContextTab(actionButton.dataset.contextTarget),
        'deep-dive': () => this.enterDeepDive(),
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
