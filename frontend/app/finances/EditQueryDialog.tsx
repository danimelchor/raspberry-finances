import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { EditIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DisplayTypeSelect from "./DisplayTypeSelect";
import { Label } from "@/components/ui/label";
import type { Query } from "@/types";
import useUpdateHistory from "@/hooks/useUpdateHistory";
import { cn } from "@/lib/utils";

function EditQueryDialog({
  item: _item,
  size,
}: {
  item: Query;
  size?: "sm" | "default";
}) {
  const { mutateAsync } = useUpdateHistory();
  const [open, setOpen] = useState(false);

  const [item, setItem] = useState(_item);
  useEffect(() => {
    setItem(_item);
  }, [_item]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutateAsync(item).then(() => setOpen(false));
  };

  if (!item.id) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          size={size || "sm"}
          variant="ghost"
          className={cn({
            "px-1": size === "sm",
            "px-1.5": size === "default",
          })}
        >
          <EditIcon
            className={cn({ "w-5": size === "sm", "w-10": size === "default" })}
          />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            <DialogTitle>Edit history item</DialogTitle>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                name="title"
                value={item.title}
                onChange={(e) => setItem({ ...item, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="display_type">Display type</Label>
              <DisplayTypeSelect
                name="display_type"
                value={item.display_type}
                setValue={(v) => setItem({ ...item, display_type: v })}
                fullSize
              />
            </div>
            <Button onClick={onSubmit} type="submit">
              Save
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default EditQueryDialog;
