import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { Search } from "lucide-react";
import { type InputHTMLAttributes } from "react";

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-9" type="search" {...props} />
    </div>
  );
}
