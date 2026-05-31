import AppSidebar from "./AppSidebar";

function AppLayout({
  children,
  collapsed,
  setCollapsed,
  activeView,
  setActiveView,
  mobileOpen,
  setMobileOpen,
}) {
  return (
    <>
      {/* Sidebar */}
      <AppSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeView={activeView}
        setActiveView={setActiveView}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className="min-w-0 flex-1"
        style={{
          background: "var(--bg)",
          minHeight: "100svh",
        }}
      >
        {children}
      </main>
    </>
  );
}

export default AppLayout;
