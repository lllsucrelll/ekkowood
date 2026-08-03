import "server-only";
import { prisma } from "@/lib/prisma";

const DAILY_VISITS_WINDOW_DAYS = 30;

export type DailyPoint = { date: string; visits: number };
export type ButtonClickStat = { buttonLabel: string; count: number };

export type MerchantStats = {
  totalVisits: number;
  totalClicks: number;
  dailyVisits: DailyPoint[];
  clicksByButton: ButtonClickStat[];
};

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getMerchantStats(
  merchantId: string
): Promise<MerchantStats> {
  const since = new Date();
  since.setDate(since.getDate() - (DAILY_VISITS_WINDOW_DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const [totalVisits, totalClicks, recentVisits, clickGroups] =
    await Promise.all([
      prisma.visit.count({ where: { merchantId } }),
      prisma.buttonClick.count({ where: { merchantId } }),
      prisma.visit.findMany({
        where: { merchantId, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.buttonClick.groupBy({
        by: ["buttonLabel"],
        where: { merchantId },
        _count: { _all: true },
      }),
    ]);

  const countByDay = new Map<string, number>();
  for (const visit of recentVisits) {
    const key = toDateKey(visit.createdAt);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  const dailyVisits: DailyPoint[] = [];
  for (let i = 0; i < DAILY_VISITS_WINDOW_DAYS; i++) {
    const day = new Date(since);
    day.setDate(day.getDate() + i);
    const key = toDateKey(day);
    dailyVisits.push({ date: key, visits: countByDay.get(key) ?? 0 });
  }

  const clicksByButton: ButtonClickStat[] = clickGroups
    .map((group) => ({
      buttonLabel: group.buttonLabel,
      count: group._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  return { totalVisits, totalClicks, dailyVisits, clicksByButton };
}
