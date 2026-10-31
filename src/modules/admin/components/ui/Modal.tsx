"use client";

import { useEffect, useRef } from "react";
import { X } from "../../icons";
import { cn } from "../../lib/utils";

export function Modal({
  title,
  subtitle,
  children,
  footer,
  onClose,
  size = "md",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="adm-modal-layer"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-modal-title"
        tabIndex={-1}
        className={cn("adm-modal", `adm-modal-${size}`)}
      >
        <header className="adm-modal-head">
          <div>
            <h2 id="adm-modal-title">{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="adm-icon-btn"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={19} />
          </button>
        </header>
        <div className="adm-modal-body">{children}</div>
        {footer ? <footer className="adm-modal-foot">{footer}</footer> : null}
      </div>
    </div>
  );
}
