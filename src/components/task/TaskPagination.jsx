import clsx from "clsx";

function TaskPagination({ currentPage, totalPages, setCurrentPage }) {
  if (totalPages <= 1) {
    return null;
  }

  const isPrevDisabled = currentPage === 1;

  const isNextDisabled = currentPage === totalPages;

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPrevDisabled}
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        className={clsx("btn min-w-[90px]", isPrevDisabled && "cursor-not-allowed opacity-40")}
      >
        Prev
      </button>

      {/* Page Indicator */}
      <div className="px-3 text-sm opacity-70">
        {currentPage} / {totalPages}
      </div>

      <button
        disabled={isNextDisabled}
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        className={clsx("btn min-w-[90px]", isNextDisabled && "cursor-not-allowed opacity-40")}
      >
        Next
      </button>
    </div>
  );
}

export default TaskPagination;
