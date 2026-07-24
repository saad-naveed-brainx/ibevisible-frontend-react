import { CheckIcon } from './icons'
import './auth.css'

const POINTS = [
  'Author articles, newsletters, social, video & podcasts in one place',
  'Auto-generated Schema.org JSON-LD, Open Graph & meta tags',
  'A living sitemap tuned for search engines and AI answer engines',
]

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-brand">
        <div className="auth-brand-top">
          <span className="auth-mark" aria-hidden="true">
            iB
          </span>
          <span className="auth-wordmark">
            iBe<em>Visible</em>
          </span>
        </div>

        <div className="auth-brand-mid">
          <p className="auth-brand-eyebrow">Content visibility, handled</p>
          <h2 className="auth-brand-head">
            Be the answer customers — and&nbsp;AI — find first.
          </h2>
          <ul className="auth-points">
            {POINTS.map((p) => (
              <li key={p}>
                <CheckIcon size={15} />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-brand-foot">
          AI-assisted content platform for small-business visibility.
        </p>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  )
}
