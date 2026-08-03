import type { PasoEscala as TipoPaso } from "@/lib/quiz/tipos";

export function PasoEscala({
  paso,
  valor,
  onCambiar,
}: {
  paso: TipoPaso;
  valor: unknown;
  onCambiar: (valor: number) => void;
}) {
  const actual =
    typeof valor === "number"
      ? valor
      : (paso.valorInicial ?? Math.round((paso.min + paso.max) / 2));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center font-display text-4xl text-carbon">{actual}</p>
      <input
        type="range"
        min={paso.min}
        max={paso.max}
        step={paso.paso ?? 1}
        value={actual}
        onChange={(e) => onCambiar(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-arena accent-dorado-oscuro"
      />
      <div className="flex items-center justify-between text-xs text-ceniza">
        <span>{paso.etiquetaMin ?? paso.min}</span>
        <span>{paso.etiquetaMax ?? paso.max}</span>
      </div>
    </div>
  );
}
