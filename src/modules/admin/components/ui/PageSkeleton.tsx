export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="adm-page adm-skeleton-page" aria-busy="true" aria-label="Memuat halaman">
      <div className="adm-hero">
        <div className="adm-hero-row">
          <div className="adm-hero-title">
            <span className="adm-skeleton adm-skeleton-tile" />
            <div className="adm-skeleton-copy">
              <span className="adm-skeleton adm-skeleton-title" />
              <span className="adm-skeleton adm-skeleton-sub" />
            </div>
          </div>
          <span className="adm-skeleton adm-skeleton-button" />
        </div>
      </div>
      <div className="adm-grid adm-grid-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="adm-card">
            <span className="adm-skeleton adm-skeleton-line short" />
            <span className="adm-skeleton adm-skeleton-value" />
            <span className="adm-skeleton adm-skeleton-line" />
          </div>
        ))}
      </div>
      <div className="adm-card">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="adm-skeleton-row">
            <span className="adm-skeleton adm-skeleton-line" />
            <span className="adm-skeleton adm-skeleton-line" />
            <span className="adm-skeleton adm-skeleton-line short" />
          </div>
        ))}
      </div>
    </div>
  );
}
