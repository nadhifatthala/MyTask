export default function BrandHeader({ subtitle = 'Daftar Tugas', userEmail = '', onLogout }) {
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : 'R';

  return (
    <header className="brand">
      <div className="logo" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
          <rect x="5" y="6" width="22" height="20" rx="6" fill="#172033" fillOpacity="0.1" />
          <rect x="5.5" y="6.5" width="21" height="19" rx="5.5" stroke="#172033" strokeWidth="2.2" />
          <path
            d="M11 16.2L14.4 19.6L21.5 12.5"
            stroke="#172033"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="25.5" cy="6.5" r="2.2" fill="#172033" />
        </svg>
      </div>

      <div>
        <strong>MyTask</strong>
        <span>{subtitle}</span>
      </div>

      <div className="brand-right">
        {onLogout && (
          <button type="button" className="logout-btn" onClick={onLogout} title="Keluar akun">
            Keluar
          </button>
        )}
        <div className="avatar" title={userEmail}>{initial}</div>
      </div>
    </header>
  );
}