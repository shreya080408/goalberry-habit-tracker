/**
 * main-icon-strawberry — the project's canonical icon.
 * Use this everywhere an icon is required in the design.
 */
export function StrawberryIcon({
  className,
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* leaves */}
      <path
        d="M12 3.2c1.5-1.2 3-1.6 4.6-1.4-.3 1.3-1 2.3-2.1 3 1.4-.3 2.7-.1 3.9.6-.9 1-2 1.6-3.3 1.8H8.9c-1.3-.2-2.4-.8-3.3-1.8 1.2-.7 2.5-.9 3.9-.6-1.1-.7-1.8-1.7-2.1-3C9 1.6 10.5 2 12 3.2Z"
        fill={color}
      />
      {/* berry body */}
      <path
        d="M12 7.2c3.6 0 6.4 2 6.4 5 0 4.1-3.6 9.6-6.4 9.6s-6.4-5.5-6.4-9.6c0-3 2.8-5 6.4-5Z"
        fill={color}
      />
      {/* seeds */}
      <g fill="var(--main-light)" opacity="0.85">
        <circle cx="9.6" cy="11.2" r="0.6" />
        <circle cx="12" cy="10.2" r="0.6" />
        <circle cx="14.4" cy="11.2" r="0.6" />
        <circle cx="10.6" cy="13.8" r="0.6" />
        <circle cx="13.4" cy="13.8" r="0.6" />
        <circle cx="12" cy="16.4" r="0.6" />
      </g>
    </svg>
  );
}

export default StrawberryIcon;
