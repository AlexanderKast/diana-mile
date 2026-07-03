function HomeIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
    </svg>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z" />
      <path d="M3.5 8v8L12 20l8.5-4V8" />
      <path d="M12 12v8" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 5.5h16v11H9l-4 3.5v-3.5H4v-11Z" />
    </svg>
  );
}

const ITEMS = [
  { Icon: HomeIcon, label: "Pagas al recibir" },
  { Icon: PackageIcon, label: "Envío 24-72h" },
  { Icon: ChatIcon, label: "Soporte por WhatsApp" },
];

export function GuaranteeSection() {
  return (
    <section className="bg-crema py-12 px-6 text-center">
      <h2 className="font-display text-2xl text-carbon">Tu pedido está protegido</h2>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {ITEMS.map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <Icon className="text-morado" />
            <span className="text-xs text-ceniza">{label}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-md mx-auto text-sm text-carbon-suave leading-relaxed">
        Si el producto llega en mal estado, lo reponemos sin costo adicional. Tu satisfacción es
        nuestra garantía.
      </p>
    </section>
  );
}
