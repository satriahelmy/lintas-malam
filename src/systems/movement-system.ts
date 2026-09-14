export interface MovementInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface MovementBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function getNormalizedMovement(input: MovementInput): Vector2 {
  const vector = {
    x: Number(input.right) - Number(input.left),
    y: Number(input.down) - Number(input.up),
  };
  const length = Math.hypot(vector.x, vector.y);

  if (length === 0) return { x: 0, y: 0 };
  return { x: vector.x / length, y: vector.y / length };
}

export function moveWithinBounds(
  position: Vector2,
  input: MovementInput,
  speed: number,
  deltaSeconds: number,
  bounds: MovementBounds,
): Vector2 {
  const direction = getNormalizedMovement(input);
  return {
    x: Math.min(bounds.right, Math.max(bounds.left, position.x + direction.x * speed * deltaSeconds)),
    y: Math.min(bounds.bottom, Math.max(bounds.top, position.y + direction.y * speed * deltaSeconds)),
  };
}
