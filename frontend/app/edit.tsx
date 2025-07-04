import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, StyleSheet, View, ScrollView } from 'react-native';
import { Appbar, Button, Chip, IconButton, Text, TextInput } from 'react-native-paper';
import { updateEntry } from '../api/entries';
import { Picker } from '@react-native-picker/picker';
import * as ImageManipulator from 'expo-image-manipulator';

const moodOptions = [
  'Super',
  'Dobrze',
  'OK',
  'Zmęczony',
  'Smutny',
  'Zestresowany',
];


// Funkcja do liczenia średniej jasności zdjęcia (0-255)
async function calculateBrightness(uri: string): Promise<number> {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 8, height: 8 } }],
    { base64: true }
  );
  if (!manipResult.base64) return 255;
  const byteCharacters = atob(manipResult.base64);
  let total = 0, count = 0;
  for (let i = 0; i < byteCharacters.length; i += 4) {
    const r = byteCharacters.charCodeAt(i);
    const g = byteCharacters.charCodeAt(i + 1);
    const b = byteCharacters.charCodeAt(i + 2);
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    total += brightness;
    count++;
  }
  return total / count;
}

export default function EditScreen() {
    const [photoBrightness, setPhotoBrightness] = useState<number | null>(null);
    const router = useRouter();
    const params = useLocalSearchParams();

    const [steps, setSteps] = useState(params.steps?.toString() || '');
    const [activityMinutes, setActivityMinutes] = useState(params.activityMinutes?.toString() || '');
    const [mood, setMood] = useState(params.mood?.toString() || '');
    const [exerciseInput, setExerciseInput] = useState('');
    const [exercises, setExercises] = useState<string[]>(
        params.exercises ? JSON.parse(params.exercises as string) : []
    );

    // Obsługa zdjęcia
    const [photoUri, setPhotoUri] = useState(params.photoUri?.toString() || null);

    // Światło (lux) - do zapisu z wpisem
    // (hook tylko do wyświetlania, jeśli chcesz zapisywać, dodaj stan lux i przekazuj do backendu)

    const [modalVisible, setModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [saving, setSaving] = useState(false);


    const handleSave = async () => {
        if (!steps.trim() || !activityMinutes.trim() || !mood.trim()) {
            setErrorMessage('Wszystkie pola są wymagane');
            setModalVisible(true);
            return;
        }
        setErrorMessage('');
        setSaving(true);

        try {
            await updateEntry(Number(params.id), {
                steps: Number(steps),
                activity: Number(activityMinutes),
                mood,
                exercises,
                photoUri,
                photoBrightness: photoBrightness !== null && !isNaN(photoBrightness) ? photoBrightness : null,
            });
            setModalVisible(true);
        } catch (e) {
            setErrorMessage('Błąd podczas zapisu zmian');
            setModalVisible(true);
        } finally {
            setSaving(false);
        }
    };

    // Obsługa zdjęcia
    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            setErrorMessage('Brak uprawnień do aparatu');
            setModalVisible(true);
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            // Analiza jasności
            try {
                const brightness = await calculateBrightness(uri);
                if (brightness < 60) {
                    setErrorMessage('Zdjęcie jest bardzo ciemne! Spróbuj zrobić je w lepszym świetle lub użyj lampy błyskowej.');
                    setModalVisible(true);
                    setPhotoUri(null);
                    setPhotoBrightness(null);
                    return;
                }
                setPhotoBrightness(Math.round(brightness));
            } catch (e) {
                setPhotoBrightness(null);
            }
            setPhotoUri(uri);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoUri(null);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        if (!errorMessage) {
            router.back();
        }
    };

    const handleAddExercise = () => {
        if (exerciseInput.trim()) {
            setExercises([...exercises, exerciseInput.trim()]);
            setExerciseInput('');
        }
    };

    const handleRemoveExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            width: '100%',
        },
        backgroundImage: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            opacity: 0.15,
        },
        header: {
            backgroundColor: 'transparent',
            elevation: 0,
        },
        headerContent: {
            color: 'black',
            fontWeight: 'bold',
        },
        content: {
            flex: 1,
            padding: 16,
            zIndex: 1,
        },
        input: {
            marginBottom: 20,
            backgroundColor: 'rgba(255,255,255,0.95)',
        },
        button: {
            backgroundColor: '#4CAF50',
            alignSelf: 'center',
            marginTop: 16,
        },
        modalView: {
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            minWidth: '60%',
        },
        centeredView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 10,
        },
        modalText: {
            marginBottom: 20,
            textAlign: 'center',
            fontSize: 16,
        },
        label: {
            fontWeight: 'bold',
            marginBottom: 4,
            marginLeft: 2,
        },
        exerciseRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        chip: {
            marginRight: 8,
            marginBottom: 4,
        },
        exerciseList: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 12,
        }
    });

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/home-background.png')}
                style={styles.backgroundImage}
                contentFit="cover"
                contentPosition="center"
            />
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => router.back()} color="black" />
                <Appbar.Content title="Edytuj aktywność" titleStyle={styles.headerContent} />
            </Appbar.Header>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View style={styles.content}>
                    <Text style={styles.label}>Kroki</Text>
                    <TextInput
                        placeholder="Wpisz liczbę kroków"
                        value={steps}
                        onChangeText={setSteps}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <Text style={styles.label}>Aktywność fizyczna (minuty)</Text>
                    <TextInput
                        placeholder="Wpisz czas aktywności"
                        value={activityMinutes}
                        onChangeText={setActivityMinutes}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <Text style={styles.label}>Ćwiczenia</Text>
                    <View style={styles.exerciseRow}>
                        <TextInput
                            placeholder="Dodaj ćwiczenie (np. Bieganie – 20 min)"
                            value={exerciseInput}
                            onChangeText={setExerciseInput}
                            style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        />
                        <IconButton
                            icon="plus"
                            size={24}
                            onPress={handleAddExercise}
                            accessibilityLabel="Dodaj ćwiczenie"
                        />
                    </View>
                    <View style={styles.exerciseList}>
                        {exercises.map((exercise, idx) => (
                            <Chip
                                key={idx}
                                style={styles.chip}
                                onClose={() => handleRemoveExercise(idx)}
                            >
                                {exercise}
                            </Chip>
                        ))}
                    </View>
                    <Text style={styles.label}>Samopoczucie</Text>
                    <View style={[styles.input, { padding: 0 }]}> 
                      <Picker
                        selectedValue={mood}
                        onValueChange={setMood}
                        style={{ height: 50 }}
                      >
                        <Picker.Item label="Wybierz samopoczucie..." value="" />
                        {moodOptions.map(option => (
                          <Picker.Item key={option} label={option} value={option} />
                        ))}
                      </Picker>
                    </View>
                    {/* Sekcja zdjęcia na dole */}
                    <Text style={styles.label}>Zdjęcie (opcjonalnie)</Text>
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                        {photoUri ? (
                            <>
                                <Image
                                    source={{ uri: photoUri }}
                                    style={{ width: 180, height: 135, borderRadius: 10, marginBottom: 8 }}
                                    contentFit="cover"
                                />
                                {photoBrightness !== null && !isNaN(photoBrightness) && (
                                    <Text style={{ marginBottom: 4, color: '#555' }}>
                                        Jasność zdjęcia (szacowane): {Math.round(photoBrightness * 4)} lux
                                    </Text>
                                )}
                                <Button icon="close" mode="outlined" onPress={handleRemovePhoto} style={{ marginBottom: 8 }}>
                                    Usuń zdjęcie
                                </Button>
                            </>
                        ) : null}
                        <Button icon="camera" mode="outlined" onPress={handleTakePhoto} style={{ marginBottom: 8 }}>
                            Zmień / dodaj zdjęcie
                        </Button>
                    </View>
                    <Button
                        mode="contained"
                        style={styles.button}
                        onPress={handleSave}
                        loading={saving}
                        disabled={saving}
                    >
                        Zapisz aktywność
                    </Button>
                </View>
            </ScrollView>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleModalClose}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>
                            {errorMessage ? errorMessage : 'Zapisano zmiany!'}
                        </Text>
                        <Button mode="contained" onPress={handleModalClose}>
                            OK
                        </Button>
                    </View>
                </View>
            </Modal>
        </View>
    );
}