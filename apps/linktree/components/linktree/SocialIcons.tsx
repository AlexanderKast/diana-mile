type IconProps = {
  className?: string;
};

export function BagIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5.5 6.5h9l.7 10.5a1 1 0 0 1-1 1.07H5.8a1 1 0 0 1-1-1.07l.7-10.5Z" />
      <path d="M7.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 17.5 5.4 14a6.7 6.7 0 1 1 2.6 2.6L4.5 17.5Z" />
      <path d="M7.6 8.4c0 3 2.5 5.5 5.5 5.5.5 0 .9-.6.9-1.1 0-.2-.1-.4-.3-.5l-1.4-.9c-.2-.1-.5-.1-.6.1l-.4.5a4 4 0 0 1-2.3-2.3l.5-.4c.2-.2.2-.4.1-.6l-.9-1.4a.6.6 0 0 0-.5-.3c-.5 0-1.1.4-1.1.9 0 .2.2.3.5.5Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="14" height="14" rx="4" />
      <circle cx="10" cy="10" r="3.2" />
      <circle cx="13.6" cy="6.4" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11.5 3v9.3a2.5 2.5 0 1 1-2.2-2.5" />
      <path d="M11.5 3c.3 2 1.8 3.5 3.8 3.7" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 10h11" />
      <path d="M11 5.5 15.5 10 11 14.5" />
    </svg>
  );
}
