export const lightTheme = {
  mode: 'light',
  colors: {
    background: '#F3F6FF',
    surface: '#FFFFFF',
    surfaceAlt: '#ECF2FF',
    surfaceMuted: '#E7EEFF',
    text: '#18233A',
    textMuted: '#66738F',
    primary: '#2D6BFF',
    primarySoft: '#DDE8FF',
    secondary: '#2EC5A7',
    accent: '#FFB84D',
    accentSoft: '#FFF0D8',
    danger: '#EF5B5B',
    success: '#1FB989',
    border: '#D5E0F4',
    highlight: '#E8F0FF',
    highlightStrong: '#D3E2FF',
    givenCell: '#EFF4FF',
    selectedCell: '#D8E5FF',
  },
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    background: '#101827',
    surface: '#182235',
    surfaceAlt: '#1E2B43',
    surfaceMuted: '#24344F',
    text: '#F5F7FD',
    textMuted: '#A6B2CA',
    primary: '#69A1FF',
    primarySoft: '#243D69',
    secondary: '#43D6B7',
    accent: '#FFC969',
    accentSoft: '#45361D',
    danger: '#FF7B7B',
    success: '#56D9A7',
    border: '#33455F',
    highlight: '#243654',
    highlightStrong: '#314A73',
    givenCell: '#1D2A42',
    selectedCell: '#294168',
  },
};

export type AppTheme = typeof lightTheme;
