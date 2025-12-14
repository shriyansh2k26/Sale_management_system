import React from 'react'
import { ChevronDown } from 'lucide-react'

export default function SortingDropdown({ sort, onChange }) {
  function setSort(field, dir) {
    onChange({ field, dir })
  }

  return (
    <div className="sorting">
      <div className="sorting-pill">
        <span className="sort-label-inside">Sort by</span>
        <div className="select-wrap">
          <select
            className="sort-select-inside"
            value={`${sort.field}:${sort.dir}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split(':')
              setSort(field, dir)
            }}
          >
            <option value="date:desc">Date (Newest)</option>
            <option value="date:asc">Date (Oldest)</option>
            <option value="Quantity:desc">Quantity (High)</option>
            <option value="Quantity:asc">Quantity (Low)</option>
            <option value="Customer Name:asc">Customer Name (A–Z)</option>
          </select>
          <ChevronDown size={14} className="select-icon" />
        </div>
      </div>
    </div>
  )
}
