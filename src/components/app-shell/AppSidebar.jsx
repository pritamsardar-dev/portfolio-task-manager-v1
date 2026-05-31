import { useState, useRef } from "react";
import { createPortal } from "react-dom";

import ThemeToggle from "../ui/ThemeToggle";
import AppLogo from "../branding/AppLogo";
import {
  TasksIcon,
  AnalyticsIcon,
  ExportIcon,
  GuideIcon,
  AccountIcon,
  CloseIcon,
  SavedIcon,
} from "../../assets/icons";

const menus = [
  { key: "tasks", label: "All Tasks", Icon: TasksIcon },
  { key: "saved", label: "Saved Tasks", Icon: SavedIcon },
  { key: "analytics", label: "Analytics", Icon: AnalyticsIcon },
  { key: "export", label: "Export", Icon: ExportIcon },
  { key: "guide", label: "Guide", Icon: GuideIcon },
];

const getCurrentYear = () => new Date().getFullYear();

// Side tooltip uses fixed positioning so sidebar overflow does not clip content
function SideTooltip({ label, show, children, wrapStyle }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  if (!show) {
    return <>{children}</>;
  }

  const handleEnter = () => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    setPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setPos(null)}
      style={{
        position: "relative",
        ...wrapStyle,
      }}
    >
      {children}

      {pos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: "translateY(-50%)",
              background: "var(--text-h)",
              color: "var(--bg)",
              fontSize: 11,
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: 7,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 99999,
              fontFamily: "var(--font-sans)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
            }}
          >
            {label}
          </div>,
          document.body,
        )}
    </div>
  );
}

function AppSidebar({
  collapsed,
  setCollapsed,
  activeView,
  setActiveView,
  mobileOpen,
  setMobileOpen,
}) {
  const handleNav = (key) => {
    setActiveView(key);
    setMobileOpen(false);
  };

  const W_OPEN = 210;
  const W_COLLAPSE = 60;

  const width = collapsed ? W_COLLAPSE : W_OPEN;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="sticky top-0 flex-shrink-0 border-r border-[var(--border)]"
        style={{
          width,
          height: "100svh",
          background: "var(--card)",
          transition: "width 0.24s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
        }}
        data-desktop-sidebar
      >
        <style>{`
          @media (max-width: 639px) {
            [data-desktop-sidebar] {
              display: none !important;
            }
          }

          .tf-brand-wrap {
            position: relative;
            width: 32px;
            height: 32px;
            cursor: pointer;
            flex-shrink: 0;
          }

          .tf-brand-logo {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.18s ease;
          }

          .tf-brand-wrap:hover .tf-brand-logo {
            opacity: 0;
          }

          .tf-brand-arrow {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9px;
            border: 1px solid transparent;
            background: transparent;
            color: var(--accent);
            font-size: 18px;
            line-height: 1;
            opacity: 0;
            transition:
              opacity 0.18s ease,
              background 0.18s ease,
              border-color 0.18s ease;
          }

          .tf-brand-wrap:hover .tf-brand-arrow {
            opacity: 1;
            background: var(--accent-bg);
            border-color: var(--accent-border);
          }

          .tf-collapse-btn:hover {
            background: var(--accent-bg) !important;
            border-color: var(--accent-border) !important;
            color: var(--accent) !important;
          }

          .tf-nav-btn:not([data-active="true"]):hover {
            background: var(--accent-bg) !important;
            color: var(--accent) !important;
          }
        `}</style>

        <SidebarInner
          collapsed={collapsed}
          width={width}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          activeView={activeView}
          onNav={handleNav}
          showCollapse
        />
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          onClick={() => setMobileOpen(false)}
          style={{
            background: "rgba(0,0,0,0.10)",
            backdropFilter: "blur(0.5px)",
            WebkitBackdropFilter: "blur(0.5px)",
          }}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className="sm:hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 220,
          height: "100svh",
          background: "var(--card)",
          borderRight: "1px solid var(--border)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.24s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SidebarInner
          collapsed={false}
          width={220}
          activeView={activeView}
          onNav={handleNav}
          onClose={() => setMobileOpen(false)}
          showClose
        />
      </aside>
    </>
  );
}

