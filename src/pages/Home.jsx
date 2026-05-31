import { useCallback, useMemo, useState } from "react";

import clsx from "clsx";

import { useTasks } from "../hooks/useTasks";
import { useNotification } from "../hooks/useNotification";
import { useCompletionNotifier } from "../hooks/useCompletionNotifier";
import { filterTasks, getFilterStats } from "../features/tasks/taskHelpers";
import { getRangeLabel } from "../utils/dateRange";
import AppLayout from "../components/app-shell/AppLayout";
import AppHeader, { MobileHeader } from "../components/layout/AppHeader";
import DateRangeFilter from "../components/layout/DateRangeFilter";
import AnalyticsView from "../components/dashboard/AnalyticsView";
import AccountView from "../components/account/AccountView";
import GuideView from "../components/guide/GuideView";
import TemplatesView from "../components/templates/TemplatesView";
import ExportView from "../components/export/ExportView";
import TaskList from "../components/task/TaskList";
import TaskFilters from "../components/layout/TaskFilters";
import Notification from "../components/ui/Notification";
import DashboardStats from "../components/dashboard/DashboardStats";
import CompletionPopup from "../components/ui/CompletionPopup";
import { TasksIcon, SearchIcon, CalendarIcon } from "../assets/icons";

const TASKS_PER_PAGE = 12;

const STORAGE_KEYS = {
  tasks: {
    range: "taskflow-tasks-range",
    customDates: "taskflow-tasks-custom-dates",
    sort: "taskflow-tasks-sort",
    filters: "taskflow-tasks-filters",
  },
  analytics: {
    range: "taskflow-analytics-range",
    customDates: "taskflow-analytics-custom-dates",
  },
  export: {
    range: "taskflow-export-range",
    customDates: "taskflow-export-custom-dates",
  },
};

// URL param helpers
function getParam(key, fallback) {
  return new URLSearchParams(window.location.search).get(key) ?? fallback;
}

function setParams(updates) {
  const sp = new URLSearchParams(window.location.search);
  Object.entries(updates).forEach(([k, v]) => {
    if (v == null) sp.delete(k);
    else sp.set(k, String(v));
  });
  window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
}

// localStorage helpers
function saveStr(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* empty */
  }
}

function loadStr(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveDates(key, dates) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        start: dates?.start ? dates.start.getTime() : null,
        end: dates?.end ? dates.end.getTime() : null,
      }),
    );
  } catch {
    /* empty */
  }
}

function loadDates(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { start: null, end: null };
    }
    const p = JSON.parse(raw);
    return {
      start: p.start ? new Date(p.start) : null,
      end: p.end ? new Date(p.end) : null,
    };
  } catch {
    return { start: null, end: null };
  }
}

function filterByCustomDates(tasks, customDates) {
  if (!customDates?.start) return tasks;
  const start = customDates.start;
  const end = customDates.end || new Date();
  return tasks.filter((t) => {
    return new Date(t.createdAt) >= start && new Date(t.createdAt) <= end;
  });
}

