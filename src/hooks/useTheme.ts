import { useColorScheme } from "react-native";
import { getTheme, Theme } from "../theme";

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  return getTheme(colorScheme);
}