function SidebarInner({
  collapsed,
  width,
  onToggleCollapse,
  activeView,
  onNav,
  onClose,
  showCollapse,
  showClose,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width,
      }}
    >
      {/* Brand */}
      <div
        style={{
          flexShrink: 0,
          height: 65,
          padding: collapsed ? "0" : "0 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 8,
        }}
      >
        {collapsed ? (
          <div className="tf-brand-wrap" onClick={onToggleCollapse}>
            <div className="tf-brand-logo">
              <AppLogo iconOnly size={32} onClick={() => onNav("tasks")} />
            </div>
            <div className="tf-brand-arrow">›</div>
          </div>
        ) : (
          <>
            <AppLogo collapsed={false} size={32} onClick={() => onNav("tasks")} />

            {showCollapse && (
              <button
                onClick={onToggleCollapse}
                className="tf-collapse-btn"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-h)",
                  fontSize: 18,
                  lineHeight: 1,
                  transition: "all 0.18s ease",
                  flexShrink: 0,
                }}
              >
                ‹
              </button>
            )}
          </>
        )}

        {showClose && (
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              border: "1px solid var(--border)",
              background: "var(--card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-h)",
              transition: "all 0.16s ease",
              flexShrink: 0,
              marginLeft: "auto",
            }}
          >
            <CloseIcon className="w-[13px] stroke-2" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 6px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {menus.map((item) => {
          const active = activeView === item.key;

          return (
            <SideTooltip
              key={item.key}
              label={item.label}
              show={collapsed}
              wrapStyle={{ width: "100%" }}
            >
              <button
                onClick={() => onNav(item.key)}
                className="tf-nav-btn"
                data-active={active}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : 9,
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "10px 0" : "9px 10px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  background: active ? "var(--accent-bg)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text)",
                  transition: "all 0.14s ease",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <item.Icon className="w-[16px] sm:w-[17px] lg:w-[18px]" style={{ flexShrink: 0 }} />

                {!collapsed && (
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                )}
              </button>
            </SideTooltip>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid var(--border)",
        }}
      >
        {/* Account Nav */}
        <div style={{ padding: "6px 6px 0" }}>
          <SideTooltip label="Account" show={collapsed} wrapStyle={{ width: "100%" }}>
            <button
              onClick={() => onNav("account")}
              className="tf-nav-btn"
              data-active={activeView === "account"}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: collapsed ? 0 : 9,
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "10px 0" : "9px 10px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: activeView === "account" ? 600 : 400,
                background: activeView === "account" ? "var(--accent-bg)" : "transparent",
                color: activeView === "account" ? "var(--accent)" : "var(--text)",
                transition: "all 0.14s ease",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <AccountIcon className="w-[16px] sm:w-[17px] lg:w-[18px]" style={{ flexShrink: 0 }} />

              {!collapsed && (
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Account</span>
              )}
            </button>
          </SideTooltip>
        </div>

        {/* Theme */}
        <div
          style={{
            padding: "8px 12px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
          }}
        >
          {!collapsed && (
            <p
              style={{
                margin: 0,
                fontSize: 12,
                opacity: 0.45,
                color: "var(--text)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Theme
            </p>
          )}

          <ThemeToggle collapsed={collapsed} />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: collapsed ? "14px 6px 10px" : "12px 10px 12px",
            marginTop: collapsed ? "6px" : "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              color: "var(--text)",
              opacity: 0.5,
              fontFamily: "var(--font-sans)",
              textAlign: "center",
              lineHeight: 1.35,
              maxWidth: collapsed ? "100%" : "180px",
              whiteSpace: collapsed ? "nowrap" : "normal",
            }}
          >
            {collapsed ? (
              <>© {getCurrentYear()}</>
            ) : (
              <>© 2023 – {getCurrentYear()} TaskFlow · Designed & developed by Pritam Sardar</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppSidebar;
