import React from "react";
import { ThemedText } from "@/components/themed-text";
import { useElapsedTime } from "@/src/hooks/useElapsedTime";

interface ElapsedTimeProps {
  date: string | Date;
  style?: any;
}

export function ElapsedTime({ date, style }: ElapsedTimeProps) {
  const elapsedTime = useElapsedTime(date);

  return <ThemedText style={style}>Aguardando há {elapsedTime}</ThemedText>;
}
