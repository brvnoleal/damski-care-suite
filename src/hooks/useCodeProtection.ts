import { useEffect } from "react";

/**
 * Medidas dissuasivas contra acesso casual ao código-fonte.
 * NÃO impede desenvolvedores experientes — é apenas uma barreira visual.
 */
export function useCodeProtection() {
  useEffect(() => {
    // Bloquear clique direito
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Bloquear atalhos de teclado (F12, Ctrl+Shift+I/J/C, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
        e.preventDefault();
        return;
      }
      // Ctrl+U (view source)
      if (e.ctrlKey && e.key.toUpperCase() === "U") {
        e.preventDefault();
        return;
      }
      // Ctrl+S (save page)
      if (e.ctrlKey && e.key.toUpperCase() === "S") {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Desabilitar seleção de texto via CSS (exceto inputs/textareas)
    const style = document.createElement("style");
    style.id = "code-protection-style";
    style.textContent = `
      *:not(input):not(textarea):not(select) {
        -webkit-user-select: none !important;
        user-select: none !important;
      }
      input, textarea, select {
        -webkit-user-select: text !important;
        user-select: text !important;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      const el = document.getElementById("code-protection-style");
      if (el) el.remove();
    };
  }, []);
}
