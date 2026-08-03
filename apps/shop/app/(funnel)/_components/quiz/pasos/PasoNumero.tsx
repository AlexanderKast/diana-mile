import type { PasoNumero as TipoPaso } from "@/lib/quiz/tipos";

export function PasoNumero({
  paso,
  valor,
  onCambiar,
}: {
  paso: TipoPaso;
  valor: unknown;
  onCambiar: (valor: number | undefined) => void;
}) {
  const texto = typeof valor === "number" ? String(valor) : "";

  return (
    <div className="flex items-center justify-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        autoFocus
        min={paso.min}
        max={paso.max}
        placeholder={paso.placeholder}
        value={texto}
        onChange={(e) => {
          const bruto = e.target.value;
          onCambiar(bruto === "" ? undefined : Number(bruto));
        }}
        className="min-h-14 w-40 rounded-2xl border-2 border-arena bg-blanco px-4 py-2.5 text-center text-2xl text-carbon focus:border-dorado-oscuro focus:outline-none"
      />
      {paso.unidad && (
        <span className="text-base text-carbon-suave">{paso.unidad}</span>
      )}
    </div>
  );
}
