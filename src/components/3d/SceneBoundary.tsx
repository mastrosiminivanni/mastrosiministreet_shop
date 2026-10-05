"use client";

import { Component, type ReactNode } from "react";

/** Se la scena 3D va in errore (WebGL, modello, decodificatore…) mostra l'alternativa invece di rompere la pagina. */
export class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Scena 3D non disponibile, uso l'alternativa:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
