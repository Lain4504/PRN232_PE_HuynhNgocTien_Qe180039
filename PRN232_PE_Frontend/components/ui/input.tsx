import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary/20 selection:text-primary-foreground dark:bg-input/20 border-input/60 flex h-11 w-full min-w-0 rounded-xl border bg-background/60 backdrop-blur-sm px-4 py-2.5 text-base shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:border-border focus:border-ring focus:bg-background focus:shadow-md",
        "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:ring-offset-2",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
