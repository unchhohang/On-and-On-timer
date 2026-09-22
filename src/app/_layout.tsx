// src/app/_layout.tsx
import { NativeStackNavigationOptions, Stack } from "expo-router";
import GoalSetupScreen from "./Goal";
import MainTimerScreen from "./MainTimer";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { db, expoDb } from "./db";
import { Text } from "react-native";
import migrations from "../../drizzle/migrations";
import { useEffect, useState } from "react";
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import "@/global.css";
import Toast from "react-native-toast-message";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { goal } from "./db/schema";

const options: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',        // or 'slide_from_right', 'slide_from_bottom', 'none'
  animationDuration: 100,
};

export default function RootLayout() {
  useDrizzleStudio(expoDb)
  const { data } = useLiveQuery(db.select().from(goal));

  const [isMigrated, setIsMigrated] = useState(false);
  const [errMigration, setErrMigration] = useState();

  useEffect(() => {
    async function runMigrations() {
      try {
        await migrate(db, migrations);
        setIsMigrated(true);
      } catch (e: any) {
        console.error('Migration failed:', e);
        setErrMigration(e.message || 'Failed to run migrations');
      }
    }

    runMigrations();
  }, []);

  if (!isMigrated) {
    return <Text>Migration error: {errMigration}</Text>;
  }
  // if (isMigrated) {
  //   return <Text>Migrating...</Text>;
  // }

  return (
    <>
      <Stack initialRouteName={data[0] ? 'MainTimer' : 'Goal'}>
        <Stack.Screen name="Goal" options={options} />
        <Stack.Screen name="MainTimer" options={options} />
      </Stack>
      <Toast />
    </>
  );
}

