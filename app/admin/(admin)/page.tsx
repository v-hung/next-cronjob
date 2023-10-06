import DashboardContentAdmin from "@/components/admin/content/DashboardContentAdmin";
import db from "@/lib/admin/prismadb";
import { AdminHistory, File, Prisma } from "@prisma/client";
import moment from "moment";

export type AdminHistoryState = (AdminHistory & {
  admin: {
    id: string;
    email: string;
    name: string;
    image: File | null
  }
})

const getAdminHistory = async (page: number = 1, per_page: number = 10) => {
  "use server"
  if (page < 1) page = 1

  const start = (page - 1) * per_page

  try {
    const [data, count] = await db.$transaction([
      db.adminHistory.findMany({
        take: per_page,
        skip: start,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          action: true,
          data: true,
          status: true,
          tableName: true,
          createdAt: true,
          updatedAt: true,
          adminId: true,
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      }),
      db.adminHistory.count(),
    ])

    return {data, count}
  } catch (error) {
    console.log({error})
    throw (typeof error === "string") ? error : 'Không thể lấy lịch sử hoạt động quản trị viên'
  }
}

const getAccessHistory = async (currentDate: Date = new Date()) => {
  "use server"
  try {
    const threeMonthsAgo = moment(currentDate).subtract(3, 'months').toDate()

    const data = await db.accessHistory.findMany({
      where: {
        accessTime: {
          lte: currentDate,
          gte: threeMonthsAgo
        }
      }
    })

    const accessByDateMap = new Map<string, number>();

    data.forEach(accessLog => {
      const dateKey = accessLog.accessTime.toISOString().split('T')[0]
      if (accessByDateMap.has(dateKey)) {
        accessByDateMap.set(dateKey, accessByDateMap.get(dateKey)! + 1)
      } else {
        accessByDateMap.set(dateKey, 1); // Initialize access count
      }
    });

    const accessByDateArray = Array.from(accessByDateMap, ([date, count]) => ({ date, count }));

    return {data : accessByDateArray}
  } catch (error) {
    console.log({error})
    throw (typeof error === "string") ? error : 'không thể lấy dữ liệu truy cập'
  }
}

const getAccessDevice = async () => {
  "use server"
  try {
    const counts: {
      mobile: bigint
      tablet: bigint,
      pc: bigint
    }[] = await db.$queryRaw(
      Prisma.sql`
        SELECT
          (SELECT COUNT(*) FROM "AccessHistory" WHERE "device" = 'Mobile') as mobile,
          (SELECT COUNT(*) FROM "AccessHistory" WHERE "device" = 'Tablet') as tablet,
          (SELECT COUNT(*) FROM "AccessHistory" WHERE "device" = 'PC') as pc
      `
    );

    // mysql select
    // `SELECT
    //   (SELECT COUNT(*) FROM \`AccessHistory\` WHERE \`device\` = 'Mobile') as mobile,
    //   (SELECT COUNT(*) FROM \`AccessHistory\` WHERE \`device\` = 'Tablet') as tablet,
    //   (SELECT COUNT(*) FROM \`AccessHistory\` WHERE \`device\` = 'PC') as pc`

    return {counts: counts[0]}
  } catch (error) {
    console.log({error})
    throw (typeof error === "string") ? error : 'Không thể lấy danh sách thiết bị truy cập'
  }
}

export default function Page() {
  return (
    <DashboardContentAdmin getAdminHistory={getAdminHistory} getAccessHistory={getAccessHistory} getAccessDevice={getAccessDevice} />
  );
}
