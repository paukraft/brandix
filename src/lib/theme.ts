const STORAGE_KEY = "theme"

/** Runs in <head> before first paint so the page never flashes the wrong theme. */
export const themeScript = `try{var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`

export function toggleTheme() {
  const root = document.documentElement
  const dark = !root.classList.contains("dark")

  // Hold transitions off while every token flips, then flush.
  root.classList.add("theme-swap")
  root.classList.toggle("dark", dark)
  void root.offsetHeight
  root.classList.remove("theme-swap")

  try {
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light")
  } catch {
    // Private mode: applies, just won't survive a reload.
  }
}
