import "dotenv/config";

import dayjs from "dayjs";

import { db } from "../db";
import {
  appointmentsTable,
  doctorsTable,
  pacientsTable,
} from "../db/schema";

// ─── Helpers ────────────────────────────────────────────────────────────────

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ─── Seed data ───────────────────────────────────────────────────────────────

const DOCTORS = [
  {
    name: "Dr. André Lopes",
    speciality: "Cardiology",
    appointmentPriceInCents: 35000,
    availableFromWeekday: 1,
    availableToWeekday: 5,
    availableFromTime: "08:00:00",
    availableToTime: "18:00:00",
  },
  {
    name: "Dra. Fernanda Castro",
    speciality: "Dermatology",
    appointmentPriceInCents: 28000,
    availableFromWeekday: 1,
    availableToWeekday: 5,
    availableFromTime: "09:00:00",
    availableToTime: "17:00:00",
  },
  {
    name: "Dr. Marcos Oliveira",
    speciality: "Orthopedics",
    appointmentPriceInCents: 42000,
    availableFromWeekday: 2,
    availableToWeekday: 6,
    availableFromTime: "08:00:00",
    availableToTime: "16:00:00",
  },
  {
    name: "Dra. Juliana Mendes",
    speciality: "Pediatrics",
    appointmentPriceInCents: 22000,
    availableFromWeekday: 1,
    availableToWeekday: 5,
    availableFromTime: "07:00:00",
    availableToTime: "15:00:00",
  },
  {
    name: "Dr. Rafael Torres",
    speciality: "General Practice",
    appointmentPriceInCents: 18000,
    availableFromWeekday: 1,
    availableToWeekday: 6,
    availableFromTime: "08:00:00",
    availableToTime: "20:00:00",
  },
];

