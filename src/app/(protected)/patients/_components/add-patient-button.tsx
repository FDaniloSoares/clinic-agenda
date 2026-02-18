"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { UpsertPatientForm } from "./upsert-patient-form";

export function AddPatientButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add patient
        </Button>
      </DialogTrigger>

      <DialogContent>
        <UpsertPatientForm isOpen={open} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
