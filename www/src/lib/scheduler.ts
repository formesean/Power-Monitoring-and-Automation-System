import axios from "axios";
import cron from "node-cron";

type Schedule = {
  time: string;
  command: string;
  job: cron.ScheduledTask;
};

const schedules: Schedule[] = [];

export const addSchedule = ({time, command}: {time: string; command: string}) {
  console.log(`Scheduled: "${command}" at "${time}"`);

  const job = cron.schedule(time, async () => {
    try {
      console.log(`Sending TalkBack command: ${command}`);

      await axios.post(
        `https://api.thingspeak.com/talkbacks/${process.env.TALKBACK_ID}/commands`,
        {
          api_key: process.env.TALKBACK_API_KEY,
          command_string: command,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
    } catch (error: any) {
      console.error("Failed to send command:", error.message);
    }
  })

  schedules.push({time, command, job});
};
