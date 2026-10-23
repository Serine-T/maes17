import { useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, Copy, MessageCircle } from 'lucide-react';
import { services } from '@/content/services';
import { buttonClass } from '@/components/ui/Button';
import {
  buildInquiryText,
  emptyInquiry,
  validateInquiry,
  whatsappUrl,
  type InquiryErrors,
  type InquiryValues,
  type MessageLabels,
} from './inquiry';

const OTHER = 'other';

/**
 * Frontend-only inquiry form. There is no backend: on submit it validates the fields and
 * opens WhatsApp with the message prefilled. The visitor sends it themselves, and the UI
 * says so — nothing claims the message was delivered.
 */
export function ContactForm() {
  const { t } = useTranslation('contacts');
  const [values, setValues] = useState<InquiryValues>(emptyInquiry);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [prepared, setPrepared] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const serviceLabel = (value: string) =>
    value === OTHER ? t('form.serviceOther') : t(`services:items.${value}.title`);

  const update = (field: keyof InquiryValues) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (errors[field]) {
      const nextErrors = validateInquiry(next);
      setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateInquiry(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    const labels = t('form.messageTemplate', { returnObjects: true }) as MessageLabels;
    const text = buildInquiryText(values, serviceLabel(values.service), labels);
    setPrepared(text);
    window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer');
    requestAnimationFrame(() => successRef.current?.focus());
  };

  const copy = async () => {
    if (!prepared) return;
    try {
      await navigator.clipboard.writeText(prepared);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setValues(emptyInquiry);
    setErrors({});
    setPrepared(null);
  };

  const errorCount = Object.keys(errors).length;
  const fieldId = (f: string) => `${id}-${f}`;
  const errorId = (f: string) => `${id}-${f}-error`;
  const describedBy = (f: keyof InquiryValues) => (errors[f] ? errorId(f) : undefined);
  const inputClass = (f: keyof InquiryValues) =>
    `mt-2 block w-full border bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-ink-muted/60 focus:border-graphite ${
      errors[f] ? 'border-signal' : 'border-graphite/20'
    }`;

  if (prepared) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="border border-graphite/15 bg-white p-8 outline-none">
        <CheckCircle2 className="h-6 w-6 text-olive-deep" aria-hidden="true" />
        <h3 className="mt-4 font-serif text-2xl">{t('form.success.title')}</h3>
        <p className="mt-3 leading-relaxed text-ink-muted">{t('form.success.text')}</p>
        <pre className="mt-6 max-h-56 overflow-auto whitespace-pre-wrap border border-graphite/10 bg-paper p-4 font-sans text-sm text-graphite-soft">
          {prepared}
        </pre>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsappUrl(prepared)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass('solid')}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {t('form.success.open')}
          </a>
          <button type="button" onClick={copy} className={buttonClass('outline')}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            <span aria-live="polite">{copied ? t('form.copied') : t('form.copy')}</span>
          </button>
          <button type="button" onClick={reset} className="min-h-12 px-2 text-sm font-medium underline underline-offset-4">
            {t('form.success.reset')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby={`${id}-title`} className="contact-form">
      <h2 id={`${id}-title`} className="font-serif text-3xl">
        {t('form.title')}
      </h2>
      <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">{t('form.lede')}</p>

      {errorCount > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 flex items-start gap-3 border-l-2 border-signal bg-white px-4 py-3 text-sm outline-none"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden="true" />
          {t('form.errors.summary')}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Field label={t('form.name')} required={t('form.required')} htmlFor={fieldId('name')} error={errors.name && t(`form.errors.${errors.name}`)} errorId={errorId('name')}>
          <input
            id={fieldId('name')}
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={update('name')}
            placeholder={t('form.namePlaceholder')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
            aria-required="true"
            className={inputClass('name')}
          />
        </Field>
        <Field label={t('form.contact')} required={t('form.required')} htmlFor={fieldId('contact')} error={errors.contact && t(`form.errors.${errors.contact}`)} errorId={errorId('contact')}>
          <input
            id={fieldId('contact')}
            name="contact"
            autoComplete="tel"
            inputMode="text"
            value={values.contact}
            onChange={update('contact')}
            placeholder={t('form.contactPlaceholder')}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={describedBy('contact')}
            aria-required="true"
            className={inputClass('contact')}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label={t('form.service')} required={t('form.required')} htmlFor={fieldId('service')} error={errors.service && t(`form.errors.${errors.service}`)} errorId={errorId('service')}>
            <select
              id={fieldId('service')}
              name="service"
              value={values.service}
              onChange={update('service')}
              aria-invalid={Boolean(errors.service)}
              aria-describedby={describedBy('service')}
              aria-required="true"
              className={`${inputClass('service')} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23222522' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
            >
              <option value="">{t('form.servicePlaceholder')}</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {t(`services:items.${s.slug}.title`)}
                </option>
              ))}
              <option value={OTHER}>{t('form.serviceOther')}</option>
            </select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label={t('form.message')} required={t('form.required')} htmlFor={fieldId('message')} error={errors.message && t(`form.errors.${errors.message}`)} errorId={errorId('message')}>
            <textarea
              id={fieldId('message')}
              name="message"
              rows={5}
              value={values.message}
              onChange={update('message')}
              placeholder={t('form.messagePlaceholder')}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={describedBy('message')}
              aria-required="true"
              className={`${inputClass('message')} resize-y`}
            />
          </Field>
        </div>
      </div>
      <button type="submit" className={buttonClass('solid', 'mt-8 w-full sm:w-auto')}>
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {t('form.submit')}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  htmlFor,
  error,
  errorId,
  children,
}: {
  label: string;
  required: string;
  htmlFor: string;
  error?: string | false;
  errorId: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label} <span className="font-normal text-ink-muted">({required})</span>
      </label>
      {children}
      {error ? (
        <p id={errorId} className="mt-2 flex items-center gap-1.5 text-sm text-[#a8431a]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
