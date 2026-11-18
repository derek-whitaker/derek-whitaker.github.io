// Add Recommendation modal: interactive prototype.
// All data is fictional, and nothing leaves the browser.
(() => {
  'use strict';

  const MAX_FILE_BYTES = 100 * 1024 * 1024;

  const DATA = {
    organizations: ['ASN(RD&A)', 'MARCORSYSCOM', 'NAVAIR', 'NAVFAC', 'NAVSEA', 'NAVSUP', 'NAVWAR', 'SSP'],
    subOrganizations: ['WASSP', 'DASN Ships', 'DASN Air', 'DASN Logistics'],
    resourceTypes: ['After-Action Report', 'Findings Brief', 'Event Summary', 'Presentation', 'Reference Document'],
    contacts: [
      'Maria Alvarez – NAVSUP',
      'James Okafor – NAVSEA',
      'Priya Raman – ASN(RD&A)',
      'Daniel Cho – NAVAIR',
      'Rebecca Hollis – NAVWAR',
      'Marcus Bell – NAVFAC',
    ],
    events: [
      'Munitions III TTX',
      'Munitions II TTX',
      'Shipyard Capacity TTX',
      'Contested Logistics TTX',
      'Industry Day: Surge Manufacturing',
    ],
    files: [
      'Shipyard Capacity TTX Findings.pdf',
      'Contested Logistics TTX Summary.pdf',
      'Munitions II TTX After-Action Report.pdf',
      'WASSP Quarterly Brief – Q3.pptx',
    ],
    recommendations: [
      'Expand surge capacity at public shipyards',
      'Delegate acquisition authorities to lowest possible levels',
      'Pre-negotiate surge clauses in munitions contracts',
      'Stand up a wartime supplier communications cell',
      'Stockpile long-lead components for critical munitions',
    ],
    tags: [
      'Strategic communications',
      'Industrial base',
      'Munitions',
      'Supply chain',
      'Shipbuilding',
      'Contracting',
      'Logistics',
      'Workforce',
    ],
  };

  const SAMPLE = {
    title: 'Publish a unified communications plan for Fleet and industry',
    description: 'Fleet and industry partners receive contradictory signals about wartime priorities. ASN(RD&A) should publish a single communications plan so that shipyards and suppliers are able to plan against the same readiness goals.',
    org: 'ASN(RD&A)',
    suborg: 'WASSP',
    contact: 'Maria Alvarez – NAVSUP',
    event: 'Munitions III TTX',
    related: ['Expand surge capacity at public shipyards', 'Delegate acquisition authorities to lowest possible levels'],
    tags: ['Strategic communications', 'Industrial base'],
    file: { name: 'Munitions III TTX After-Action Report.pdf', size: 2.4 * 1024 * 1024 },
  };

  const $ = (selector) => document.querySelector(selector);

  const makeIcon = (name) => {
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = name;
    return icon;
  };

  // A removable chip; onRemove runs when its × is pressed
  const makeChip = (label, iconName, onRemove) => {
    const chip = document.createElement('li');
    chip.className = 'chip';
    if (iconName) chip.append(makeIcon(iconName));

    const text = document.createElement('span');
    text.className = 'chip__text';
    text.textContent = label;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'chip__remove';
    remove.setAttribute('aria-label', `Remove ${label}`);
    remove.append(makeIcon('close'));
    remove.addEventListener('click', onRemove);

    chip.append(text, remove);
    return chip;
  };

  // Tell the embedding page how tall the prototype is, so its iframe never scrolls
  const prototype = $('#prototype');
  const reportHeight = () => {
    if (window.parent === window) return;

    let bottom = prototype.getBoundingClientRect().bottom;
    const menu = document.querySelector('.combo__menu:not([hidden])');
    if (menu) bottom = Math.max(bottom, menu.getBoundingClientRect().bottom + 8);

    window.parent.postMessage({ type: 'prototype:height', height: Math.ceil(bottom + window.scrollY) }, '*');
  };

  /* ---------- Combobox ---------- */

  class Combo {
    constructor(root, onChange) {
      this.id = root.dataset.id;
      this.items = DATA[root.dataset.source];
      this.icon = root.dataset.icon || '';
      this.multiple = 'multiple' in root.dataset;
      this.creatable = 'creatable' in root.dataset;
      this.onChange = onChange;
      this.root = root;
      this.selected = [];
      this.options = [];
      this.active = -1;

      const control = document.createElement('div');
      control.className = 'combo__control';

      this.input = document.createElement('input');
      Object.assign(this.input, { id: this.id, type: 'text', autocomplete: 'off', placeholder: root.dataset.placeholder });
      this.input.className = 'input combo__input';
      this.input.setAttribute('role', 'combobox');
      this.input.setAttribute('aria-autocomplete', 'list');
      this.input.setAttribute('aria-expanded', 'false');
      this.input.setAttribute('aria-controls', `${this.id}-menu`);
      if (root.dataset.label) this.input.setAttribute('aria-label', root.dataset.label);
      if (root.dataset.describedby) this.input.setAttribute('aria-describedby', root.dataset.describedby);

      const search = makeIcon('search');
      search.classList.add('combo__search');
      const chevron = makeIcon('expand_more');
      chevron.classList.add('combo__chevron');
      control.append(search, this.input, chevron);

      this.menu = document.createElement('ul');
      this.menu.className = 'combo__menu';
      this.menu.id = `${this.id}-menu`;
      this.menu.setAttribute('role', 'listbox');
      this.menu.hidden = true;
      // Keep focus in the input while choosing with a pointer
      this.menu.addEventListener('pointerdown', (e) => e.preventDefault());

      this.chips = document.createElement('ul');
      this.chips.className = 'chips';
      this.chips.setAttribute('aria-label', root.dataset.chipsLabel || 'Selected');

      root.append(control, this.menu, this.chips);

      // Clicking the field opens the menu; clicking the icons toggles it
      control.addEventListener('click', (e) => {
        this.input.focus();
        if (e.target === this.input) {
          if (!this.isOpen) this.open();
        } else {
          this.isOpen ? this.close() : this.open();
        }
      });
      this.input.addEventListener('input', () => {
        this.active = this.input.value.trim() ? 0 : -1;
        this.open();
      });
      this.input.addEventListener('keydown', (e) => this.onKeydown(e));
      this.input.addEventListener('blur', () => this.close());
    }

    get isOpen() {
      return !this.menu.hidden;
    }

    open() {
      this.menu.hidden = false;
      this.root.classList.add('is-open');
      this.input.setAttribute('aria-expanded', 'true');
      this.render();
      reportHeight();
    }

    close() {
      if (!this.isOpen) return;
      this.menu.hidden = true;
      this.active = -1;
      this.root.classList.remove('is-open');
      this.input.setAttribute('aria-expanded', 'false');
      this.input.removeAttribute('aria-activedescendant');
      reportHeight();
    }

    onKeydown(e) {
      const count = this.options.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!this.isOpen) this.open();
          else if (count) this.setActive((this.active + 1) % count);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!this.isOpen) this.open();
          else if (count) this.setActive((this.active - 1 + count) % count);
          break;
        case 'Enter':
          // Never submit the form from a search field
          e.preventDefault();
          if (this.isOpen && this.active >= 0) this.choose(this.active);
          break;
        case 'Escape':
          if (this.isOpen) {
            e.preventDefault();
            this.close();
          } else if (this.input.value) {
            this.input.value = '';
          }
          break;
        case 'Backspace':
          if (!this.input.value && this.multiple && this.selected.length) {
            this.remove(this.selected[this.selected.length - 1], false);
          }
          break;
        case 'Tab':
          this.close();
          break;
      }
    }

    // Options are the items that match the query and aren't chosen yet
    buildOptions() {
      const raw = this.input.value.trim();
      const query = raw.toLowerCase();
      const chosen = new Set(this.selected.map((s) => s.toLowerCase()));

      this.options = this.items
        .filter((item) => !chosen.has(item.toLowerCase()) && item.toLowerCase().includes(query))
        .map((label) => ({ label, create: false }));

      const known = this.items.some((item) => item.toLowerCase() === query);
      if (this.creatable && query && !known && !chosen.has(query)) {
        this.options.push({ label: raw, create: true });
      }

      if (this.active >= this.options.length) this.active = this.options.length - 1;
    }

    render() {
      this.buildOptions();
      this.menu.replaceChildren();

      if (!this.options.length) {
        const empty = document.createElement('li');
        empty.className = 'combo__option combo__option--empty';
        empty.setAttribute('role', 'option');
        empty.setAttribute('aria-disabled', 'true');
        empty.textContent = this.selected.length && !this.input.value ? 'All options are selected' : 'No matches';
        this.menu.append(empty);
      }

      this.options.forEach((option, index) => {
        const item = document.createElement('li');
        item.id = `${this.id}-option-${index}`;
        item.className = 'combo__option';
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        if (option.create) {
          item.classList.add('combo__option--create');
          item.textContent = `Add “${option.label}”`;
        } else {
          item.textContent = option.label;
        }
        item.addEventListener('click', () => this.choose(index));
        this.menu.append(item);
      });

      this.setActive(this.active);
    }

    setActive(index) {
      this.active = index;
      [...this.menu.children].forEach((item, i) => {
        const isActive = i === index && !item.classList.contains('combo__option--empty');
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });

      const activeItem = index >= 0 ? this.menu.children[index] : null;
      if (activeItem && activeItem.id) {
        this.input.setAttribute('aria-activedescendant', activeItem.id);
        // Scroll the menu only, never the embedding page
        const top = activeItem.offsetTop;
        const bottom = top + activeItem.offsetHeight;
        if (top < this.menu.scrollTop) this.menu.scrollTop = top;
        else if (bottom > this.menu.scrollTop + this.menu.clientHeight) this.menu.scrollTop = bottom - this.menu.clientHeight;
      } else {
        this.input.removeAttribute('aria-activedescendant');
      }
    }

    choose(index) {
      const option = this.options[index];
      if (!option) return;
      if (option.create) this.items.push(option.label);
      this.add(option.label);
      this.input.value = '';
      this.close();
    }

    add(label) {
      if (this.multiple) {
        if (!this.selected.includes(label)) this.selected.push(label);
      } else {
        this.selected = [label];
      }
      this.renderChips();
      this.onChange();
    }

    remove(label, moveFocus = true) {
      this.selected = this.selected.filter((s) => s !== label);
      this.renderChips();
      this.onChange();
      if (moveFocus) this.input.focus();
    }

    renderChips() {
      this.chips.replaceChildren(...this.selected.map((label) => makeChip(label, this.icon, () => this.remove(label))));
    }

    clear() {
      this.input.value = '';
      this.selected = [];
      this.close();
      this.renderChips();
    }
  }

  /* ---------- Form ---------- */

  const form = $('#form');
  const modal = $('#modal');
  const done = $('#done');
  const closed = $('#closed');
  const title = $('#title');
  const description = $('#description');
  const counter = $('#description-count');
  const org = $('#org');
  const suborg = $('#suborg');
  const fileName = $('#file-name');
  const resourceType = $('#resource-type');
  const ownerOrg = $('#owner-org');
  const dropzone = $('#dropzone');
  const fileInput = $('#file-input');
  const fileError = $('#file-error');
  const fileChip = $('#file-chip');
  const fileDetails = $('#file-details');
  const status = $('#form-status');
  const submit = $('#submit');
  const contactNote = $('#contact-note');

  let attachedFile = null;

  // Fill each select from the shared lists
  document.querySelectorAll('select[data-options]').forEach((select) => {
    DATA[select.dataset.options].forEach((value) => select.add(new Option(value, value)));
  });

  const combos = {};
  document.querySelectorAll('.combo').forEach((root) => {
    combos[root.dataset.id] = new Combo(root, () => updateSubmit());
  });

  const currentSource = () => form.elements.source.value;

  const missingFields = () => {
    const missing = [];
    if (!title.value.trim()) missing.push('Title');
    if (!description.value.trim()) missing.push('Description');
    if (!org.value) missing.push('Organization');
    if (!combos.poc.selected.length) missing.push('Point of Contact');

    switch (currentSource()) {
      case 'event':
        if (!combos.event.selected.length) missing.push('Related Event');
        break;
      case 'library':
        if (!combos['library-file'].selected.length) missing.push('File');
        break;
      case 'upload':
        if (!attachedFile) {
          missing.push('an uploaded file');
        } else {
          if (!fileName.value.trim()) missing.push('File Name');
          if (!resourceType.value) missing.push('Resource Type');
          if (!ownerOrg.value) missing.push('Owner Organization');
        }
        break;
    }
    return missing;
  };

  const listFormat = (items) => {
    if (typeof Intl !== 'undefined' && Intl.ListFormat) {
      return new Intl.ListFormat('en', { type: 'conjunction' }).format(items);
    }
    return items.join(', ');
  };

  // The button stays inactive until required fields are complete.
  // It remains focusable, and pressing it explains what's missing.
  function updateSubmit() {
    const missing = missingFields();
    submit.setAttribute('aria-disabled', String(missing.length > 0));

    if (!missing.length) status.textContent = '';
    else if (status.textContent) status.textContent = `Still needed: ${listFormat(missing)}.`;
  }

  const updateCount = () => {
    counter.textContent = `${description.value.length}/1600`;
  };

  form.addEventListener('input', updateSubmit);
  form.addEventListener('change', updateSubmit);
  description.addEventListener('input', updateCount);

  // Source radios reveal their nested fields
  const showSource = (value) => {
    document.querySelectorAll('[data-source-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.sourcePanel !== value;
    });
  };

  form.querySelectorAll('input[name="source"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      showSource(radio.value);
      updateSubmit();
    });
  });

  /* ---------- Upload ---------- */

  const attachFile = (file) => {
    if (file.size > MAX_FILE_BYTES) {
      fileError.textContent = `${file.name} is larger than 100 MB. Choose a smaller file.`;
      return;
    }

    attachedFile = { name: file.name, size: file.size };
    fileError.textContent = '';
    dropzone.hidden = true;
    fileChip.replaceChildren(makeChip(file.name, 'description', () => removeFile(true)));
    fileDetails.hidden = false;
    updateSubmit();
  };

  function removeFile(moveFocus) {
    attachedFile = null;
    fileInput.value = '';
    fileChip.replaceChildren();
    dropzone.hidden = false;
    fileDetails.hidden = true;
    fileName.value = '';
    resourceType.value = '';
    ownerOrg.value = '';
    combos['file-tags'].clear();
    updateSubmit();
    if (moveFocus) dropzone.querySelector('[data-action="choose-file"]').focus();
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) attachFile(fileInput.files[0]);
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('is-dragover');
  });

  dropzone.addEventListener('dragleave', (e) => {
    if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove('is-dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('is-dragover');
    if (e.dataTransfer.files.length) attachFile(e.dataTransfer.files[0]);
  });

  // A file dropped anywhere else shouldn't navigate the frame to it
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());

  /* ---------- Views: modal, saved, closed ---------- */

  const resetForm = () => {
    form.reset();
    Object.values(combos).forEach((combo) => combo.clear());
    if (attachedFile) removeFile(false);
    fileError.textContent = '';
    status.textContent = '';
    contactNote.textContent = '';
    showSource('none');
    updateCount();
    updateSubmit();
  };

  const showView = (view) => {
    modal.hidden = view !== modal;
    done.hidden = view !== done;
    closed.hidden = view !== closed;
  };

  const restart = () => {
    resetForm();
    showView(modal);
  };

  const fillSample = () => {
    restart();
    title.value = SAMPLE.title;
    description.value = SAMPLE.description;
    org.value = SAMPLE.org;
    suborg.value = SAMPLE.suborg;
    combos.poc.add(SAMPLE.contact);
    form.querySelector('input[name="source"][value="event"]').checked = true;
    showSource('event');
    combos.event.add(SAMPLE.event);
    SAMPLE.related.forEach((label) => combos.related.add(label));
    SAMPLE.tags.forEach((label) => combos.tags.add(label));
    updateCount();
    updateSubmit();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const missing = missingFields();
    if (missing.length) {
      status.textContent = `Still needed: ${listFormat(missing)}.`;
      return;
    }

    let message = `“${title.value.trim()}” was added to the Recommendation Tracker.`;
    if (currentSource() === 'upload') {
      message += ` ${fileName.value.trim()} was added to the File Library.`;
    }
    $('#done-message').textContent = message;

    showView(done);
    $('#done-title').focus({ preventScroll: true });
  });

  document.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;

    switch (action) {
      case 'sample':
        fillSample();
        break;
      case 'reset':
        restart();
        break;
      case 'restart':
        restart();
        title.focus({ preventScroll: true });
        break;
      case 'close':
        resetForm();
        showView(closed);
        $('#closed-title').focus({ preventScroll: true });
        break;
      case 'new-contact':
        contactNote.textContent = 'Creating contacts isn’t part of this prototype.';
        break;
      case 'choose-file':
        fileInput.click();
        break;
      case 'sample-file':
        attachFile(SAMPLE.file);
        fileChip.querySelector('.chip__remove').focus({ preventScroll: true });
        break;
    }
  });

  /* ---------- Start ---------- */

  showSource('none');
  updateCount();
  updateSubmit();

  if ('ResizeObserver' in window) new ResizeObserver(reportHeight).observe(prototype);
  window.addEventListener('load', reportHeight);
  document.fonts?.ready.then(reportHeight);
  reportHeight();
})();
