import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const goal = v.union(v.literal("basic"), v.literal("half"), v.literal("full"));
const skill = v.union(v.literal("new"), v.literal("building"), v.literal("confident"));

export default defineSchema({
  profiles: defineTable({
    subject: v.string(),
    goal,
    skills: v.object({
      swim: skill,
      bike: skill,
      run: skill,
    }),
    equipment: v.array(v.string()),
    customEquipment: v.array(v.string()),
    updatedAt: v.number(),
  }).index("by_subject", ["subject"]),
});
