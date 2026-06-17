import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Smartphone, Laptop, Tablet, Headphones, Package, Loader2 } from 'lucide-react';
import { getSearchSuggestions } from '../api/productsApi';

const catIcons = {
  Phones: Smartphone,
  Laptops: Laptop,
  Tablets: Tablet,
  Accessories: Headphones,
};

const SearchSuggest = ({ isMobile = false, headerScrolled = true }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], accessories: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (q.length < 2) {
      setSuggestions({ products: [], accessories: [] });
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getSearchSuggestions(q);
      setSuggestions(data);
      setOpen(data.products.length > 0 || data.accessories.length > 0);
    } catch {
      setSuggestions({ products: [], accessories: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(timerRef.current);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = () => {
    setOpen(false);
    setQuery('');
  };

  const discountedPrice = (p) => {
    const price = Number(p.price) || 0;
    const disc = Number(p.discount) || 0;
    return disc > 0 ? (price * (1 - disc / 100)).toFixed(2) : price;
  };
  const CatIcon = (catName) => catIcons[catName] || Package;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: isMobile ? '100%' : '240px' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: isMobile ? 'rgba(255,255,255,0.12)' : (headerScrolled ? '#f1f5f9' : 'rgba(255,255,255,0.12)'),
        borderRadius: '10px', padding: '6px 12px',
        border: isMobile ? '1px solid rgba(255,255,255,0.2)' : (headerScrolled ? '1px solid transparent' : '1px solid rgba(255,255,255,0.2)'),
        transition: 'all 0.2s',
      }}>
        {loading ? (
          <Loader2 size={16} className="animate-spin" style={{ color: isMobile || !headerScrolled ? 'rgba(255,255,255,0.5)' : '#94a3b8', flexShrink: 0 }} />
        ) : (
          <Search size={16} style={{ color: isMobile || !headerScrolled ? 'rgba(255,255,255,0.5)' : '#94a3b8', flexShrink: 0 }} />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.products.length > 0 || suggestions.accessories.length > 0) setOpen(true); }}
          placeholder="Search products..."
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              marginLeft: '8px', fontSize: '0.8rem',
              color: isMobile || !headerScrolled ? '#fff' : 'var(--clr-text-on-light)',
            }}
        />
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'var(--clr-card-bg)', borderRadius: '14px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.06)',
          zIndex: 9999, overflow: 'hidden', maxHeight: '420px', overflowY: 'auto',
        }}>
          {suggestions.products.length > 0 && (
            <div>
              <div style={{ padding: '10px 14px 4px', fontSize: '0.65rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Products</div>
              {suggestions.products.map((p) => {
                const Icon = CatIcon(p.category?.categoryName);
                return (
                  <Link key={p._id} to={`/products/${p._id}`} onClick={handleSelect}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', textDecoration: 'none', color: 'inherit', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--clr-icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.images && p.images[0]
                        ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                        : <Icon size={16} style={{ color: 'var(--clr-text-muted)' }} />
                      }
                      <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        <Icon size={16} style={{ color: 'var(--clr-text-muted)' }} />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-on-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{p.category?.categoryName} — {p.productId}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-accent-brand)', whiteSpace: 'nowrap' }}>₹{discountedPrice(p)}</div>
                  </Link>
                );
              })}
            </div>
          )}

          {suggestions.accessories.length > 0 && (
            <div>
              <div style={{ padding: '10px 14px 4px', borderTop: '1px solid #f1f5f9', fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Related Accessories
              </div>
              {suggestions.accessories.map((p) => (
                <Link key={p._id} to={`/products/${p._id}`} onClick={handleSelect}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', textDecoration: 'none', color: 'inherit', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.images && p.images[0]
                      ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                      : <Headphones size={16} style={{ color: 'var(--clr-text-muted)' }} />
                    }
                    <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                      <Headphones size={16} style={{ color: 'var(--clr-text-muted)' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{p.productId}</div>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-accent-brand)', whiteSpace: 'nowrap' }}>₹{discountedPrice(p)}</div>
                </Link>
              ))}
            </div>
          )}

          {(suggestions.products.length > 0 || suggestions.accessories.length > 0) && (
            <Link to={`/shop?keyword=${encodeURIComponent(query)}`} onClick={handleSelect}
              style={{ display: 'block', textAlign: 'center', padding: '10px', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              View all results for "{query}"
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSuggest;
