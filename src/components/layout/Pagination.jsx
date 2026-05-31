import clsx from "clsx";

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {/* Previous Button */}
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className={clsx("btn", currentPage === 1 && "cursor-not-allowed opacity-40")}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M8 2.5L4.5 6.5L8 10.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Prev
      </button>

      {/* Page Indicator */}
      <div className="rounded-full border px-4 py-2 text-sm border-[var(--border)] bg-[var(--card)]">
        {currentPage} / {totalPages}
      </div>

      {/* Next Button */}
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={clsx("btn", currentPage === totalPages && "cursor-not-allowed opacity-40")}
      >
        Next
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
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
  );
}

export default Pagination;
