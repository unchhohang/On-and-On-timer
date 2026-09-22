import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

type TimerRingProps = {
  /** 0 to 1 — how much of the ring should be filled */
  progress: number;
  /** Big centered label, e.g. "02:15:40" */
  elapsedLabel: string;
  /** Small label under the big one, e.g. "of 08:00:00" */
  targetLabel: string;
  /** Outer diameter of the ring in dp. Defaults to a size that reads
   *  well on most phone widths (roughly 58% of a ~390dp screen). */
  size?: number;
  strokeWidth?: number;
};

export default function TimerRing({
  progress,
  elapsedLabel,
  targetLabel,
  size = 228,
  strokeWidth = 14,
}: TimerRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const dashOffset = circumference * (1 - clampedProgress);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#2a2c33"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#f2c744"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          fill="none"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>

      <View className="absolute items-center">
        <Text className="text-[30px] font-semibold text-[#f5f5f0]">
          {elapsedLabel}
        </Text>
        <Text className="text-[13px] text-[#8a8d99] mt-1">{targetLabel}</Text>
      </View>
    </View>
  );
}
