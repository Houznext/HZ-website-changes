export interface DateInfo {
  date: string;
  dayNo: number;
}

export interface WeekData {
  [weekNumber: number]: DateInfo[];
}

export interface MonthData {
  [month: string]: WeekData;
}

export interface CurrentDayInfo {
  currentMonth: number;
  currentWeek: number;
  today: number;
  totalWeeks: number;
  totalMonths: number;
}

export const getTheLastDate = (startDateStr: string, estimatedDays: string) => {
  const currentDate = new Date(startDateStr);
  return new Date(
    currentDate.setDate(currentDate.getDate() + parseInt(estimatedDays, 10) - 1)
  )
    .toISOString()
    .split("T")[0];
};

export const getDatesBetween = (
  startDateStr: string,
  endDateStr: string
): MonthData => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const result: MonthData = {};

  const currentDate = new Date(startDate);

  let dayNumber = 1;
  let weekNumber = 1;

  while (currentDate <= endDate) {
    const month = currentDate.toLocaleString("default", { month: "numeric" });

    const dayOfTheWeek = currentDate.getDay();

    if (!result[month]) {
      result[month] = {};
    }

    if (!result[month][weekNumber]) {
      result[month][weekNumber] = [];
    }

    result[month][weekNumber].push({
      date: currentDate.toISOString().split("T")[0],
      dayNo: dayNumber,
    });

    currentDate.setDate(currentDate.getDate() + 1);
    dayNumber += 1;
    if (dayOfTheWeek === 6) {
      weekNumber += 1;
    }
  }

  return result;
};

export const findCurentDayInfo = (timeframe: MonthData): CurrentDayInfo => {
  let currentMonth = 0;
  let currentWeek = 0;
  let today = 0;
  let totalWeeks = 0;

  let totalMonths = Object.keys(timeframe)?.length;

  const todayDate = new Date()?.toISOString().split("T")[0];

  Object.values(timeframe)?.map((month: any, monthIndex) => {
    Object.values(month)?.map((week: any, weekIndex) => {
      totalWeeks += 1;
      week?.map((day: any, dayIndex: number) => {
        if (day?.date === todayDate) {
          today = dayIndex + 1;
          currentWeek = weekIndex + 1;
          currentMonth = monthIndex + 1;
        }
      });
    });
  });

  return { currentMonth, currentWeek, today, totalMonths, totalWeeks };
};
