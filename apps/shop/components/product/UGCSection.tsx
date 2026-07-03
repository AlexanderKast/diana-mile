type UGCPost = {
  emoji: string;
  title: string;
  text: string;
  bg: "bg-lila-suave" | "bg-crema";
};

const POSTS: UGCPost[] = [
  {
    emoji: "💆‍♀️",
    title: "Para la cara + el cuerpo",
    text: "Muchas clientas lo usan en rostro (piel grasa/mixta) y en cuerpo el mismo día. Un solo producto, doble uso.",
    bg: "bg-lila-suave",
  },
  {
    emoji: "🌙",
    title: "Como ritual de noche",
    text: "5 minutos antes de tu sérum. La exfoliación suave prepara la piel para absorber mejor los activos nocturnos.",
    bg: "bg-crema",
  },
  {
    emoji: "☀️",
    title: "Rutina de mañana",
    text: "Al despertar, activa la circulación y deja la piel lista para el maquillaje. Poros visiblemente más finos.",
    bg: "bg-lila-suave",
  },
  {
    emoji: "🎁",
    title: "El regalo perfecto",
    text: "El empaque de papel reciclado con diseño botánico es un regalo que se ve lujoso sin envolver.",
    bg: "bg-crema",
  },
];

export function UGCSection() {
  return (
    <div>
      <h2 className="font-display text-2xl text-carbon text-center">
        Así lo están usando
      </h2>
      <p className="font-sans text-[13px] text-ceniza text-center mt-1">
        Mujeres reales · Resultados reales
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {POSTS.map((post) => (
          <div key={post.title} className={`p-5 rounded-2xl ${post.bg}`}>
            <span className="text-3xl">{post.emoji}</span>
            <p className="font-sans text-[13px] font-semibold text-carbon mt-2">
              {post.title}
            </p>
            <p className="font-sans text-xs text-carbon-suave leading-relaxed mt-1">
              {post.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
