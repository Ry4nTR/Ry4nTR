import { qs } from '../core/dom.js';
import { EMAILJS, TIMING } from '../config.js';
import { t } from '../i18n/i18n.js';

/**
 * Contact form. Sends the form through EmailJS (SDK loaded in index.html).
 * Field names (from_name, reply_to, message) must match the EmailJS template variables.
 */
export function initContact() {
  const form = qs('#contact-form');
  if (!form) return;

  const submit = qs('.form__submit', form);
  const submitLabel = qs('.form__submit-label', form);
  const submitIcon = qs('i', submit);
  const status = qs('.form__status', form);
  let statusTimer = null;

  window.emailjs?.init(EMAILJS.publicKey);

  function showStatus(type, message) {
    clearTimeout(statusTimer);
    status.textContent = message;
    status.className = `form__status form__status--${type}`;
    statusTimer = setTimeout(() => {
      status.textContent = '';
      status.className = 'form__status';
    }, TIMING.formStatus);
  }

  function setSending(isSending) {
    submit.disabled = isSending;
    submitLabel.textContent = t(isSending ? 'contact.sending' : 'contact.send');
    submitIcon.className = isSending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!window.emailjs) {
      showStatus('error', t('contact.error'));
      return;
    }

    setSending(true);
    try {
      await window.emailjs.sendForm(EMAILJS.serviceId, EMAILJS.templateId, form);
      form.reset();
      showStatus('success', t('contact.success'));
    } catch (error) {
      console.error('[contact] The message could not be sent:', error);
      showStatus('error', t('contact.error'));
    } finally {
      setSending(false);
    }
  });
}