const PATIENTS: {
  name: string;
  email: string;
  phoneNumber: string;
  sex: "male" | "female" | "other";
}[] = [
  { name: "Lucas Almeida", email: "lucas.almeida@seed.dev", phoneNumber: "11987650001", sex: "male" },
  { name: "Mariana Souza", email: "mariana.souza@seed.dev", phoneNumber: "11987650002", sex: "female" },
  { name: "Pedro Costa", email: "pedro.costa@seed.dev", phoneNumber: "11987650003", sex: "male" },
  { name: "Ana Lima", email: "ana.lima@seed.dev", phoneNumber: "11987650004", sex: "female" },
  { name: "Bruno Ferreira", email: "bruno.ferreira@seed.dev", phoneNumber: "11987650005", sex: "male" },
  { name: "Camila Rocha", email: "camila.rocha@seed.dev", phoneNumber: "11987650006", sex: "female" },
  { name: "Diego Martins", email: "diego.martins@seed.dev", phoneNumber: "11987650007", sex: "male" },
  { name: "Elisa Barbosa", email: "elisa.barbosa@seed.dev", phoneNumber: "11987650008", sex: "female" },
  { name: "Felipe Nunes", email: "felipe.nunes@seed.dev", phoneNumber: "11987650009", sex: "male" },
  { name: "Gabriela Pinto", email: "gabriela.pinto@seed.dev", phoneNumber: "11987650010", sex: "female" },
  { name: "Henrique Gomes", email: "henrique.gomes@seed.dev", phoneNumber: "11987650011", sex: "male" },
  { name: "Isabela Correia", email: "isabela.correia@seed.dev", phoneNumber: "11987650012", sex: "female" },
  { name: "João Carvalho", email: "joao.carvalho@seed.dev", phoneNumber: "11987650013", sex: "male" },
  { name: "Karen Ribeiro", email: "karen.ribeiro@seed.dev", phoneNumber: "11987650014", sex: "female" },
  { name: "Leonardo Dias", email: "leonardo.dias@seed.dev", phoneNumber: "11987650015", sex: "male" },
  { name: "Mônica Teixeira", email: "monica.teixeira@seed.dev", phoneNumber: "11987650016", sex: "female" },
  { name: "Nathan Vieira", email: "nathan.vieira@seed.dev", phoneNumber: "11987650017", sex: "male" },
  { name: "Olivia Cardoso", email: "olivia.cardoso@seed.dev", phoneNumber: "11987650018", sex: "female" },
  { name: "Paulo Ramos", email: "paulo.ramos@seed.dev", phoneNumber: "11987650019", sex: "male" },
  { name: "Renata Freitas", email: "renata.freitas@seed.dev", phoneNumber: "11987650020", sex: "female" },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed...\n");

  // 1. Find the first clinic in the database
  const userToClinic = await db.query.UserToClinicTable.findFirst({
    with: { clinic: true },
  });

  if (!userToClinic) {
    console.error(
      "❌ No clinic found. Please sign up and create a clinic first, then run this seed.",
    );
    process.exit(1);
  }

  const clinicId = userToClinic.clinicId;
  console.log(`✅ Using clinic: "${userToClinic.clinic.name}" (${clinicId})\n`);

  // 2. Insert doctors (skip if already seeded)
  console.log("👨‍⚕️  Inserting doctors...");
  const insertedDoctors = await db
    .insert(doctorsTable)
    .values(DOCTORS.map((d) => ({ ...d, clinicId })))
    .onConflictDoNothing()
    .returning();

  console.log(`   ${insertedDoctors.length} doctors inserted.\n`);

  // Fetch all doctors for this clinic (including previously seeded ones)
  const allDoctors = await db.query.doctorsTable.findMany({
    where: (t, { eq }) => eq(t.clinicId, clinicId),
  });

  // 3. Insert patients (skip duplicates by email)
  console.log("🧑‍🤝‍🧑 Inserting patients...");
  const insertedPatients = await db
    .insert(pacientsTable)
    .values(PATIENTS.map((p) => ({ ...p, clinicId })))
    .onConflictDoNothing()
    .returning();

  console.log(`   ${insertedPatients.length} patients inserted.\n`);

  const allPatients = await db.query.pacientsTable.findMany({
    where: (t, { eq }) => eq(t.clinicId, clinicId),
  });

  if (allDoctors.length === 0 || allPatients.length === 0) {
    console.error("❌ No doctors or patients available to create appointments.");
    process.exit(1);
  }

  // 4. Generate appointments spread across the last 14 days + today + next 3 days
  console.log("📅 Generating appointments...");

  const APPOINTMENT_HOURS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  ];

  const today = dayjs();
  const appointments = [];

  // Past 14 days + today: 2-6 appointments per day
  for (let offset = -14; offset <= 0; offset++) {
    const day = today.add(offset, "day");
    const count = randomBetween(2, 6);

    const usedSlots = new Set<string>();

    for (let i = 0; i < count; i++) {
      const doctor = pickRandom(allDoctors);
      let hour = pickRandom(APPOINTMENT_HOURS);
      // Avoid duplicate doctor+hour slots on the same day
      let attempts = 0;
      while (usedSlots.has(`${doctor.id}-${hour}`) && attempts < 20) {
        hour = pickRandom(APPOINTMENT_HOURS);
        attempts++;
      }
      usedSlots.add(`${doctor.id}-${hour}`);

      const [h, m] = hour.split(":").map(Number);
      const date = day.hour(h).minute(m).second(0).millisecond(0).toDate();

      appointments.push({
        clinicId,
        doctorId: doctor.id,
        patientId: pickRandom(allPatients).id,
        date,
        appointmentPriceInCents: doctor.appointmentPriceInCents,
      });
    }
  }

  // Next 3 days: 1-3 appointments per day (future bookings)
  for (let offset = 1; offset <= 3; offset++) {
    const day = today.add(offset, "day");
    const count = randomBetween(1, 3);

    for (let i = 0; i < count; i++) {
      const doctor = pickRandom(allDoctors);
      const hour = pickRandom(APPOINTMENT_HOURS);
      const [h, m] = hour.split(":").map(Number);
      const date = day.hour(h).minute(m).second(0).millisecond(0).toDate();

      appointments.push({
        clinicId,
        doctorId: doctor.id,
        patientId: pickRandom(allPatients).id,
        date,
        appointmentPriceInCents: doctor.appointmentPriceInCents,
      });
    }
  }

  const insertedAppointments = await db
    .insert(appointmentsTable)
    .values(appointments)
    .returning();

  console.log(`   ${insertedAppointments.length} appointments inserted.\n`);

  const totalRevenueCents = insertedAppointments.reduce(
    (acc, a) => acc + a.appointmentPriceInCents,
    0,
  );
  const totalRevenueFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalRevenueCents / 100);

  console.log("─".repeat(40));
  console.log("✅ Seed complete!");
  console.log(`   Doctors   : ${allDoctors.length}`);
  console.log(`   Patients  : ${allPatients.length}`);
  console.log(`   Appoint.  : ${insertedAppointments.length}`);
  console.log(`   Revenue   : ${totalRevenueFormatted}`);
  console.log("─".repeat(40));

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
