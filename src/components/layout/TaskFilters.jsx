import clsx from "clsx";

const FILTERS = [
  { key: "all", label: "All", mobileLabel: "All" },
  { key: "open", label: "Open", mobileLabel: "Open" },
  { key: "closed", label: "Closed", mobileLabel: "Closed" },
  { key: "high", label: "High", mobileLabel: "High" },
  { key: "medium", label: "Medium", mobileLabel: "Mid" },
  { key: "low", label: "Low", mobileLabel: "Low" },
];

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
];

function TaskFilters({
  activeFilters,
  toggleFilter,
  sortBy,
  setSortBy,
  stats,
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  return (
    <>
      <style>{`
        .tf-pill {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--card);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          font-family: var(--font-sans);
          padding: 4px 8px;
          font-size: 11.5px;
        }

        .tf-pill.active {
          border-color: var(--accent-border);
          background: var(--accent);
          color: #fff;
        }

        .tf-pill:not(.active):hover {
          background: var(--accent-bg);
          border-color: var(--accent-border);
          color: var(--accent);
        }

        .tf-pill .tf-label-full {
          display: none;
        }

        .tf-pill .tf-label-mobile {
          display: inline;
        }

        .tf-sort-btn {
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-family: var(--font-sans);
          padding: 4px 8px;
          font-size: 11.5px;
          transition: all 0.2s;
        }

        .tf-sort-wrap {
          display: flex;
          align-items: center;
          gap: 2px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--card);
          padding: 3px;
        }

        .tf-page-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tf-page-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          width: 28px;
          height: 28px;
          padding: 0;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--card);
          cursor: pointer;
          transition: all 0.16s;
          font-family: var(--font-sans);
          font-size: 13px;
          line-height: 1;
        }

        .tf-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .tf-page-btn:not(:disabled):hover {
          background: var(--accent-bg);
          border-color: var(--accent-border);
          color: var(--accent);
        }

        .tf-page-btn .tf-btn-text {
          display: none;
        }

        .tf-page-btn svg {
          display: block;
          flex-shrink: 0;
        }

        .tf-page-label {
          padding: 0 2px;
          white-space: nowrap;
          font-family: var(--font-sans);
          font-size: 11.5px;
          opacity: 0.65;
        }

        @media (min-width: 640px) {
          .tf-pill {
            padding: 5px 10px;
            font-size: 12.5px;
          }

          .tf-pill .tf-label-full {
            display: inline;
          }

          .tf-pill .tf-label-mobile {
            display: none;
          }

          .tf-sort-btn {
            padding: 5px 10px;
            font-size: 12.5px;
          }

          .tf-page-btn {
            width: auto;
            height: 30px;
            padding: 0 10px;
            gap: 4px;
            border-radius: 8px;
            font-size: 12px;
          }

          .tf-page-btn .tf-btn-text {
            display: inline;
          }

          .tf-page-label {
            font-size: 12px;
          }
        }

        @media (min-width: 1024px) {
          .tf-pill {
            padding: 6px 13px;
            font-size: 13px;
          }

          .tf-sort-btn {
            padding: 6px 12px;
            font-size: 13px;
          }

          .tf-sort-wrap {
            padding: 4px;
          }

          .tf-page-btn {
            height: 32px;
            padding: 0 12px;
            font-size: 12.5px;
          }

          .tf-page-label {
            font-size: 13px;
          }
        }
      `}</style>

      {/* Filters Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Filter Pills */}
        {FILTERS.map((item) => {
          const active = activeFilters.includes(item.key);

          return (
            <button
              key={item.key}
              onClick={() => toggleFilter(item.key)}
              className={clsx("tf-pill", active && "active")}
            >
              <span className="tf-label-mobile">{item.mobileLabel}</span>
              <span className="tf-label-full">{item.label}</span>
              <span className="ml-1 text-[0.85em] opacity-70">{stats[item.key] || 0}</span>
            </button>
          );
        })}

        {/* Sort Controls */}
        <div className="tf-sort-wrap">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className="tf-sort-btn"
              style={{
                background: sortBy === key ? "var(--accent)" : "transparent",
                color: sortBy === key ? "#fff" : "var(--text)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages >= 1 && (
          <div className="tf-page-nav ml-auto">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="tf-page-btn"
              aria-label="Previous page"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2.5L4.5 6.5L8 10.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="tf-btn-text">Prev</span>
            </button>

            {/* Page Indicator */}
            <span className="tf-page-label">
              {currentPage} / {totalPages}
            </span>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="tf-page-btn"
              aria-label="Next page"
            >
              <span className="tf-btn-text">Next</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 2.5L8.5 6.5L5 10.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default TaskFilters;
