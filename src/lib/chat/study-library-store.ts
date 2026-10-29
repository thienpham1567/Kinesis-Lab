import {
  EMPTY_STUDY_LIBRARY,
  fitStudyLibrary,
  parseStudyLibrary,
  type StudyLibrary,
} from "./study-library";

const KEY = "kinesis-study-library-v1";
let cached: StudyLibrary | null = null;
let readFailed = false;
const listeners = new Set<() => void>();
export const getServerStudyLibrary = () => EMPTY_STUDY_LIBRARY;
export function getStudyLibrary() {
  if (!cached) {
    try {
      cached = parseStudyLibrary(localStorage.getItem(KEY));
    } catch {
      cached = EMPTY_STUDY_LIBRARY;
      readFailed = true;
    }
  }
  return cached;
}
export const studyLibraryUnavailable = () => readFailed;
export function writeStudyLibrary(next: StudyLibrary) {
  // Fail explicitly instead of claiming a bookmark was saved only in memory.
  const fitted = fitStudyLibrary(next);
  const serialized = JSON.stringify(fitted);
  localStorage.setItem(KEY, serialized);
  cached = fitted;
  readFailed = false;
  listeners.forEach((listener) => listener());
}
function onStorage(event: StorageEvent) {
  if (event.key !== KEY && event.key !== null) return;
  cached = parseStudyLibrary(event.newValue);
  listeners.forEach((listener) => listener());
}
export function subscribeStudyLibrary(listener: () => void) {
  if (!listeners.size) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
