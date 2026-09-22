import { useEffect, useRef, useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  View,
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { createGoal } from "./services/goal.service";
import Toast from "react-native-toast-message";
import { db } from "./db";
import { goal } from "./db/schema";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { formatDuration, fromSecToHrs } from "./lib/calculator";
import { useRoute, useRouter } from "expo-router";


const MIN_HOURS = 1;
const MAX_HOURS = 16;
const TRACK_WIDTH = 252;

function clampHours(value: number) {
  return Math.min(MAX_HOURS, Math.max(MIN_HOURS, value));
}

function TargetIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30">
      <Circle cx={15} cy={15} r={13} stroke="#f2c744" strokeWidth={2} fill="none" />
      <Circle cx={15} cy={15} r={7} stroke="#f2c744" strokeWidth={2} fill="none" />
      <Circle cx={15} cy={15} r={2.5} fill="#f2c744" />
    </Svg>
  );
}

export default function GoalSetupScreen() {
  const { data } = useLiveQuery(db.select().from(goal));
  const goalData = data?.[0];

  console.log('goal data: ');
  console.log(data);
  
  

  return <GoalForm key={goalData?.id ?? "new"} goalData={goalData} />;
}


const GoalForm = (
  { goalData }: { goalData?: { activityName: string; dailyTargetSeconds: number } }
) => {
  const inHrs = fromSecToHrs(goalData?.dailyTargetSeconds ?? 0)

  const [activityName, setActivityName] = useState(goalData?.activityName ?? "");
  const [hours, setHours] = useState(inHrs);
  const [saved, setSaved] = useState(false);

  const router = useRouter();

  const dragStartHours = useRef(hours);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartHours.current = hours;
      },
      onPanResponderMove: (
        _event: GestureResponderEvent,
        gesture: PanResponderGestureState
      ) => {
        const hoursPerPixel = (MAX_HOURS - MIN_HOURS) / TRACK_WIDTH;
        const delta = Math.round(gesture.dx * hoursPerPixel);
        setHours(clampHours(dragStartHours.current + delta));
      },
    })
  ).current;

  const decrementHours = () => setHours((current) => clampHours(current - 1));
  const incrementHours = () => setHours((current) => clampHours(current + 1));

  const handleSave = async () => {
    const trimmedName = activityName.trim();
    const numericHours = Number(hours);

    console.log(trimmedName, numericHours);


    if (!trimmedName) {
      Toast.show({ type: "error", text1: "Enter an activity name" });
      return;
    }

    if (!hours || isNaN(numericHours) || numericHours <= 0) {
      Toast.show({ type: "error", text1: "Enter valid hours" });
      return;
    }

    await createGoal(trimmedName, numericHours * 3600);
    router.navigate('/MainTimer');
    setSaved(true);
  };

  const handleNameChange = (value: string) => {
    setActivityName(value);
    setSaved(false);
  };

  const sliderFillWidth =
    ((hours - MIN_HOURS) / (MAX_HOURS - MIN_HOURS)) * TRACK_WIDTH;

  return (
    <SafeAreaView className="flex-1 bg-[#14151a] px-6" edges={["top", "bottom"]}>
      <View className="items-center mt-6 mb-8">
        <TargetIcon />
        <Text className="text-[18px] font-semibold text-[#f5f5f0] mt-2">
          Set your focus goal
        </Text>
        <Text className="text-[13px] text-[#8a8d99] mt-1">
          One activity, tracked every day.
        </Text>
      </View>

      <Text className="text-[13px] text-[#8a8d99] mb-2">Activity name</Text>
      <TextInput
        value={activityName}
        onChangeText={handleNameChange}
        placeholder="e.g. Code, Write, Study"
        placeholderTextColor="#6b6e79"
        className="h-[52px] rounded-lg border border-[#3a3d47] bg-[#1c1e24] px-4 text-[16px] text-[#f5f5f0] mb-6"
      />

      <Text className="text-[13px] text-[#8a8d99] mb-2.5">Daily target</Text>
      <View className="rounded-lg border border-[#3a3d47] bg-[#1c1e24] py-4 items-center">
        <View className="flex-row items-center justify-center gap-5">
          <Pressable
            onPress={decrementHours}
            className="h-12 w-12 rounded-full border border-[#3a3d47] items-center justify-center"
          >
            <Text className="text-[22px] text-[#f5f5f0]">−</Text>
          </Pressable>

          <View className="items-center min-w-[70px]">
            <Text className="text-[32px] font-semibold text-[#f2c744]">
              {hours}
            </Text>
            <Text className="text-[12px] text-[#8a8d99] mt-0.5">
              hours / day
            </Text>
          </View>

          <Pressable
            onPress={incrementHours}
            className="h-12 w-12 rounded-full border border-[#3a3d47] items-center justify-center"
          >
            <Text className="text-[22px] text-[#f5f5f0]">+</Text>
          </Pressable>
        </View>

        <View
          className="h-4 justify-center mt-4"
          style={{ width: TRACK_WIDTH }}
          {...panResponder.panHandlers}
        >
          <View className="h-1 rounded-full bg-[#3a3d47]" />
          <View
            className="h-1 rounded-full bg-[#f2c744] absolute left-0"
            style={{ width: sliderFillWidth }}
          />
          <View
            className="h-[22px] w-[22px] rounded-full bg-[#f2c744] absolute"
            style={{ left: sliderFillWidth - 11 }}
          />
        </View>
      </View>

      <Pressable
        onPress={handleSave}
        className="h-14 rounded-lg bg-[#f2c744] items-center justify-center mt-6"
      >
        <Text className="text-[17px] font-semibold text-[#14151a]">
          Save goal
        </Text>
      </Pressable>

      {saved && (
        <Text className="text-center text-[12px] text-[#6b6e79] mt-2.5">
          Goal saved — {activityName.trim()}, {hours}h/day
        </Text>
      )}
    </SafeAreaView>
  );
}
