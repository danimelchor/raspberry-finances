import { Query } from "@/types";
import TogglePinnedButton from "./TogglePinnedButton";
import EditQueryDialog from "./EditQueryDialog";
import { cn } from "@/lib/utils";
import useHistory from "@/hooks/useHistory";

export default function Header({ query: _query }: { query: Query }) {
  const { data: query } = useHistory({
    id: _query.id ?? 0,
    enabled: !!_query.id,
  });

  if (!query) return null;

  return (
    <div className="flex justify-between items-center">
      <h2
        className={cn("text-lg", {
          "font-semibold": query.title,
          "italic text-gray-400": !query.title,
        })}
      >
        {query.title || "Untitled query"}
        {!query.title && query.id && ` (id=${query.id})`}
      </h2>

      <div className="flex gap-1">
        <TogglePinnedButton item={query} size="default" />
        <EditQueryDialog item={query} size="default" />
      </div>
    </div>
  );
}
