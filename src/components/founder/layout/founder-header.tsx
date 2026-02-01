'use client'

interface FounderHeaderProps {
  title: string
  description?: string
  breadcrumb?: string[]
  action?: {
    label: string
    onClick: () => void
  }
}

export function FounderHeader({ title, description, breadcrumb, action }: FounderHeaderProps) {
  return (
    <header className="border-b border-[var(--grid-line)] px-10 py-6 flex justify-between items-center bg-[var(--deep-black)]">
      <div className="flex flex-col">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cream)]/40 mb-1">
            <span>Founder</span>
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                <span className="text-[var(--cream)]/20">/</span>
                <span className={index === breadcrumb.length - 1 ? 'text-[var(--olive)]' : ''}>
                  {item}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tighter font-mono uppercase text-[var(--cream)]">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--cream)]/40 mt-1 font-mono">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className="bg-[var(--olive)] text-[var(--deep-black)] px-6 py-2 text-xs font-bold tracking-widest font-mono uppercase hover:bg-[var(--cream)] transition-colors"
          >
            {action.label.replace(/ /g, '_')}
          </button>
        )}
      </div>
    </header>
  )
}
