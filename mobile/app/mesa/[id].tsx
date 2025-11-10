import React from "react";
import { useLocalSearchParams } from "expo-router";
import TableDetailsScreen from "@/src/screens/TableDetailsScreen";

export default function MesaDetails() {
  const { id, numero } = useLocalSearchParams();

  if (!id || !numero) {
    throw new Error("Mesa ID e número são obrigatórios");
  }

  return (
    <TableDetailsScreen mesaId={id as string} mesaNumero={Number(numero)} />
  );
}
