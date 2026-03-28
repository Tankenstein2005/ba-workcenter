import dayjs from "dayjs";

export const weekdayOptions = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

export function formatFriendly(date) {
  return dayjs(date).format("ddd, MMM D YYYY h:mm A");
}

export function nextSevenDays() {
  return Array.from({ length: 7 }, (_, index) => dayjs().add(index, "day"));
}
