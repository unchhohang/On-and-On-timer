import { useEffect, useMemo, useRef, useState } from "react";
import { Text, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import TimerRing from "@components/Timerring";
import WeeklyBarChart, { type DayEntry } from "@components/Weeklybarchart";
import { formatDuration } from "./lib/calculator";
import PencilIcon from "./components/PencilSvg";
import { createDailyLogs } from "./services/timer.service";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "./db";
import { dailyLogs } from "./db/schema";
import { goal } from "./db/schema";
import { eq } from "drizzle-orm";
import { format, secondsToHours, millisecondsToSeconds } from "date-fns";
import { useAudioPlayer } from 'expo-audio';
import { FontAwesome5 } from '@expo/vector-icons';
import { getWeekRange } from "@/src/app/lib/datetime";
import { getDailyLogByDate, getEachDayTimeSpent } from "@/src/app/services/dailylogs.service";
import { useQuery } from "@tanstack/react-query";

// Placeholder week data — swap for real per-day totals once storage is wired up.
const WEEK_DATA_DUMMY: DayEntry[] = [
  { label: "Sun", value: 2.4 * 3600, highlighted: true },
  { label: "Mon", value: 3 * 3600 },
  { label: "Tue", value: 6.2 * 3600 },
  { label: "Wed", value: 7.1 * 3600, highlighted: true },
  { label: "Thu", value: 2.6 * 3600 },
  { label: "Fri", value: 5.3 * 3600 },
  { label: "Sat", value: 4.0 * 3600 },
];

type timesSpent = {
  [x: string]: number;
}[]

const makeDayEntry = (timesSpent: timesSpent, targetDuration: number) => {
  return timesSpent.map((d) => {
    const [key, value] = Object.entries(d)[0];
    return {
      label: key,
      value: value,
      Highlight: value >= targetDuration * 1000
    }
  }
  )
}


export default function MainTimerScreen() {
  const router = useRouter();

  const { data: dataGoal } = useLiveQuery(
    db.select()
      .from(goal)
  );
  const { data: daysData } = useLiveQuery(
    db.select()
      .from(dailyLogs)
  );

  const { data: weekData, isLoading: isLoadingWeekData } = useQuery({
    queryKey: ["weekData"],
    queryFn: getEachDayTimeSpent,
  });

  const todayDateStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const { data: todayDataList } = useLiveQuery(
    db.select()
      .from(dailyLogs)
      .where(
        eq(dailyLogs.date, todayDateStr)
      )
  );

  const todayData = todayDataList[0];
  const Goal = dataGoal[0];
  const TARGET_SECONDS = Goal?.dailyTargetSeconds ?? 0;
  const todaySpendTime = todayData?.milliSeconds ?? 0;      // in MilliSeconds
  const startTime = useRef<number>(0);
  const player = useAudioPlayer(require('@assets/i-am-batman-x3.mp3'));
  const alarmFiredRef = useRef(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);      // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [crown, setCrown] = useState(false);
  const [weekChart, setWeekChart] = useState(WEEK_DATA_DUMMY);

  console.log('week chart');
  console.log(weekData);
  
  


  useEffect(() => {
    const data = makeDayEntry(weekData ?? [], millisecondsToSeconds(TARGET_SECONDS));
    setWeekChart(data);
  }, [isLoadingWeekData]);



  // set crown true in case today goal reached
  useEffect(() => {

    console.log('todaySpendTime: ', millisecondsToSeconds(todaySpendTime), 'Target Sec: ', TARGET_SECONDS);
    if (!Goal || !todayData) return;
    if (millisecondsToSeconds(todaySpendTime) >= TARGET_SECONDS) setCrown(true);
  }, [todaySpendTime, TARGET_SECONDS, Goal, todayData]);

  // setting elapsedSeconds
  useEffect(() => {
    setElapsedSeconds(millisecondsToSeconds(todaySpendTime));
  }, [todaySpendTime]);


  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const et = todaySpendTime + Date.now() - startTime.current;
        setElapsedSeconds(millisecondsToSeconds(et));

        console.log('et' + et + ',' + 'TARGET_SECONDS' + TARGET_SECONDS * 1000);
        console.log(et == TARGET_SECONDS * 1000);


        // play timer when targetMillSecond == elapsedMiliSec
        if (et >= TARGET_SECONDS * 1000 && !alarmFiredRef.current) {
          alarmFiredRef.current = true;
          playAlarm();
          setCrown(true)
          toggleRunning();
        }

      },
        1000
      );
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const toggleRunning = async () => {
    setIsRunning((current) => !current);
    if (isRunning == false) {
      // in case of isRunning making true
      startTime.current = Date.now();
    } else if (isRunning == true) {
      // in case of stopping 
      // save spend milli seconds to const {second}  
      const saved = await createDailyLogs(
        format(new Date(), 'yyyy-MM-dd'),
        todaySpendTime + Date.now() - startTime.current
      )

      console.log('saved:');
      console.log(saved);


      // startTime.current to 0
      startTime.current = 0;
    }
  };


  const playAlarm = () => {
    console.log('alarm should play');

    player.seekTo(0)
    player.play();

    player.seekTo(0)
    player.play();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#14151a] px-6" edges={["top", "bottom"]}>
      <View className="items-center mt-4 mb-6">
        <Text className="text-[13px] text-[#8a8d99]">Today's goal</Text>
        <View className="flex-row items-center gap-2 mt-1">
          <Text className="text-[18px] font-semibold text-[#f2c744]">
            {Goal?.activityName} · {secondsToHours(Goal?.dailyTargetSeconds)}h target
          </Text>
          <Pressable
            onPress={() => router.replace("Goal")}
            hitSlop={10}
            className="h-7 w-7 rounded-full border border-[#3a3d47] items-center justify-center"
          >
            <PencilIcon />
          </Pressable>
        </View>
      </View>

      <View className="items-center mb-6">
        <TimerRing
          progress={elapsedSeconds / TARGET_SECONDS}
          elapsedLabel={formatDuration(elapsedSeconds)}
          targetLabel={`of ${formatDuration(TARGET_SECONDS)}`}
        />
      </View>

      <View className="flex-row justify-center gap-3 mb-8">
        {
          crown ?
            <View>
              <FontAwesome5 name="crown" size={48} color="#FFD700" />
            </View>
            :
            <Pressable
              onPress={toggleRunning}
              className="h-14 px-8 rounded-xl bg-[#f2c744] items-center justify-center"
            >
              <Text className="text-[16px] font-semibold text-[#14151a]">
                {isRunning ? "Pause" : "Start"}
              </Text>
            </Pressable>
        }


      </View>

      <View className="border-t border-[#2a2c33] pt-4">
        <Text className="text-[13px] text-[#8a8d99] mb-3">Last 7 days</Text>
        <WeeklyBarChart data={weekChart} />
      </View>
    </SafeAreaView>
  );
}
