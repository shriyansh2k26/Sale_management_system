import React, { useEffect, useMemo, useState } from 'react'
import SearchBar from './components/SearchBar'
import Sidebar from './components/Sidebar'
import TransactionTable from './components/TransactionTable'
import SortingDropdown from './components/SortingDropdown'
import PaginationControls from './components/PaginationControls'
import { fetchSales } from './services/api'
import { applyAll } from './utils/filterSortUtils'
import FiltersBar from './components/FiltersBar'
import Metrics from './components/Metrics'

const PAGE_SIZE = 10

export default function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [sort, setSort] = useState({ field: 'date', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [serverTotal, setServerTotal] = useState(null)
  const [serverPageSize, setServerPageSize] = useState(PAGE_SIZE)

  useEffect(() => {
    let mounted = true
    async function load(p = 1) {
      setLoading(true)
      try {
        const res = await fetchSales({ page: p, pageSize: serverPageSize })
        if (!mounted) return
        // `fetchSales` may return an array or an object { items, total, ... }.
        if (Array.isArray(res)) {
          setServerTotal(null)
          setData(res)
        } else if (res && (res.items || res.results)) {
          const items = res.items || res.results || []
          setData(items)
          // If backend returned a total, treat as server-side pagination
          if (res.total != null) {
            setServerTotal(res.total)
            setServerPageSize(res.pageSize || PAGE_SIZE)
            // align current page with server response if provided
            if (res.page) setPage(res.page)
          } else {
            setServerTotal(null)
          }
        } else {
          setServerTotal(null)
          setData(res || [])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load(page)
    return () => {
      mounted = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => setPage(1), [search, JSON.stringify(filters), JSON.stringify(sort)])

  // When using server-side pagination, perform searches/filters on the backend
  useEffect(() => {
    if (serverTotal == null) return
    let mounted = true
    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const params = {
          page,
          pageSize: serverPageSize,
        }
        if (search) params.search = search
        if (sort && (sort.field || sort.dir)) {
          params.sortField = sort.field
          params.sortDir = sort.dir
        }
        if (filters && Object.keys(filters).length) params.filters = JSON.stringify(filters)

        const res = await fetchSales(params)
        if (!mounted) return
        if (Array.isArray(res)) {
          setData(res)
          setServerTotal(null)
        } else if (res && (res.items || res.results)) {
          setData(res.items || res.results || [])
          if (res.total != null) setServerTotal(res.total)
        } else {
          setData(res || [])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }, 250)

    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, JSON.stringify(filters), JSON.stringify(sort), page, serverTotal, serverPageSize])

  const { items, total: clientTotal } = useMemo(() => {
    if (serverTotal != null) {
      // Data is already a single page from the server; apply search/filters/sort
      // but do not re-paginate (use page=1 and a large pageSize)
      const res = applyAll(data, { search, filters, sort, page: 1, pageSize: Math.max(serverPageSize || PAGE_SIZE, data.length || PAGE_SIZE) })
      return { items: res.items, total: res.items.length }
    }
    return applyAll(data, { search, filters, sort, page, pageSize: PAGE_SIZE })
  }, [data, search, filters, sort, page, serverTotal, serverPageSize])

  // If serverTotal is set, the backend is authoritative for total items
  const total = serverTotal != null ? serverTotal : clientTotal

  useEffect(() => {
    // Debug: log pagination state changes
    // Remove these logs once pagination is confirmed working
    // eslint-disable-next-line no-console
    console.log('Pagination debug:', { page, total, itemsOnPage: items.length })
  }, [page, total, items])

  return (
    <div className="app-root">
      <Sidebar />

      <main className="main-area">
        <div className="topbar">
          <div className="title">Sales Management System</div>
          <div className="search-wrap">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>

        <div className="filters-bar-wrap">
          <div style={{flex:1}}>
            <FiltersBar allData={data} value={filters} onChange={setFilters} sort={sort} onSortChange={setSort} />
          </div>
        </div>

        <Metrics data={data} />

        <div className="content-area">
          <TransactionTable items={items} loading={loading} />
          <PaginationControls
              key={total}
              current={page}
              pageSize={serverTotal != null ? serverPageSize : PAGE_SIZE}
              totalItems={total}
              onChange={(p) => {
                const next = Number(p) || 1
                // eslint-disable-next-line no-console
                console.log('Pagination clicked ->', p, next)
                setPage(next)
                // If server-side pagination is active, fetch the requested page
                if (serverTotal != null) {
                  setLoading(true)
                  fetchSales({ page: next, pageSize: serverPageSize }).then((res) => {
                    if (Array.isArray(res)) {
                      setData(res)
                      setServerTotal(null)
                    } else if (res && (res.items || res.results)) {
                      setData(res.items || res.results || [])
                    }
                  }).finally(() => setLoading(false))
                }
              }}
            />
        </div>
      </main>
    </div>
  )
}
