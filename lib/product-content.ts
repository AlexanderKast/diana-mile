import type { Product } from "@/types";

export type ProductBenefit = {
  icon: "gota" | "mineral" | "hoja" | "sol" | "escudo" | "planeta";
  title: string;
  description: string;
};

export function isEpochProduct(product: Product): boolean {
  return /epoch|polishing bar/i.test(product.title);
}

export function getProductEyebrow(product: Product): string {
  return isEpochProduct(product) ? "Coleccion Epoch® · Nu Skin" : "Ritual Milito Life Shop";
}

export function getProductTagline(product: Product): string {
  return isEpochProduct(product)
    ? "Sabiduria indigena. Mineralizacion profunda. Piel transformada."
    : product.description || "Un ritual de cuidado elegido para tu piel.";
}

export function getPrimaryProductBenefits(product: Product): ProductBenefit[] {
  if (isEpochProduct(product)) {
    return [
      {
        icon: "gota",
        title: "Limpieza profunda sin jabon",
        description: "No reseca ni altera el pH natural. Tu piel limpia sin sentirse tirante.",
      },
      {
        icon: "mineral",
        title: "Mas de 50 minerales marinos",
        description: "Zinc, Cobre, Magnesio y Plata: cada uso nutre mientras limpia.",
      },
      {
        icon: "hoja",
        title: "Exfoliacion suave natural",
        description: "Polvo de corteza Tsuga Heterophylla exfolia sin irritar.",
      },
      {
        icon: "sol",
        title: "Piel radiante desde el primer uso",
        description: "Textura visiblemente mas suave despues de la primera aplicacion.",
      },
      {
        icon: "escudo",
        title: "Probado dermatologicamente",
        description: "Seguro para piel sensible. Uso diario recomendado.",
      },
      {
        icon: "planeta",
        title: "Empaque 100% reciclado",
        description: "Caja de papel reciclado. Compromiso con la tierra y contigo.",
      },
    ];
  }

  return [
    {
      icon: "gota",
      title: "Ritual facil de usar",
      description: "Integra este producto a tu rutina diaria sin pasos complicados.",
    },
    {
      icon: "sol",
      title: "Cuidado visible",
      description: "Pensado para acompañar una piel mas luminosa y con mejor textura.",
    },
    {
      icon: "escudo",
      title: "Compra contraentrega",
      description: "Pide desde Colombia y paga cuando recibas el producto.",
    },
  ];
}

export function getIngredientStory(product: Product) {
  if (!isEpochProduct(product)) return null;

  return {
    title: "El secreto que la naturaleza guardo por siglos",
    body:
      "La leyenda cuenta que los pueblos indigenas del Noroeste del Pacifico intentaron fabricar ceramica con la arcilla marina glacial de la Columbia Britanica y, al retirarla de sus manos, descubrieron algo inesperado: su piel quedaba extraordinariamente suave e hidratada. Ese descubrimiento ancestral es el corazon de cada Epoch® Polishing Bar.",
  };
}
