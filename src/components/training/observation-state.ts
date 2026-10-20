import type { CameraCommand } from "../atlas3d/types";

export type ObservationState = {
  context: string;
  selectedId: string | null;
  isolatedId: string | null;
  command: CameraCommand;
};

export function initialObservation(
  context: string,
  view: CameraCommand["type"],
  revision = 0,
): ObservationState {
  return {
    context,
    selectedId: null,
    isolatedId: null,
    command: { type: view, revision },
  };
}

export function reconcileObservation(
  state: ObservationState,
  context: string,
  view: CameraCommand["type"],
  visibleIds: ReadonlySet<string>,
): ObservationState {
  if (
    state.context !== context ||
    (state.isolatedId && !visibleIds.has(state.isolatedId))
  ) {
    return initialObservation(context, view, state.command.revision + 1);
  }
  if (state.selectedId && !visibleIds.has(state.selectedId))
    return { ...state, selectedId: null };
  return state;
}
