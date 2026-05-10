export interface DOMRectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Track edge routing to prevent overlaps
const routeCounts: Record<string, number> = {};

export function computeEdgePath(
  edgeId: string,
  sourceBounds: DOMRectBounds | null, 
  targetBounds: DOMRectBounds | null, 
  defaultSource: {x: number, y: number}, 
  defaultTarget: {x: number, y: number}
): { x1: number, y1: number, x2: number, y2: number, path: string, labelX: number, labelY: number } {
  
  // Safe fallbacks using default coordinates if bounds are missing (assumes default 140x60 node)
  const src = sourceBounds || { x: defaultSource.x, y: defaultSource.y, width: 140, height: 60 };
  const tgt = targetBounds || { x: defaultTarget.x, y: defaultTarget.y, width: 140, height: 60 };

  const srcCenter = { x: src.x + src.width / 2, y: src.y + src.height / 2 };
  const tgtCenter = { x: tgt.x + tgt.width / 2, y: tgt.y + tgt.height / 2 };

  const dx = tgtCenter.x - srcCenter.x;
  const dy = tgtCenter.y - srcCenter.y;
  
  // Prefer horizontal routing unless dy is overwhelmingly larger than dx
  const isVertical = Math.abs(dy) > Math.abs(dx) * 1.5;

  let x1, y1, x2, y2;
  const ARROW_OFFSET = 8; // Adjust for marker width
  
  // Vertical shift to separate overlapping edges leaving the same node
  // We use a deterministic hash of the edgeId to slightly shift the origin
  const shift = (edgeId.charCodeAt(0) % 3 - 1) * 10; 

  if (isVertical) {
    if (dy > 0) {
      // Top to bottom
      x1 = srcCenter.x + shift;
      y1 = src.y + src.height;
      x2 = tgtCenter.x + shift;
      y2 = tgt.y - ARROW_OFFSET;
    } else {
      // Bottom to top
      x1 = srcCenter.x + shift;
      y1 = src.y;
      x2 = tgtCenter.x + shift;
      y2 = tgt.y + tgt.height + ARROW_OFFSET;
    }
  } else {
    if (dx > 0) {
      // Left to right
      x1 = src.x + src.width;
      y1 = srcCenter.y + shift;
      x2 = tgt.x - ARROW_OFFSET;
      y2 = tgtCenter.y + shift;
    } else {
      // Right to left
      x1 = src.x;
      y1 = srcCenter.y + shift;
      x2 = tgt.x + tgt.width + ARROW_OFFSET;
      y2 = tgtCenter.y + shift;
    }
  }

  let path = '';
  let cx1, cy1_c, cx2, cy2_c;
  if (isVertical) {
    const distY = Math.abs(y2 - y1);
    cy1_c = dy > 0 ? y1 + distY / 2 : y1 - distY / 2;
    cy2_c = dy > 0 ? y2 - distY / 2 : y2 + distY / 2;
    cx1 = x1;
    cx2 = x2;
    path = `M ${x1} ${y1} C ${cx1} ${cy1_c}, ${cx2} ${cy2_c}, ${x2} ${y2}`;
  } else {
    const distX = Math.abs(x2 - x1);
    // Use dynamic control points for smoother curves, proportional to distance to avoid "knots"
    const curveIntensity = Math.min(distX / 2, 40);
    cx1 = dx > 0 ? x1 + curveIntensity : x1 - curveIntensity;
    cx2 = dx > 0 ? x2 - curveIntensity : x2 + curveIntensity;
    cy1_c = y1;
    cy2_c = y2;
    path = `M ${x1} ${y1} C ${cx1} ${cy1_c}, ${cx2} ${cy2_c}, ${x2} ${y2}`;
  }

  // Calculate midpoint for t=0.5 on cubic bezier: B(0.5) = (P0 + 3P1 + 3P2 + P3) / 8
  const labelX = (x1 + 3 * cx1 + 3 * cx2 + x2) / 8;
  const labelY = (y1 + 3 * cy1_c + 3 * cy2_c + y2) / 8;

  return { x1, y1, x2, y2, path, labelX, labelY };
}
