/**
 * FormWizard - Reusable multi-step form modal component
 * Matches the design of CK.openDemoModal (contactModal)
 */
class FormWizard {
  constructor(options = {}) {
    this.type = options.type || 'generic';
    this.title = options.title || 'Form';
    this.subtitle = options.subtitle || '';
    this.steps = options.steps || [];
    this.onSubmit = options.onSubmit || (() => Promise.resolve());
    this.onClose = options.onClose || (() => {});
    this.currentStep = 1;
    this.formData = {};
    this.modalId = `formWizard-${this.type}-${Date.now()}`;
    this.overlay = null;
  }

  // Build the modal HTML
  buildModal() {
    const stepsHtml = this.steps.map((step, idx) => {
      const stepNum = idx + 1;
      const fieldsHtml = step.fields.map(field => this.renderField(field)).join('');
      return `
        <div class="ck-wizard-step ${stepNum === 1 ? 'active' : ''}" data-step="${stepNum}">
          <div class="ck-step-instruction">${step.instruction || `Step ${stepNum}: ${step.title || ''}`}</div>
          <div class="ck-form-grid">${fieldsHtml}</div>
          <div class="ck-wizard-actions">
            ${stepNum > 1 ? `<button type="button" class="btn btn-ghost ck-btn-step-back" onclick="window.formWizardInstances['${this.modalId}'].prevStep()">← Back</button>` : ''}
            ${stepNum < this.steps.length 
              ? `<button type="button" class="btn btn-primary ck-btn-step-next" onclick="window.formWizardInstances['${this.modalId}'].nextStep()">Continue →</button>`
              : `<button type="submit" class="btn btn-primary ck-btn-step-submit">${step.submitText || 'Submit'}</button>`
            }
          </div>
        </div>
      `;
    }).join('');

    const progressSteps = this.steps.map((step, idx) => `
      <div class="ck-progress-step ${idx === 0 ? 'active' : ''}" data-step="${idx + 1}">
        <div class="ck-step-circle">${idx + 1}</div>
        <div class="ck-step-label">${step.progressLabel || step.title || `Step ${idx + 1}`}</div>
      </div>
      ${idx < this.steps.length - 1 ? '<div class="ck-progress-line"></div>' : ''}
    `).join('');

    return `
      <div id="${this.modalId}" class="modal-overlay">
        <div class="modal-card ck-demo-modal-card">
          <div class="modal-header ck-demo-modal-header">
            <button type="button" class="ck-modal-close-btn" onclick="window.formWizardInstances['${this.modalId}'].close()" aria-label="Close modal">✕</button>
            <div class="ck-demo-header-badge">${this.badge || '📝 Form'}</div>
            <h3 class="ck-demo-title">${this.title}</h3>
            <p class="ck-demo-subtitle">${this.subtitle}</p>
            <div class="ck-demo-progress">${progressSteps}</div>
          </div>
          <form class="modal-body ck-demo-modal-body" id="${this.modalId}-form" onsubmit="event.preventDefault(); window.formWizardInstances['${this.modalId}'].submit()">
            ${stepsHtml}
          </form>
        </div>
      </div>
    `;
  }

  renderField(field) {
    const required = field.required ? 'required' : '';
    const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : '';
    const id = `${this.modalId}-${field.name}`;
    
    switch (field.type) {
      case 'select':
        const options = (field.options || []).map(opt => 
          `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`
        ).join('');
        return `
          <div class="ck-form-group">
            <label class="ck-form-label">${field.label} ${field.required ? '*' : ''}</label>
            <select name="${field.name}" id="${id}" class="ck-form-select" ${required}>${options}</select>
          </div>
        `;
      case 'radio':
        const radioOptions = (field.options || []).map((opt, i) => `
          <label class="ck-radio-option">
            <input type="radio" name="${field.name}" value="${opt.value}" ${opt.checked || i === 0 ? 'checked' : ''} ${required}>
            <span class="ck-radio-custom"></span>
            <span class="ck-radio-label">${opt.label}</span>
          </label>
        `).join('');
        return `
          <div class="ck-form-group">
            <label class="ck-form-label">${field.label} ${field.required ? '*' : ''}</label>
            <div class="ck-radio-group">${radioOptions}</div>
          </div>
        `;
      case 'textarea':
        return `
          <div class="ck-form-group">
            <label class="ck-form-label">${field.label} ${field.required ? '*' : ''}</label>
            <textarea name="${field.name}" id="${id}" class="ck-form-textarea" ${required} ${placeholder} rows="${field.rows || 4}"></textarea>
          </div>
        `;
      case 'rating':
        const stars = [5,4,3,2,1].map(n => `
          <label class="ck-rating-star" title="${n} stars">
            <input type="radio" name="${field.name}" value="${n}" ${required} style="display:none;">
            <span class="ck-star" data-value="${n}">★</span>
          </label>
        `).join('');
        return `
          <div class="ck-form-group">
            <label class="ck-form-label">${field.label} ${field.required ? '*' : ''}</label>
            <div class="ck-rating-group" data-field="${field.name}">${stars}</div>
            <input type="hidden" name="${field.name}" id="${id}" ${required}>
          </div>
        `;
      default: // text, email, tel, number
        return `
          <div class="ck-form-group">
            <label class="ck-form-label">${field.label} ${field.required ? '*' : ''}</label>
            <input type="${field.type || 'text'}" name="${field.name}" id="${id}" class="ck-form-input" ${required} ${placeholder}>
          </div>
        `;
    }
  }

