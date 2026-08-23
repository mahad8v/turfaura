"use client";

import { useEffect } from "react";

// Only fires if the root layout itself throws — the last resort, so it
// renders its own <html>/<body> and stays deliberately dependency-light
// rather than reusing components that assume the layout rendered fine.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#18181b" }}>Something went wrong</h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#71717a", maxWidth: "24rem" }}>
            TurfAura hit an unexpected error loading this page. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.5rem",
              borderRadius: "9999px",
              backgroundColor: "#059669",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
