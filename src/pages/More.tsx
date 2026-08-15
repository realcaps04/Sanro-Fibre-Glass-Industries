import { settingsItem, navItems } from "@/components/layout/nav";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function More() {
  const items = [...navItems.filter((item) => item.more), settingsItem];

  return (
    <div>
      <PageHeader title="More" />
      <div className="elevated divide-y divide-border rounded-lg">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/70"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 font-medium">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
