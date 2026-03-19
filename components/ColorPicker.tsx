import { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useTheme } from '../utils/useTheme';

type Props = {
  selected: string;
  onSelect: (hex: string) => void;
};

const PRESET_COLORS = [  // future improvement, color wheel or custom hex input
  '#ef4444', // red
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ffffff', // white
  '#9ca3af', // gray
  '#000000', // black
];

const COLS = 5;
const GAP = 10;

export default function ColorPicker({ selected, onSelect }: Props) {
  const { theme } = useTheme();
  const [gridWidth, setGridWidth] = useState(0);

  const swatchSize = useMemo(() => {
    if (!gridWidth) return 0;
    return Math.floor((gridWidth - GAP * (COLS - 1)) / COLS);
  }, [gridWidth]);

  function handleLayout(e: LayoutChangeEvent) {
    setGridWidth(e.nativeEvent.layout.width);
  }

  return (
    <View style={styles.grid} onLayout={handleLayout}>
      {PRESET_COLORS.map((hex) => {
        const isSelected = selected.toLowerCase() === hex.toLowerCase();
        return (
          <TouchableOpacity
            key={hex}
            style={[
              styles.swatch,
              {
                width: swatchSize,
                height: swatchSize,
                backgroundColor: hex,
                borderColor: hex === '#ffffff' ? '#cbd5e1' : theme.border,
              },
              isSelected && { borderColor: theme.primary, borderWidth: 3 },
            ]}
            onPress={() => onSelect(hex)}
            disabled={!swatchSize}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  swatch: {
    borderRadius: 10,
    borderWidth: 1.5,
  },
});