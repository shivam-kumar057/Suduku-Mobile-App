import { Vibration } from 'react-native';

export const vibrateLight = () => Vibration.vibrate(15);

export const vibrateSuccess = () => Vibration.vibrate([0, 50, 30, 80]);
