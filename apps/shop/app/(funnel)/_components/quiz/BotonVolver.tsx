export function BotonVolver({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!visible}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-carbon-suave transition-opacity disabled:opacity-0"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12.5 4.5L6 10l6.5 5.5" />
      </svg>
      <span className="sr-only">Volver</span>
    </button>
  );
}
