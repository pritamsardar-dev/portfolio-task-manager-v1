export default function TaskFlowLogo({ size = 8, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* background */}
      <rect width="64" height="64" rx="14" fill="#8B5CF6" />

      {/* tick */}
      <path
        d="M18 34L27 43L46 22"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
