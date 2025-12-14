import React from 'react'
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'

function range(from, to) {
  const r = []
  for (let i = from; i <= to; i++) r.push(i)
  return r
}

export default function PaginationControls({ current = 1, pageSize = 10, totalItems = 0, onChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // compute sliding window of pages (max 7 numeric buttons)
  const maxButtons = 7
  let pages = []

  if (totalPages <= maxButtons) {
    pages = range(1, totalPages)
  } else {
    const left = Math.max(2, current - 2)
    const right = Math.min(totalPages - 1, current + 2)

    pages = [1]
    if (left > 2) pages.push('left-ellipsis')
    pages = pages.concat(range(left, right))
    if (right < totalPages - 1) pages.push('right-ellipsis')
    pages.push(totalPages)
  }

  const goto = (p) => {
    if (p === 'left-ellipsis') onChange(Math.max(1, current - 5))
    else if (p === 'right-ellipsis') onChange(Math.min(totalPages, current + 5))
    else onChange(p)
  }

  return (
    <div className="pagination">
      <button className="btn icon-btn" onClick={() => onChange(1)} disabled={current === 1} aria-label="First">
        <ChevronsLeft size={14} />
      </button>
      <button className="btn icon-btn" onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1} aria-label="Previous">
        <ChevronLeft size={14} />
      </button>

      {pages.map((p, idx) => {
        if (p === 'left-ellipsis' || p === 'right-ellipsis') {
          return (
            <button
              key={p + idx}
              className="ellipsis btn"
              onClick={() => goto(p)}
              aria-label={p === 'left-ellipsis' ? 'Jump back' : 'Jump forward'}
            >
              …
            </button>
          )
        }
        return (
          <button key={p} className={`btn ${p === current ? 'active' : ''}`} onClick={() => goto(p)} aria-label={`Page ${p}`}>
            {p}
          </button>
        )
      })}

      <button className="btn icon-btn" onClick={() => onChange(Math.min(totalPages, current + 1))} disabled={current === totalPages} aria-label="Next">
        <ChevronRight size={14} />
      </button>
      <button className="btn icon-btn" onClick={() => onChange(totalPages)} disabled={current === totalPages} aria-label="Last">
        <ChevronsRight size={14} />
      </button>
    </div>
  )
}
