import type { ExpressionSpecification } from 'maplibre-gl'

const MAP_FOCUS_MUTED_COLOR = '#94a3b8'
const MAP_FOCUS_MUTED_OPACITY = 0.3

export function focusCaseColor(
  matchExpression: unknown,
  activeColor: unknown,
  mutedColor: string = MAP_FOCUS_MUTED_COLOR,
): ExpressionSpecification {
  return ['case', matchExpression, activeColor, mutedColor] as ExpressionSpecification
}

export function focusCaseOpacity(
  matchExpression: unknown,
  activeOpacity: number,
  mutedOpacity: number = MAP_FOCUS_MUTED_OPACITY,
): ExpressionSpecification {
  return ['case', matchExpression, activeOpacity, mutedOpacity] as ExpressionSpecification
}
