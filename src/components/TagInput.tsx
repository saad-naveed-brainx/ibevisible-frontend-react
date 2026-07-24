import { useState } from 'react'

interface TagInputProps {
  id?: string
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  disabled?: boolean
}

// Chip-style tag entry: type + Enter (or comma) to add, Backspace on an empty
// field to remove the last one. Used for base tags and social hashtags.
export function TagInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
}: TagInputProps) {
  const [draft, setDraft] = useState('')

  function add(raw: string) {
    const tag = raw.trim().replace(/^#/, '')
    if (!tag) return
    if (value.includes(tag)) {
      setDraft('')
      return
    }
    onChange([...value, tag])
    setDraft('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && draft === '' && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className={`taginput${disabled ? ' is-disabled' : ''}`}>
      {value.map((tag) => (
        <span key={tag} className="taginput-chip">
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            disabled={disabled}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={draft}
        placeholder={value.length ? '' : placeholder}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => add(draft)}
      />
    </div>
  )
}
