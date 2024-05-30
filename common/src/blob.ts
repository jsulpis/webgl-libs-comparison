export const setupBlob = (
  canvas: HTMLCanvasElement,
  onMouseUpdate: (coords: { x: number; y: number }) => void
) => {
  const canvasGeometry = getCanvasGeometry(canvas);
  const targetMouse = { x: 0, y: 0 };

  function onMouseMove({ x, y }: MouseEvent) {
    targetMouse.x = (x - canvasGeometry.center.x) / (canvasGeometry.width / 2);
    targetMouse.y = (y - canvasGeometry.center.y) / (canvasGeometry.height / 2);
  }

  requestAnimationFrame(function animate() {
    requestAnimationFrame(animate);
    onMouseUpdate?.({ x: targetMouse.x, y: targetMouse.y });
  });

  canvas.addEventListener("pointerenter", () => {
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener(
      "pointerout",
      () => {
        targetMouse.x = targetMouse.y = 0;
        canvas.removeEventListener("mousemove", onMouseMove);
      },
      { once: true }
    );
  });
};

function getCanvasGeometry(canvas: HTMLCanvasElement) {
  const { top, right, bottom, left } = canvas.getBoundingClientRect();
  const canvasGeometry = {
    center: {
      x: (left + right) / 2,
      y: (top + bottom) / 2,
    },
    width: right - left,
    height: top - bottom,
  };

  window.addEventListener("resize", () => {
    const { top, right, bottom, left } = canvas.getBoundingClientRect();
    canvasGeometry.center = {
      x: (left + right) / 2,
      y: (top + bottom) / 2,
    };
    canvasGeometry.width = right - left;
    canvasGeometry.height = top - bottom;
  });

  return canvasGeometry;
}
