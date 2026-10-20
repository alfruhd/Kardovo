/**
 * Exports an SVG DOM element to a high-resolution PNG data URL or Blob.
 * Can be used for OG image generation or browser fallback.
 */
export async function exportSvgToPng(
  svgElement: SVGSVGElement,
  scale: number = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const xml = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const width = (svgElement.clientWidth || 200) * scale;
        const height = (svgElement.clientHeight || 200) * scale;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(blobUrl);

        try {
          const pngDataUrl = canvas.toDataURL('image/png');
          resolve(pngDataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Failed to load SVG into image for PNG export'));
      };

      img.src = blobUrl;
    } catch (err) {
      reject(err);
    }
  });
}