// Isolated per-page filter hook.
// All storage keys and URL param names are passed as plain strings and captured
// by the useState and useCallback closures on first render — no refs needed.
function usePageFilter(pageKey, urlRangeParam, urlCstartParam, urlCendParam, defaultRange) {
  const rangeKey = STORAGE_KEYS[pageKey].range;
  const datesKey = STORAGE_KEYS[pageKey].customDates;

  const [range, setRangeRaw] = useState(() => {
    // URL param takes priority, then localStorage, then the default
    const fromUrl = getParam(urlRangeParam, null);
    if (fromUrl) return fromUrl;
    return loadStr(rangeKey, defaultRange);
  });

  const [customDates, setCustomDatesRaw] = useState(() => {
    const savedRange = getParam(urlRangeParam, null) || loadStr(rangeKey, defaultRange);
    if (savedRange !== "custom") {
      return { start: null, end: null };
    }
    const cs = getParam(urlCstartParam, null);
    if (cs) {
      const ce = getParam(urlCendParam, null);
      return {
        start: new Date(Number(cs)),
        end: ce ? new Date(Number(ce)) : null,
      };
    }
    return loadDates(datesKey);
  });

  const setRange = useCallback(
    (v) => {
      setRangeRaw(v);
      saveStr(rangeKey, v);
      setParams({ [urlRangeParam]: v, page: 1 });

      if (v === "custom") {
        // Restore previously saved custom dates if available
        const cs = getParam(urlCstartParam, null);
        const restored = cs
          ? {
            start: new Date(Number(cs)),
            end: getParam(urlCendParam, null)
              ? new Date(Number(getParam(urlCendParam, null)))
              : null,
          }
          : loadDates(datesKey);

        if (restored?.start) {
          setCustomDatesRaw(restored);
          setParams({
            [urlCstartParam]: restored.start.getTime(),
            [urlCendParam]: restored.end?.getTime() ?? null,
          });
        } else {
          setCustomDatesRaw({ start: null, end: null });
        }
      } else {
        setCustomDatesRaw({ start: null, end: null });
        setParams({ [urlCstartParam]: null, [urlCendParam]: null });
      }
    },
    [datesKey, rangeKey, urlCendParam, urlCstartParam, urlRangeParam],
  );

  const setCustomDates = useCallback(
    (dates) => {
      setCustomDatesRaw(dates);
      if (dates?.start) {
        saveDates(datesKey, dates);
        setParams({
          [urlCstartParam]: dates.start.getTime(),
          [urlCendParam]: dates.end ? dates.end.getTime() : null,
        });
      }
    },
    [datesKey, urlCendParam, urlCstartParam],
  );

  return { range, setRange, customDates, setCustomDates };
}

