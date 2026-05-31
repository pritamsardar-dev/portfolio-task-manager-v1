import clsx from "clsx";

import { HamburgerIcon } from "../../assets/icons";
import AppLogo from "../branding/AppLogo";

function AppHeader({ title, subtitle }) {
  return (
    <div className="pb-3 pt-3 sm:pt-5">
      <h1 className="!m-0 !mb-1 !text-2xl font-semibold tracking-tight">{title}</h1>

      <p className="text-sm opacity-60">{subtitle}</p>
    </div>
  );
}

export function MobileHeader({ onMobileMenu, mobileOpen }) {
  return (
    <>
      {/* Mobile Styles */}
      <style>{`
        @media (min-width: 640px) {
          [data-mobile-header] {
            display: none !important;
          }
        }

        .tf-mobile-menu-btn:hover {
          background: var(--accent-bg) !important;
          border-color: var(--accent-border) !important;
          color: var(--accent) !important;
        }

        .tf-mobile-menu-btn:active {
          background: var(--accent) !important;
          border-color: var(--accent) !important;
          color: #fff !important;
          transform: scale(0.96);
        }
      `}</style>

      {/* Mobile Header */}
      <div
        data-mobile-header
        className={clsx(
          "sticky top-0 z-30",
          "flex h-[65px] shrink-0 items-center justify-between",
          "border-b border-[var(--border)]",
          "px-4",
          "backdrop-blur-[14px]",
        )}
        style={{
          background: "color-mix(in srgb, var(--card) 72%, transparent)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        {/* App Logo */}
        <AppLogo size={34} onClick={() => (window.location.href = "/")} />

        {/* Menu Button */}
        {!mobileOpen && (
          <button
            onClick={onMobileMenu}
            className={clsx(
              "tf-mobile-menu-btn",
              "flex h-[38px] w-[38px] shrink-0 items-center justify-center",
              "rounded-xl border border-[var(--border)]",
              "bg-[var(--card)]",
              "text-[var(--text-h)]",
              "transition-all duration-150",
            )}
          >
            <HamburgerIcon className="w-[20px]" />
          </button>
        )}
      </div>
    </>
  );
}

export default AppHeader;
