import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { profile, cvPreview } from "../../data/portfolioData";
import { revealOnScroll } from "../scrollReveal";

export default function ContactSection() {
  const sectionRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [lightboxCV, setLightboxCV] = useState(null);

  useGSAP(
    () => {
      revealOnScroll(sectionRef.current, ".pf-reveal", { stagger: 0.1 });
    },
    { scope: sectionRef }
  );

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact — ${form.name || "no name"}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setStatus("Opening your email client…");
  };

  return (
    <section id="contact" className="pf-section" ref={sectionRef}>
      <div className="pf-section__inner">
        <header className="pf-chapter-head pf-reveal">
          <p className="pf-chapter-head__eyebrow">Chapter VI</p>
          <h2 className="pf-chapter-head__title">Send a Raven</h2>
          <p className="pf-chapter-head__subtitle">Contact</p>
        </header>

        <div className="pf-contact__grid">
          <div className="pf-reveal">
            <dl className="pf-contact__info-list">
              <div className="pf-contact__info-row">
                <dt className="pf-contact__info-label">Email</dt>
                <dd className="pf-contact__info-value">
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </dd>
              </div>
              <div className="pf-contact__info-row">
                <dt className="pf-contact__info-label">Phone</dt>
                <dd className="pf-contact__info-value">
                  <a href={`tel:${profile.phone}`}>{profile.phone}</a>
                </dd>
              </div>
              <div className="pf-contact__info-row">
                <dt className="pf-contact__info-label">Based in</dt>
                <dd className="pf-contact__info-value">{profile.location}</dd>
              </div>
            </dl>

            <div className="pf-social-row">
              <a
                className="pf-social-link"
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <i className="fab fa-github" aria-hidden="true" />
              </a>
              <a className="pf-social-link" href={`mailto:${profile.email}`} aria-label="Email">
                <i className="fas fa-envelope" aria-hidden="true" />
              </a>
              <a className="pf-social-link" href={`tel:${profile.phone}`} aria-label="Phone">
                <i className="fas fa-phone" aria-hidden="true" />
              </a>
              <a
                className="pf-social-link"
                href={profile.cv}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download CV"
              >
                <i className="fas fa-file-arrow-down" aria-hidden="true" />
              </a>
            </div>
          </div>

          <form className="pf-contact-form pf-reveal" onSubmit={handleSubmit}>
            <div className="pf-form-field">
              <label htmlFor="pf-name">Name</label>
              <input
                id="pf-name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>
            <div className="pf-form-field">
              <label htmlFor="pf-email">Email</label>
              <input
                id="pf-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>
            <div className="pf-form-field">
              <label htmlFor="pf-message">Message</label>
              <textarea
                id="pf-message"
                name="message"
                required
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder="What are you building?"
              />
            </div>
            <p className="pf-contact-form__hint">
              This opens your email client with the message pre-filled — there&rsquo;s no
              server behind this form.
            </p>
            <button type="submit" className="pf-btn pf-btn--solid">
              Send Message
            </button>
            <p className="pf-contact-form__status">{status}</p>
          </form>
        </div>

        {/* ── CV Preview — 2 pages, click to enlarge, download button ── */}
        <div className="pf-cv-preview pf-reveal">
          <p className="pf-cv-preview__heading">
            <span className="pf-chapter-head__eyebrow" style={{ marginBottom: 0 }}>
              ✦ Curriculum Vitae
            </span>
          </p>
          <div className="pf-cv-preview__grid">
            {cvPreview.map((page, idx) => (
              <div key={page.id} className="pf-cv-card">
                <button
                  type="button"
                  className="pf-cv-card__thumb-btn"
                  onClick={() => setLightboxCV(page)}
                  aria-label={`Enlarge — ${page.alt}`}
                >
                  <img
                    className="pf-cv-card__img"
                    src={page.image}
                    alt={page.alt}
                    loading="lazy"
                  />
                  <span className="pf-cv-card__zoom" aria-hidden="true">⤢ Enlarge</span>
                </button>
                <div className="pf-cv-card__footer">
                  <span className="pf-cv-card__label">Page {idx + 1}</span>
                  <a
                    className="pf-btn pf-btn--ghost pf-cv-card__dl"
                    href={profile.cv}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-file-arrow-down" aria-hidden="true" />
                    Download CV (PDF)
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CV lightbox */}
      {lightboxCV && (
        <div
          className="pf-lightbox-overlay"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setLightboxCV(null); }}
        >
          <button
            type="button"
            className="pf-lightbox-close"
            onClick={() => setLightboxCV(null)}
            aria-label="Close"
          >
            ✕
          </button>
          <figure className="pf-lightbox-figure">
            <img className="pf-lightbox-img" src={lightboxCV.image} alt={lightboxCV.alt} />
            <figcaption className="pf-lightbox-caption">
              <strong>{lightboxCV.alt}</strong>
              <a
                className="pf-btn pf-btn--solid"
                href={profile.cv}
                download
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: "0.85rem", display: "inline-flex" }}
              >
                <i className="fas fa-file-arrow-down" aria-hidden="true" />
                Download CV (PDF)
              </a>
            </figcaption>
          </figure>
        </div>
      )}

      <div className="pf-footer">
        <span>
          <span className="pf-footer__rune">✦</span> {profile.name} — {profile.role}
        </span>
        <span>© {new Date().getFullYear()} · Built with React, Three.js &amp; GSAP</span>
      </div>
    </section>
  );
}