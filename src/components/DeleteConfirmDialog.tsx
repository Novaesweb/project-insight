import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ShieldAlert } from "lucide-react";

const DELETE_PASSWORD = "180325";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirmar exclusão",
  description = "Esta ação não pode ser desfeita. Digite a senha para confirmar.",
}: DeleteConfirmDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleConfirm = () => {
    if (password === DELETE_PASSWORD) {
      setPassword("");
      setError(false);
      onOpenChange(false);
      onConfirm();
    } else {
      setError(true);
    }
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setPassword("");
      setError(false);
    }
    onOpenChange(value);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-5 h-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Input
            type="password"
            placeholder="Digite a senha de confirmação"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            className={error ? "border-destructive" : ""}
          />
          {error && <p className="text-xs text-destructive">Senha incorreta. Tente novamente.</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); handleConfirm(); }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook helper for easy usage
export function useDeleteConfirm() {
  const [state, setState] = useState<{ open: boolean; callback: (() => void) | null; title?: string; description?: string }>({
    open: false,
    callback: null,
  });

  const requestDelete = (callback: () => void, title?: string, description?: string) => {
    setState({ open: true, callback, title, description });
  };

  const dialogProps = {
    open: state.open,
    onOpenChange: (open: boolean) => setState(prev => ({ ...prev, open })),
    onConfirm: () => state.callback?.(),
    title: state.title,
    description: state.description,
  };

  return { requestDelete, dialogProps };
}
