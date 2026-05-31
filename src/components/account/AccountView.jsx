import clsx from "clsx";

import { AccountIcon, AnalyticsIcon, TickIcon } from "../../assets/icons";

function AccountView() {
  const privacy = [
    "Data stays only in your browser storage",
    "No account, email, or password needed",
    "No third party access to your tasks",
    "Works offline with instant loading",
  ];

  const coming = [
    "Team workspaces and shared task boards",
    "Live collaboration and real time updates",
    "Cloud sync across devices",
    "Team analytics and reports",
    "Notifications and reminders",
    "Role based permissions and access",
  ];

  return (
    <section className="w-full max-w-[1200px]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {/* Privacy Card */}
        <div
          className={clsx(
            "flex flex-col gap-5",
            "rounded-3xl border p-6",
            "bg-[var(--card)]",
            "border-[var(--border)]",
          )}
        >
          {/* Card Header */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={clsx(
                "flex size-11 shrink-0 items-center justify-center",
                "rounded-2xl border",
                "bg-[var(--accent-bg)]",
                "border-[var(--accent-border)]",
                "text-[var(--accent)]",
              )}
            >
              <AccountIcon className="size-[18px]" />
            </div>

            {/* Header Content */}
            <div>
              <h2
                className={clsx(
                  "text-[15px] font-semibold tracking-[-0.02em]",
                  "font-[var(--font-heading)]",
                  "text-[var(--text-h)]",
                  "opacity-70",
                )}
              >
                No Account Required
              </h2>

              <p
                className={clsx(
                  "mt-1 text-[13px]",
                  "font-[var(--font-sans)]",
                  "text-[var(--text)]",
                  "opacity-60",
                )}
              >
                TaskFlow works instantly without setup.
              </p>
            </div>
          </div>

          {/* Description */}
          <p
            className={clsx(
              "m-0 text-[13.5px] leading-[1.65]",
              "font-[var(--font-sans)]",
              "text-[var(--text)]",
              "opacity-65",
            )}
          >
            Your tasks, timers, and saved templates stay directly inside your browser storage. No
            signup, no tracking, and no external servers. Your data stays private and fully under
            your control.
          </p>

          {/* Privacy Features */}
          <div className="flex flex-col gap-2.5 pt-1">
            {privacy.map((text) => (
              <div
                key={text}
                className={clsx(
                  "flex items-start gap-2.5",
                  "text-[13px]",
                  "font-[var(--font-sans)]",
                  "text-[var(--text)]",
                  "opacity-70",
                )}
              >
                <TickIcon className="mt-[2px] size-[13px] shrink-0 text-[var(--accent)]" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Features Card */}
        <div
          className={clsx(
            "flex flex-col gap-5",
            "rounded-3xl border p-6",
            "bg-[var(--accent-bg)]",
            "border-[var(--accent-border)]",
          )}
        >
          {/* Card Header */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={clsx(
                "flex size-11 shrink-0 items-center justify-center",
                "rounded-2xl border",
                "bg-[var(--card)]",
                "border-[var(--accent-border)]",
                "text-[var(--accent)]",
              )}
            >
              <AnalyticsIcon className="size-[18px]" />
            </div>

            {/* Header Content */}
            <div>
              {/* Version Badge */}
              <span
                className={clsx(
                  "block text-[10px] font-bold tracking-[0.1em] uppercase",
                  "font-[var(--font-sans)]",
                  "text-[var(--accent)]",
                  "opacity-65",
                )}
              >
                Coming in v2
              </span>

              <h2
                className={clsx(
                  "mt-1.5 text-[15px] font-semibold tracking-[-0.02em]",
                  "font-[var(--font-heading)]",
                  "text-[var(--text-h)]",
                  "opacity-70",
                )}
              >
                Accounts and Collaboration
              </h2>

              <p
                className={clsx(
                  "mt-1 text-[13px]",
                  "font-[var(--font-sans)]",
                  "text-[var(--text)]",
                  "opacity-60",
                )}
              >
                Future updates will bring team features and cloud sync.
              </p>
            </div>
          </div>

          {/* Features List */}
          <ul
            className={clsx(
              "m-0 flex flex-col gap-2.5 pl-5",
              "[list-style-type:disc]",
              "text-[13px]",
              "font-[var(--font-sans)]",
              "text-[var(--text)]",
              "opacity-70",
              "marker:text-[var(--accent)]",
            )}
          >
            {coming.map((text) => (
              <li key={text} className="leading-[1.5]">
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AccountView;
