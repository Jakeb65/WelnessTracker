import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Appbar, Button, Chip, IconButton, Text, TextInput } from 'react-native-paper';
import { updateEntry } from '../api/entries';
import { Picker } from '@react-native-picker/picker';

const moodOptions = [
  'Super',
  'Dobrze',
  'OK',
  'Zmęczony',
  'Smutny',
  'Zestresowany',
];

export default function EditScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [steps, setSteps] = useState(params.steps?.toString() || '');
    const [activityMinutes, setActivityMinutes] = useState(params.activityMinutes?.toString() || '');
    const [mood, setMood] = useState(params.mood?.toString() || '');
    const [exerciseInput, setExerciseInput] = useState('');
    const [exercises, setExercises] = useState<string[]>(
        params.exercises ? JSON.parse(params.exercises as string) : []
    );

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
            });
            setModalVisible(true);
        } catch (e) {
            setErrorMessage('Błąd podczas zapisu zmian');
            setModalVisible(true);
        } finally {
            setSaving(false);
        }
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