import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const goal = v.union(v.literal("basic"), v.literal("half"), v.literal("full"));
const skill = v.union(v.literal("new"), v.literal("building"), v.literal("confident"));
const skills = v.object({
  swim: skill,
  bike: skill,
  run: skill,
});

async function authenticatedSubject(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("You must be signed in to access your training profile.");
  return identity.subject;
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const subject = await authenticatedSubject(ctx);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_subject", (q) => q.eq("subject", subject))
      .unique();
    if (!profile) return null;
    return {
      goal: profile.goal,
      skills: profile.skills,
      equipment: profile.equipment,
      customEquipment: profile.customEquipment,
      updatedAt: profile.updatedAt,
    };
  },
});

export const save = mutation({
  args: {
    goal,
    skills,
    equipment: v.array(v.string()),
    customEquipment: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const subject = await authenticatedSubject(ctx);
    if (args.equipment.length > 80 || args.customEquipment.length > 40) {
      throw new Error("Your equipment list is too large.");
    }

    const customEquipment = args.customEquipment.map((item) => item.trim());
    if (customEquipment.some((item) => item.length === 0 || item.length > 60)) {
      throw new Error("Equipment names must contain 1 to 60 characters.");
    }

    const deduplicate = (items: string[]) =>
      [...new Map(items.map((item) => [item.toLocaleLowerCase(), item])).values()];
    const equipment = deduplicate(args.equipment.map((item) => item.trim()).filter(Boolean));
    const uniqueCustomEquipment = deduplicate(customEquipment);
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_subject", (q) => q.eq("subject", subject))
      .unique();
    const updatedAt = Date.now();
    const profile = {
      goal: args.goal,
      skills: args.skills,
      equipment,
      customEquipment: uniqueCustomEquipment,
      updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, profile);
      return existing._id;
    }
    return await ctx.db.insert("profiles", { subject, ...profile });
  },
});
