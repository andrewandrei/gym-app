// styles/typography.ts
import { Colors } from "./colors";

export const Typography = {
  h1: { fontSize: 38, fontWeight: "700", letterSpacing: -0.8, lineHeight: 44, color: Colors.text },
  h2: { fontSize: 24, fontWeight: "700", letterSpacing: -0.3, lineHeight: 28, color: Colors.text },
  h3: { fontSize: 19, fontWeight: "700", letterSpacing: -0.2, lineHeight: 24, color: Colors.text },

  body: { fontSize: 16, fontWeight: "500", lineHeight: 22, color: Colors.text },
  meta: { fontSize: 13, fontWeight: "500", letterSpacing: 0.2, lineHeight: 18, color: Colors.muted },

  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
    color: "#9A9A9A",
  },

  buttonPrimary: { fontSize: 17, fontWeight: "600", letterSpacing: -0.1, color: Colors.surface },
  buttonSecondary: { fontSize: 15, fontWeight: "600", letterSpacing: -0.1, color: Colors.text },
};