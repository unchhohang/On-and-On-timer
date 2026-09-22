import { View, Text } from "react-native";

export type DayEntry = {
  label: string;
  /** Seconds (or any consistent unit) spent that day */
  value: number;
  highlighted?: boolean;
};

type WeeklyBarChartProps = {
  data: DayEntry[];
  /** Height in dp of the tallest possible bar */
  maxBarHeight?: number;
};

export default function WeeklyBarChart({
  data,
  maxBarHeight = 90,
}: WeeklyBarChartProps) {
  const maxValue = Math.max(...data.map((day) => day.value), 1);

  return (
    <View className="flex-row items-end" style={{ height: maxBarHeight + 24 }}>
      {data.map((day) => {
        const barHeight = Math.max(
          6,
          (day.value / maxValue) * maxBarHeight
        );

        return (
          <View key={day.label} className="flex-1 items-center gap-1">
            <View
              className={`w-full rounded-t ${
                day.highlighted ? "bg-[#f2c744]" : "bg-[#3a3d47]"
              }`}
              style={{ height: barHeight, marginHorizontal: 4 }}
            />
            <Text className="text-[10px] text-[#6b6e79]">{day.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
