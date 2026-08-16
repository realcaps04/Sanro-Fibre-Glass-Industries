import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("expire pending bill deliveries", { minutes: 10 }, internal.billDelivery.expireOld);

export default crons;
