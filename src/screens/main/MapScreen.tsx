import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import MapView, { Marker, Region, PROVIDER_DEFAULT } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { CatchReport, RootStackParamList } from "../../types";
import { getAllReportsForMap } from "../../utils/firestore";
import { useTheme } from "../../hooks/useTheme";
import { formatTimeAgo, formatWeight } from "../../utils/formatting";
import { Avatar } from "../../components/Avatar";

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Default to centre of England
const UK_REGION: Region = {
  latitude: 52.5,
  longitude: -1.5,
  latitudeDelta: 8,
  longitudeDelta: 6,
};

export function MapScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);

  const [reports, setReports] = useState<CatchReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CatchReport | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllReportsForMap();
        setReports(data);
      } catch (err) {
        console.error("Failed to load map reports:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={UK_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            onPress={() => setSelectedReport(report)}
          >
            <View style={styles.markerContainer}>
              <Ionicons name="fish" size={24} color="#1A5276" />
            </View>
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!selectedReport}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReport(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedReport(null)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.xl,
              },
            ]}
          >
            {selectedReport && (
              <>
                <Image
                  source={{ uri: selectedReport.photoUrl }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <View style={styles.modalBody}>
                  <View style={styles.modalHeader}>
                    <Avatar
                      uri={selectedReport.userAvatar}
                      name={selectedReport.userName}
                      size={32}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text
                        style={[styles.modalUserName, { color: theme.colors.text }]}
                      >
                        {selectedReport.userName}
                      </Text>
                      <Text
                        style={[styles.modalTime, { color: theme.colors.textMuted }]}
                      >
                        {formatTimeAgo(selectedReport.createdAt)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.speciesBadge,
                        { backgroundColor: theme.colors.secondary + "20" },
                      ]}
                    >
                      <Text
                        style={[styles.speciesText, { color: theme.colors.secondary }]}
                      >
                        {selectedReport.species}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalDetails}>
                    <View style={styles.detailChip}>
                      <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
                      <Text
                        style={{ color: theme.colors.textSecondary, fontSize: 13 }}
                        numberOfLines={1}
                      >
                        {selectedReport.locationName}
                      </Text>
                    </View>
                    <View style={styles.detailChip}>
                      <Ionicons name="scale-outline" size={14} color={theme.colors.textMuted} />
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                        {formatWeight(selectedReport.weightLb, selectedReport.weightOz)}
                      </Text>
                    </View>
                  </View>

                  {selectedReport.notes ? (
                    <Text
                      style={[styles.modalNotes, { color: theme.colors.text }]}
                      numberOfLines={3}
                    >
                      {selectedReport.notes}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.viewButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => {
                      setSelectedReport(null);
                      navigation.navigate("ReportDetail", {
                        reportId: selectedReport.id,
                      });
                    }}
                  >
                    <Text style={styles.viewButtonText}>View Full Report</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#1A5276",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    overflow: "hidden",
    marginHorizontal: 8,
    marginBottom: Platform.OS === "ios" ? 34 : 16,
  },
  modalImage: {
    width: "100%",
    height: SCREEN_WIDTH * 0.5,
  },
  modalBody: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalUserName: {
    fontWeight: "600",
    fontSize: 15,
  },
  modalTime: {
    fontSize: 12,
  },
  speciesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  speciesText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  modalNotes: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  viewButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
