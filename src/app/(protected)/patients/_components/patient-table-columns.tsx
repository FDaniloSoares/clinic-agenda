"use client";

import { ColumnDef } from "@tanstack/react-table";

import { pacientsTable } from "@/db/schema";

import { PatientsTableActions } from "./patient-table-actions";

type Patient = typeof pacientsTable.$inferSelect;

export const patiensTableColumns: ColumnDef<Patient>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.original.phoneNumber;
      const formatted = phone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      return formatted;
    },
  },
  {
    id: "sex",
    accessorKey: "sex",
    header: "Sex",
    cell: ({ row }) => {
      const patient = row.original;
      return patient.sex === "male" ? "Male" : "Female";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;

      return <PatientsTableActions patient={patient} />;
    },
  },
];
