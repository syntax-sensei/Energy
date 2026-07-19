import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { ChargingStation } from '@/types/charging-station';

type EvMapProps = {
  onBack?: () => void;
  onStationPress?: (station: ChargingStation) => void;
};

/** Web stub — react-native-maps is native-only. */
export function EvMap(_props: EvMapProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Map is available on iOS and Android.</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
});
