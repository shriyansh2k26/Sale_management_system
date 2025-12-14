import React from 'react'
import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="searchbar" style={{position:'relative'}}>
      <Search size={16} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#9ca3af'}} />
      <input
        type="search"
        placeholder="Name, Phone no."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{paddingLeft:36}}
      />
    </div>
  )
}
