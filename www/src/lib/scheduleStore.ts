type Schedule = {
  id: string;
  outlet: string;
  action: string;
  time: string;
  days: string;
  cron: string;
};

const scheduleStore: Schedule[] = [];

export const addSchedule = (schedule: Schedule) => {
  scheduleStore.push(schedule);
};

export const getSchedules = () => scheduleStore;

export const deleteSchedule = (id: string) => {
  const index = scheduleStore.findIndex((s) => s.id === id);
  if (index !== -1) scheduleStore.splice(index, 1);
};
