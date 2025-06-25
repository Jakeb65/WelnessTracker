// app/theme.tsx
import { MD3LightTheme, MD3Theme } from 'react-native-paper';

// Definiujemy własne typy dla naszego theme'u
interface CustomTheme extends MD3Theme {
    colors: MD3Theme['colors'] & {
        // Tutaj możesz dodać własne kolory jeśli będziesz potrzebować
        customColor?: string;
    };
}

export const theme: CustomTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#4CAF50',
        secondary: '#000',
        background: '#fff',
    },
};

// Eksportujemy typ dla używania w komponentach
export type AppTheme = typeof theme;