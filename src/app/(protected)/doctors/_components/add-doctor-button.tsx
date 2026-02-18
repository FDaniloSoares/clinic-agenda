"use client";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";

import UpsertDoctorForm from "./upsert-doctor-form";

export const AddDoctorButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add doctor
        </Button>
      </DialogTrigger>
      <UpsertDoctorForm isOpen={isOpen} onSuccess={() => setIsOpen(false)} />
    </Dialog>
  );
};
