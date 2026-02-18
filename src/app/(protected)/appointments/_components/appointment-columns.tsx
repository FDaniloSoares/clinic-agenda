"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

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
    header: "Patient",
  },
  {
    id: "doctor",
    accessorKey: "doctor.name",
    header: "Doctor",
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.date;
      return format(date, "PPP");
    },
  },
  {
    id: "time",
    accessorKey: "date",
    header: "Time",
    cell: ({ row }) => {
      const date = row.original.date;
      return format(date, "HH:mm");
    },
  },
  {
    id: "speciality",
    accessorKey: "doctor.speciality",
    header: "Specialty",
  },
  {
    id: "price",
    accessorKey: "appointmentPriceInCents",
    header: "Price",
    cell: ({ row }) => {
      const price = row.original.appointmentPriceInCents;
      return new Intl.NumberFormat("en-US", {
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
