"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { appointmentsTable } from "@/db/schema";

import { AppointmentsTableActions } from "./appointment-table-actions";

type Appointment = typeof appointmentsTable.$inferSelect & {
  patient: { name: string };
  doctor: { name: string };
};

export const appointmentsTableColumns: ColumnDef<Appointment>[] = [
  {
    id: "patient",
    accessorKey: "patient.name",
    header: "Paciente",
  },
  {
    id: "doctor",
    accessorKey: "doctor.name",
    header: "Médico",
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => {
      const date = row.original.date;
      return format(date, "PPP", { locale: ptBR });
    },
  },
  {
    id: "time",
    accessorKey: "date",
    header: "Horário",
    cell: ({ row }) => {
      const date = row.original.date;
      return format(date, "HH:mm");
    },
  },
  {
    id: "speciality",
    accessorKey: "doctor.speciality",
    header: "Especialidade",
  },
  {
    id: "price",
    accessorKey: "appointmentPriceInCents",
    header: "Valor",
    cell: ({ row }) => {
      const price = row.original.appointmentPriceInCents;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(price / 100);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;
      return <AppointmentsTableActions appointment={appointment} />;
    },
  },
];
