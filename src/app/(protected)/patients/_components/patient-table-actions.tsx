"use client";

import { EditIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deletePatient } from "@/actions/delete-patient";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pacientsTable } from "@/db/schema";

import { UpsertPatientForm } from "./upsert-patient-form";

type Patient = typeof pacientsTable.$inferSelect;

export const PatientsTableActions = ({ patient }: { patient: Patient }) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deletePatient(patient.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Paciente excluído com sucesso!");
        setDeleteDialogIsOpen(false);
      }
    } catch {
      toast.error("Erro ao excluir paciente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={upsertDialogIsOpen} onOpenChange={setUpsertDialogIsOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{patient?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setUpsertDialogIsOpen(true)}>
              <EditIcon className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteDialogIsOpen(true)}>
              <TrashIcon className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent>
          <UpsertPatientForm
            isOpen={upsertDialogIsOpen}
            onSuccess={() => setUpsertDialogIsOpen(false)}
            defaultValues={patient}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteDialogIsOpen}
        onOpenChange={setDeleteDialogIsOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente {patient.name}? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
