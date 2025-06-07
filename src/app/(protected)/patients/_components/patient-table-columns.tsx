"use client";

import { ColumnDef } from "@tanstack/react-table";

import { pacientsTable } from "@/db/schema";

import { PatientsTableActions } from "./patient-table-actions";

type Patient = typeof pacientsTable.$inferSelect;

export const patiensTableColumns: ColumnDef<Patient>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.original.phoneNumber;
      const formatted = phone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      return formatted;
    },
  },
  {
    id: "sex",
    accessorKey: "sex",
    header: "Sexo",
    cell: ({ row }) => {
      const patient = row.original;
      return patient.sex === "male" ? "Masculino" : "Feminino";
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
