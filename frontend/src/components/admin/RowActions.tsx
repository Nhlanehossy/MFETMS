import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";

export function RowActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {onEdit ? <Button type="button" variant="secondary" onClick={onEdit}><Pencil size={14} /> Edit</Button> : null}
      {onDelete ? <Button type="button" variant="danger" onClick={onDelete}><Trash2 size={14} /> Delete</Button> : null}
    </div>
  );
}