  open() {
    // Register instance
    if (!window.formWizardInstances) window.formWizardInstances = {};
    window.formWizardInstances[this.modalId] = this;

    // Remove any existing modal with same type
    const existing = document.getElementById(this.modalId);
    if (existing) existing.remove();

    // Insert modal
    document.body.insertAdjacentHTML('beforeend', this.buildModal());
    
    // Show modal
    requestAnimationFrame(() => {
      const modal = document.getElementById(this.modalId);
      modal.classList.add('active');
      document.body.classList.add('modal-open');
      
      // Initialize rating stars
      modal.querySelectorAll('.ck-rating-group').forEach(group => {
        const fieldName = group.dataset.field;
        group.querySelectorAll('.ck-rating-star').forEach(star => {
          star.addEventListener('click', () => {
            const value = star.dataset.value;
            group.querySelectorAll('.ck-rating-star').forEach(s => {
              s.classList.toggle('active', s.dataset.value <= value);
            });
            group.querySelector('input[type="hidden"]').value = value;
          });
        });
      });

      // Phone input handling
      const dialSelect = modal.querySelector('[data-ck-dialcode]');
      if (dialSelect && window.CK && CK.intl && CK.intl.populateDialCodes) {
        CK.intl.populateDialCodes(dialSelect);
      }
    });
  }

  close() {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
      setTimeout(() => modal.remove(), 300);
    }
    delete window.formWizardInstances[this.modalId];
    this.onClose();
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    this.currentStep++;
    this.updateUI();
  }

  prevStep() {
    this.currentStep--;
    this.updateUI();
  }

  validateCurrentStep() {
    const stepEl = document.querySelector(`#${this.modalId} .ck-wizard-step[data-step="${this.currentStep}"]`);
    if (!stepEl) return true;
    
    const inputs = stepEl.querySelectorAll('input[required], select[required], textarea[required]');
    for (const input of inputs) {
      if (!input.value.trim()) {
        input.focus();
        if (window.CK && CK.showToast) CK.showToast(`Please fill in ${input.previousElementSibling?.textContent || 'this field'}`, 'error');
        return false;
      }
    }
    return true;
  }

  updateUI() {
    const modal = document.getElementById(this.modalId);
    if (!modal) return;

    modal.querySelectorAll('.ck-wizard-step').forEach(s => s.classList.remove('active'));
    modal.querySelectorAll('.ck-progress-step').forEach(s => s.classList.remove('active'));
    
    const currentStepEl = modal.querySelector(`.ck-wizard-step[data-step="${this.currentStep}"]`);
    const currentProgressEl = modal.querySelector(`.ck-progress-step[data-step="${this.currentStep}"]`);
    if (currentStepEl) currentStepEl.classList.add('active');
    if (currentProgressEl) currentProgressEl.classList.add('active');
    
    const formEl = document.getElementById(`${this.modalId}-form`);
    if (formEl) formEl.scrollTop = 0;
  }

  async submit() {
    if (!this.validateCurrentStep()) return;

    const formEl = document.getElementById(`${this.modalId}-form`);
    const formData = new FormData(formEl);
    const data = Object.fromEntries(formData.entries());
    
    // Store form data for potential retry
    this.formData = data;

    const submitBtn = formEl.querySelector('[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.textContent = 'Submitting... ♟';
      submitBtn.disabled = true;
    }

    try {
      await this.onSubmit(data);
      if (window.CK && CK.showToast) CK.showToast('✅ Submitted successfully! We\'ll review and respond soon.', 'success');
      this.close();
    } catch (err) {
      console.error('[FormWizard] Submit error:', err);
      if (window.CK && CK.showToast) CK.showToast('Failed to submit. Please try again.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormWizard;
}