function Home() {
  const [activeView, setActiveViewRaw] = useState(() => getParam("view", "tasks"));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Each view gets its own isolated filter state
  const tasksFilter = usePageFilter("tasks", "trange", "tcstart", "tcend", "today");
  const analyticsFilter = usePageFilter("analytics", "arange", "acstart", "acend", "all");
  const exportFilter = usePageFilter("export", "erange", "ecstart", "ecend", "all");

  const [sortBy, setSortByRaw] = useState(() => {
    return getParam("sort", null) || loadStr(STORAGE_KEYS.tasks.sort, "newest");
  });

  const [activeFilters, setActiveFiltersRaw] = useState(() => {
    const fromUrl = getParam("filters", null);
    if (fromUrl) {
      return fromUrl.split(",").filter(Boolean);
    }
    return loadStr(STORAGE_KEYS.tasks.filters, "all").split(",").filter(Boolean);
  });

  const [currentPage, setCurrentPageRaw] = useState(() => Number(getParam("page", "1")));

  const setActiveView = useCallback((v) => {
    setActiveViewRaw(v);
    setParams({ view: v, page: 1 });
  }, []);

  const setSortBy = useCallback((v) => {
    setSortByRaw(v);
    setCurrentPageRaw(1);
    saveStr(STORAGE_KEYS.tasks.sort, v);
    setParams({ sort: v, page: 1 });
  }, []);

  const setCurrentPage = useCallback((fn) => {
    setCurrentPageRaw((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      setParams({ page: next });
      return next;
    });
  }, []);

  const setActiveFilters = useCallback((fn) => {
    setActiveFiltersRaw((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      saveStr(STORAGE_KEYS.tasks.filters, next.join(","));
      setParams({ filters: next.join(","), page: 1 });
      return next;
    });
  }, []);

  const {
    tasks,
    templates,
    addTask,
    addTemplate,
    updateTask,
    updateTemplate,
    deleteTask,
    deleteTemplate,
    toggleTaskComplete,
    toggleTaskPin,
    resetTaskTimer,
    importTemplateTasks,
  } = useTasks();

  const { notification, showNotification, clearNotification } = useNotification();

  const todayTasks = useMemo(() => filterTasks(tasks, ["all"], "newest", "today"), [tasks]);

  const { popup, closePopup } = useCompletionNotifier({
    tasks,
    todayTasks,
    range: tasksFilter.range,
    onUpdateTask: updateTask,
  });

  const filteredTasks = useMemo(() => {
    const { range, customDates } = tasksFilter;
    let base = filterTasks(tasks, activeFilters, sortBy, range);

    if (range === "custom") {
      base = filterByCustomDates(tasks, customDates);

      if (activeFilters.length > 0 && !activeFilters.includes("all")) {
        base = base.filter((t) =>
          activeFilters.some((f) => {
            if (f === "open") return !t.checkboxState;
            if (f === "closed") return t.checkboxState;
            if (f === "high") return t.selectPriority === "High";
            if (f === "medium") return t.selectPriority === "Medium";
            if (f === "low") return t.selectPriority === "Low";
            return true;
          }),
        );
      }

      base = base.sort((a, b) =>
        sortBy === "oldest" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt,
      );
    }

    return base;
  }, [tasksFilter, tasks, activeFilters, sortBy]);

  const analyticsTasks = useMemo(() => {
    const { range, customDates } = analyticsFilter;
    if (range === "custom") return filterByCustomDates(tasks, customDates);
    return filterTasks(tasks, ["all"], "newest", range);
  }, [analyticsFilter, tasks]);

  const exportTasks = useMemo(() => {
    const { range, customDates } = exportFilter;
    if (range === "custom") return filterByCustomDates(tasks, customDates);
    return filterTasks(tasks, ["all"], "newest", range);
  }, [exportFilter, tasks]);

  // Tasks filtered by date range only, used for empty state detection
  const rangeOnlyTasks = useMemo(() => {
    const { range, customDates } = tasksFilter;
    if (range === "custom") return filterByCustomDates(tasks, customDates);
    return filterTasks(tasks, ["all"], "newest", range);
  }, [tasksFilter, tasks]);

  // Drives which empty state message is shown in the task list
  const isTrulyEmpty = tasks.length === 0;
  const isRangeEmpty = !isTrulyEmpty && rangeOnlyTasks.length === 0;
  const isFilteredEmpty = !isTrulyEmpty && !isRangeEmpty && filteredTasks.length === 0;

  const emptyIconCls = "size-[32px] sm:size-[36px] lg:size-[40px]";

  const RANGE_EMPTY = {
    today: {
      icon: <CalendarIcon className={emptyIconCls} />,
      title: "Nothing planned for today",
      subtitle: "Hit + Add Task to kick off your day.",
    },
    yesterday: {
      icon: <CalendarIcon className={emptyIconCls} />,
      title: "No tasks from yesterday",
      subtitle: "Try a different date range.",
    },
    week: {
      icon: <CalendarIcon className={emptyIconCls} />,
      title: "No tasks in the last 7 days",
      subtitle: "Try expanding to Last 30 Days or All Time.",
    },
    month: {
      icon: <CalendarIcon className={emptyIconCls} />,
      title: "No tasks in the last 30 days",
      subtitle: "Try All Time or a custom range.",
    },
    custom: {
      icon: <CalendarIcon className={emptyIconCls} />,
      title: "No tasks in this date range",
      subtitle: "Pick a different range to see your tasks.",
    },
    all: {
      icon: <TasksIcon className={emptyIconCls} />,
      title: "No Tasks Yet",
      subtitle: "Hit + Add Task to create your first task.",
    },
  };

  const tasksEmptyState = isTrulyEmpty
    ? {
      icon: <TasksIcon className={emptyIconCls} />,
      title: "No Tasks Yet",
      subtitle: "Hit + Add Task to create your first task.",
    }
    : isRangeEmpty
      ? RANGE_EMPTY[tasksFilter.range] || RANGE_EMPTY.all
      : isFilteredEmpty
        ? {
          icon: <SearchIcon className={emptyIconCls} />,
          title: "No Matches",
          subtitle: "Try a different filter or date range.",
        }
        : {
          icon: <TasksIcon className={emptyIconCls} />,
          title: "No Tasks Found",
          subtitle: "",
        };

  const stats = getFilterStats(filteredTasks);
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / TASKS_PER_PAGE));
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE,
  );

  // Resets page to 1 whenever the date range changes
  const handleTasksSetRange = useCallback(
    (v) => {
      setCurrentPageRaw(1);
      tasksFilter.setRange(v);
    },
    [tasksFilter],
  );

  // Resets page only after both start and end dates are selected
  const handleTasksSetCustomDates = useCallback(
    (dates) => {
      if (dates?.start && dates?.end) {
        setCurrentPageRaw(1);
      }
      tasksFilter.setCustomDates(dates);
    },
    [tasksFilter],
  );

  const toggleFilter = useCallback(
    (key) => {
      setCurrentPageRaw(1);
      setParams({ page: 1 });

      if (key === "all") {
        setActiveFilters(["all"]);
        return;
      }

      setActiveFilters((prev) => {
        const without = prev.filter((i) => i !== "all");
        if (without.includes(key)) {
          const updated = without.filter((i) => i !== key);
          return updated.length ? updated : ["all"];
        }
        return [...without, key];
      });
    },
    [setActiveFilters],
  );

  const viewTitle =
    {
      tasks: getRangeLabel(tasksFilter.range),
      analytics: "Analytics",
      export: "Export Data",
      saved: "Saved Tasks",
      guide: "Guide",
      account: "Account",
    }[activeView] || "Tasks";

  const viewSubtitle =
    {
      tasks: "Manage tasks and track your productivity.",
      analytics: "Visualize your productivity trends.",
      export: "Manage tasks and productivity efficiently.",
      saved: "Build a library of reusable tasks to import any day.",
      guide: "Quick guide to help you use TaskFlow faster.",
      account: "Your data, your device, and future updates.",
    }[activeView] || "";

  return (
    <AppLayout
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      activeView={activeView}
      setActiveView={setActiveView}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
    >
      <MobileHeader onMobileMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      {/* Main Content */}
      <div className="px-6 pb-10 sm:px-7 lg:px-8">
        <AppHeader title={viewTitle} subtitle={viewSubtitle} />

        {/* Tasks View */}
        {activeView === "tasks" && (
          <>
            {/* Top Action Bar */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  addTask();
                  showNotification("New task created");
                }}
                className={clsx(
                  "inline-flex cursor-pointer items-center",
                  "rounded-xl px-3 py-2 sm:px-4",
                  "text-sm font-medium text-white",
                  "bg-[var(--accent)]",
                  "transition-all hover:-translate-y-[1px] hover:bg-[var(--accent-hover)]",
                )}
              >
                + Add Task
              </button>

              {tasksFilter.range === "today" && (
                <button
                  onClick={() => {
                    if (!templates.length) {
                      showNotification("No saved tasks to import, create some first", "error");
                      return;
                    }
                    importTemplateTasks();
                    showNotification("Saved tasks imported");
                  }}
                  className={clsx(
                    "inline-flex cursor-pointer items-center",
                    "rounded-xl px-3 py-2 sm:px-4",
                    "text-sm font-medium",
                    "border border-[var(--border)]",
                    "bg-[var(--card)]",
                    "text-[var(--text-h)]",
                    "transition-all hover:-translate-y-[1px]",
                    "hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]",
                  )}
                >
                  + Saved Tasks
                </button>
              )}

              <DateRangeFilter
                range={tasksFilter.range}
                setRange={handleTasksSetRange}
                customDates={tasksFilter.customDates}
                setCustomDates={handleTasksSetCustomDates}
              />
            </div>

            <DashboardStats tasks={filteredTasks} />

            <TaskFilters
              activeFilters={activeFilters}
              toggleFilter={toggleFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              stats={stats}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />

            <TaskList
              tasks={paginatedTasks}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onToggleTaskComplete={toggleTaskComplete}
              onToggleTaskPin={toggleTaskPin}
              onResetTaskTimer={resetTaskTimer}
              emptyIcon={tasksEmptyState.icon}
              emptyTitle={tasksEmptyState.title}
              emptySubtitle={tasksEmptyState.subtitle}
            />
          </>
        )}

        {/* Saved Templates View */}
        {activeView === "saved" && (
          <TemplatesView
            tasks={templates}
            onAddTask={() => {
              addTemplate();
              showNotification("Task saved to library");
            }}
            onUpdateTask={updateTemplate}
            onDeleteTask={deleteTemplate}
          />
        )}

        {/* Analytics View */}
        {activeView === "analytics" && (
          <AnalyticsView
            tasks={analyticsTasks}
            range={analyticsFilter.range}
            setRange={analyticsFilter.setRange}
            customDates={analyticsFilter.customDates}
            setCustomDates={analyticsFilter.setCustomDates}
          />
        )}

        {/* Guide View */}
        {activeView === "guide" && <GuideView />}

        {/* Account View */}
        {activeView === "account" && <AccountView />}

        {/* Export View */}
        {activeView === "export" && (
          <ExportView
            tasks={exportTasks}
            range={exportFilter.range}
            setRange={exportFilter.setRange}
            customDates={exportFilter.customDates}
            setCustomDates={exportFilter.setCustomDates}
          />
        )}

        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      </div>

      <CompletionPopup popup={popup} onClose={closePopup} />
    </AppLayout>
  );
}

export default Home;
