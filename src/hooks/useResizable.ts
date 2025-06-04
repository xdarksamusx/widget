import { useRef, useEffect } from "react";

export const useResizable = (
  setSize: React.Dispatch<
    React.SetStateAction<{ width: number; height: number }>
  >,
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
  edge: "top" | "bottom"
) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startY = e.clientY;
      const startHeight = el.parentElement?.offsetHeight || 0;
      const startTop = el.parentElement?.offsetTop || 0;

      const handleMouseMove = (e: MouseEvent) => {
        const dy = e.clientY - startY;

        if (edge === "bottom") {
          setSize((prev) => ({
            ...prev,
            height: Math.max(200, startHeight + dy),
          }));
        } else if (edge === "top") {
          setSize((prev) => ({
            ...prev,
            height: Math.max(200, startHeight - dy),
          }));
          setPosition((prev) => ({
            ...prev,
            y: prev.y + dy,
          }));
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    el.addEventListener("mousedown", handleMouseDown);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
    };
  }, [edge, setSize, setPosition]);

  return ref;
};
