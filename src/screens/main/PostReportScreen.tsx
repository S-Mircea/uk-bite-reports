import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import { UK_FISH_SPECIES } from "../../types";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { getUserProfile, createReport, uploadImage } from "../../utils/database";
import { Button } from "../../components/Button";

export function PostReportScreen() {
  const theme = useTheme();
  const { user } = useAuth();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [species, setSpecies] = useState("");
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
  const [weightLb, setWeightLb] = useState("");
  const [weightOz, setWeightOz] = useState("");
  const [lengthInches, setLengthInches] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  async function getCurrentLocation() {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location Permission", "Please enable location to auto-fill your fishing spot.");
        setGettingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (address) {
        const parts = [address.name, address.city, address.region].filter(Boolean);
        setLocationName(parts.join(", "));
      }
    } catch (err) {
      console.error("Location error:", err);
    } finally {
      setGettingLocation(false);
    }
  }

  async function pickImage(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", `Please grant ${fromCamera ? "camera" : "gallery"} access.`);
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.7,
          allowsEditing: true,
          aspect: [4, 3],
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.7,
          allowsEditing: true,
          aspect: [4, 3],
        });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  function showImageOptions() {
    Alert.alert("Add Photo", "Choose a source", [
      { text: "Camera", onPress: () => pickImage(true) },
      { text: "Gallery", onPress: () => pickImage(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function handleSubmit() {
    if (!photoUri) {
      Alert.alert("Photo Required", "Please add a photo of your catch.");
      return;
    }
    if (!species) {
      Alert.alert("Species Required", "Please select the fish species.");
      return;
    }
    if (!locationName) {
      Alert.alert("Location Required", "Please add a location name.");
      return;
    }

    setSubmitting(true);
    try {
      const photoPath = `${user!.id}/${Date.now()}.jpg`;
      const photo_url = await uploadImage(photoUri, photoPath);

      const profile = await getUserProfile(user!.id);

      await createReport({
        user_id: user!.id,
        user_name: profile?.display_name ?? user!.user_metadata?.display_name ?? "Angler",
        user_avatar: profile?.avatar_url,
        photo_url,
        species,
        weight_lb: weightLb ? parseFloat(weightLb) : undefined,
        weight_oz: weightOz ? parseFloat(weightOz) : undefined,
        length_inches: lengthInches ? parseFloat(lengthInches) : undefined,
        location_name: locationName,
        latitude: latitude ?? 52.5,
        longitude: longitude ?? -1.5,
        notes: notes.trim(),
        caught_at: new Date().toISOString(),
      });

      Alert.alert("Posted!", "Your catch report has been shared.", [
        { text: "OK" },
      ]);

      // Reset form
      setPhotoUri(null);
      setSpecies("");
      setWeightLb("");
      setWeightOz("");
      setLengthInches("");
      setNotes("");
    } catch (err: any) {
      console.error("Submit error:", err);
      Alert.alert("Error", err.message || "Failed to post report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo picker */}
        <TouchableOpacity
          onPress={showImageOptions}
          style={[
            styles.photoBox,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.borderRadius.lg,
            },
          ]}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={48} color={theme.colors.textMuted} />
              <Text style={[styles.photoText, { color: theme.colors.textMuted }]}>
                Tap to add a photo of your catch
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Species picker */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Species *</Text>
        <TouchableOpacity
          onPress={() => setShowSpeciesPicker(!showSpeciesPicker)}
          style={[
            styles.pickerButton,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              borderRadius: theme.borderRadius.md,
            },
          ]}
        >
          <Ionicons name="fish-outline" size={20} color={theme.colors.textMuted} />
          <Text
            style={[
              styles.pickerText,
              { color: species ? theme.colors.text : theme.colors.placeholder },
            ]}
          >
            {species || "Select species"}
          </Text>
          <Ionicons
            name={showSpeciesPicker ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>

        {showSpeciesPicker && (
          <View
            style={[
              styles.speciesList,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.md,
              },
            ]}
          >
            <ScrollView style={styles.speciesScroll} nestedScrollEnabled>
              {UK_FISH_SPECIES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    setSpecies(s);
                    setShowSpeciesPicker(false);
                  }}
                  style={[
                    styles.speciesItem,
                    species === s && { backgroundColor: theme.colors.primary + "15" },
                  ]}
                >
                  <Text
                    style={[
                      styles.speciesItemText,
                      {
                        color: species === s ? theme.colors.primary : theme.colors.text,
                        fontWeight: species === s ? "600" : "400",
                      },
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Weight */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Weight</Text>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
              placeholder="lb"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="numeric"
              value={weightLb}
              onChangeText={setWeightLb}
            />
          </View>
          <View style={styles.halfInput}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
              placeholder="oz"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="numeric"
              value={weightOz}
              onChangeText={setWeightOz}
            />
          </View>
        </View>

        {/* Length */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Length (inches)</Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.text,
              borderRadius: theme.borderRadius.md,
            },
          ]}
          placeholder="e.g. 24"
          placeholderTextColor={theme.colors.placeholder}
          keyboardType="numeric"
          value={lengthInches}
          onChangeText={setLengthInches}
        />

        {/* Location */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Location *</Text>
        <View
          style={[
            styles.locationRow,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              borderRadius: theme.borderRadius.md,
            },
          ]}
        >
          <Ionicons name="location-outline" size={20} color={theme.colors.textMuted} />
          <TextInput
            style={[styles.locationInput, { color: theme.colors.text }]}
            placeholder="e.g. River Trent, Nottingham"
            placeholderTextColor={theme.colors.placeholder}
            value={locationName}
            onChangeText={setLocationName}
          />
          <TouchableOpacity onPress={getCurrentLocation} disabled={gettingLocation}>
            <Ionicons
              name="navigate-outline"
              size={20}
              color={gettingLocation ? theme.colors.textMuted : theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Notes</Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.text,
              borderRadius: theme.borderRadius.md,
            },
          ]}
          placeholder="Bait used, conditions, story of the catch..."
          placeholderTextColor={theme.colors.placeholder}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
          value={notes}
          onChangeText={setNotes}
        />
        <Text style={[styles.charCount, { color: theme.colors.textMuted }]}>
          {notes.length}/500
        </Text>

        <Button
          title="Post Catch Report"
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
          style={{ marginTop: 16, marginBottom: 32 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
  },
  photoBox: {
    height: 220,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: 20,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  photoText: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 12,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
  },
  speciesList: {
    borderWidth: 1,
    marginTop: 4,
    maxHeight: 200,
  },
  speciesScroll: {},
  speciesItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  speciesItemText: {
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 15,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    marginTop: 4,
  },
});
