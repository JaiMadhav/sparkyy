import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  // If system, determine actual theme (simplified for now to just light/dark)
  const isLight = theme === "light";

  return (
    <Button
      variant="ghost"
      size="icon"
      title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className="rounded-full w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-900 border border-slate-700/80 shadow-sm hover:shadow-[0_0_15px_rgba(52,211,153,0.15)] hover:border-emerald-500/50 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
    >
      {isLight ? (
        <Moon className="h-5 w-5 text-slate-300" />
      ) : (
        <Sun className="h-5 w-5 text-slate-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
