"use client";

import { EditIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

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

  return (
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
            <EditIcon /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem>
            <TrashIcon /> Excluir
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
  );
};
