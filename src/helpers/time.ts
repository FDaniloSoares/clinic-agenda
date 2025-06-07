export const generateTimeSlots = () => {
  const timeSlots = [];

  for (let hour = 5; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
      timeSlots.push(timeString);
    }
  }

  return timeSlots;
};
