import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";

import { BoltIcon } from "@/components/map/bolt-icon";
import type { ChargingStation } from "@/types/charging-station";

type DestinationPinProps = {
  station: ChargingStation;
  onPress?: (station: ChargingStation) => void;
};

/** Solid teardrop pin marking the currently selected/destination charger. */
export function DestinationPin({ station, onPress }: DestinationPinProps) {
  return (
    <Marker
      coordinate={{ latitude: station.latitude, longitude: station.longitude }}
      anchor={{ x: 0.5, y: 1 }}
      onPress={() => onPress?.(station)}
      tracksViewChanges={false}
    >
      <View style={styles.pinBody}>
        <View style={styles.iconCircle}>
          <BoltIcon size={16} color="#ffffff" />
        </View>
      </View>
    </Marker>
  );
}

const PIN_SIZE = 40;

const styles = StyleSheet.create({
  pinBody: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    borderBottomRightRadius: 2,
    backgroundColor: "#1c1c1e",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconCircle: {
    transform: [{ rotate: "-45deg" }],
  },
});
