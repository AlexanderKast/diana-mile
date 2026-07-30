/**
 * Monograma de marca compartido entre `icon.tsx` (PWA/favicon) y
 * `apple-icon.tsx` (apple-touch-icon): mismo espiritu que el wordmark del
 * header (serif editorial, dorado sobre crema), un solo lugar donde
 * cambiarlo cuando haya logo de verdad.
 */
export function monogramaMilito(size: number) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F2EDE6",
      }}
    >
      <div
        style={{
          display: "flex",
          color: "#A8885E",
          fontFamily: "serif",
          fontStyle: "italic",
          fontSize: size * 0.44,
          lineHeight: 1,
        }}
      >
        M
      </div>
      <div
        style={{
          display: "flex",
          width: size * 0.16,
          height: Math.max(2, size * 0.014),
          background: "#C4A882",
          marginTop: size * 0.06,
        }}
      />
    </div>
  );
}
