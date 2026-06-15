import { Smartphone, Laptop, Tablet, Headphones, Package } from 'lucide-react';

const catConfig = {
  Phones: { icon: Smartphone, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  Laptops: { icon: Laptop, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  Tablets: { icon: Tablet, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  Accessories: { icon: Headphones, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

const CategoryBadge = ({ category, size = 'sm' }) => {
  const name = category?.categoryName || category?.name || '';
  const config = catConfig[name] || { icon: Package, color: 'var(--clr-text-muted)', bg: 'rgba(100,116,139,0.12)' };
  const Icon = config.icon;
  const px = size === 'sm' ? '6px' : '10px';
  const py = size === 'sm' ? '3px' : '6px';
  const iconSize = size === 'sm' ? 11 : 14;
  const fontSize = size === 'sm' ? '0.6rem' : '0.7rem';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: config.bg, color: config.color,
      padding: `${py} ${px}`, borderRadius: '6px',
      fontSize, fontWeight: 700, lineHeight: 1,
    }}>
      <Icon size={iconSize} />
      {name}
    </span>
  );
};

export default CategoryBadge;
