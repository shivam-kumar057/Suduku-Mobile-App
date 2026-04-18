import { useColorScheme } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { darkTheme, lightTheme } from '../utils/theme';

export const useAppTheme = () => {
  const themeMode = useGameStore(state => state.settings.themeMode);
  const systemScheme = useColorScheme();

  if (themeMode === 'light') {
    return lightTheme;
  }

  if (themeMode === 'dark') {
    return darkTheme;
  }

  return systemScheme === 'dark' ? darkTheme : lightTheme;
};
