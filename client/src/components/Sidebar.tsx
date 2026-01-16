import { useHistory } from "@/hooks/use-split";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SidebarProps {
  onSelectHistory: (originalText: string) => void;
  className?: string;
}

export function Sidebar({ onSelectHistory, className = "" }: SidebarProps) {
  const { data: history, isLoading } = useHistory();

  return (
    <div className={`flex flex-col h-full bg-card border-r border-border/50 ${className}`}>
      <div className="p-6 border-b border-border/50">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
          <Clock className="w-5 h-5 text-primary" />
          Recent Splits
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Your previously processed batches
        </p>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        {isLoading ? (
          <div className="space-y-3 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : history?.length === 0 ? (
          <div className="text-center py-10 px-4 text-muted-foreground">
            <p className="text-sm">No history yet.</p>
            <p className="text-xs mt-1">Process some names to see them here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history?.map((item) => {
              // Preview text: first 30 chars of the first line
              const preview = item.originalText.split('\n')[0].substring(0, 25) + (item.originalText.length > 25 ? "..." : "");
              const count = item.originalText.split('\n').filter(Boolean).length;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectHistory(item.originalText)}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-all group border border-transparent hover:border-border/50"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {preview}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
