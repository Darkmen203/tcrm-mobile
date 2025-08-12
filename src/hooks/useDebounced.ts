import { useRef } from 'react'

export function useDebouncedCallback<T extends unknown[]>(
  fn: (...args: T) => void,
  delay = 400
) {
  const timer = useRef<number | undefined>(undefined)
  return (...args: T) => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => fn(...args), delay)
  }
}
