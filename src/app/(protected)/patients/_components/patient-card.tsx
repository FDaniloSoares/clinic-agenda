"use client";

import { AtSignIcon, PhoneIcon } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { pacientsTable } from "@/db/schema";

import { UpsertPatientForm } from "./upsert-patient-form";

interface PatientCardProps {
  patient: typeof pacientsTable.$inferSelect;
}

const PatientCard = ({ patient }: PatientCardProps) => {
  const [isUpsertPatientFormOpen, setIsUpsertPatientFormOpen] = useState(false);

  const patientInitials = patient.name
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{patientInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{patient.name}</h3>
            <p className="text-muted-foreground text-sm">
              {patient.sex === "male"
                ? "Male"
                : patient.sex === "female"
                  ? "Female"
                  : "Other"}
            </p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2">
        <Badge variant="outline">
          <AtSignIcon className="mr-1 h-4 w-4" />
          {patient.email}
        </Badge>
        <Badge variant="outline">
          <PhoneIcon className="mr-1 h-4 w-4" />
          {patient.phoneNumber}
        </Badge>
      </CardContent>
      <Separator />
      <CardFooter>
        <Dialog
          open={isUpsertPatientFormOpen}
          onOpenChange={setIsUpsertPatientFormOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full">View details</Button>
          </DialogTrigger>
          <DialogContent>
            <UpsertPatientForm
              isOpen={isUpsertPatientFormOpen}
              defaultValues={patient}
              onSuccess={() => setIsUpsertPatientFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default PatientCard;
