import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Avatar, Button, Card, List, ProgressBar, Text } from 'react-native-paper';
import AddPlaceModal from '../components/ui/AddPlaceModal';
import { getEntry, deleteEntry } from '../api/entries';

const stepsGoal = 10000;

export default function DetailsScreen() {
    const [photoBrightness, setPhotoBrightness] = useState<number | null>(null);
    const router = useRouter();
    const params = useLocalSearchParams();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [entry, setEntry] = useState<any>(null);

    useEffect(() => {
        if (!params.id) {
            setLoading(false);
            return;
        }
        const id =
            typeof params.id === 'string'
                ? parseInt(params.id, 10)
                : Array.isArray(params.id)
                ? parseInt(params.id[0], 10)
                : undefined;
        if (!id || isNaN(id)) {
            setEntry(null);
            setLoading(false);
            return;
        }
        getEntry(id)
            .then(async (data) => {
                setEntry(data);
                // Jeśli jest zdjęcie, policz jasność
                if (data && data.photoUri) {
                    try {
                        const manipResult = await ImageManipulator.manipulateAsync(
                            data.photoUri,
                            [{ resize: { width: 8, height: 8 } }],
                            { base64: true }
                        );
                        if (manipResult.base64) {
                            const byteCharacters = atob(manipResult.base64);
                            let total = 0, count = 0;
                            for (let i = 0; i < byteCharacters.length; i += 4) {
                                const r = byteCharacters.charCodeAt(i);
                                const g = byteCharacters.charCodeAt(i + 1);
                                const b = byteCharacters.charCodeAt(i + 2);
                                // Sprawdź czy bajty są poprawne (mogą być NaN na końcu base64)
                                if (
                                    !isNaN(r) && !isNaN(g) && !isNaN(b)
                                ) {
                                    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                                    total += brightness;
                                    count++;
                                }
                            }
                            if (count > 0) {
                                setPhotoBrightness(Math.round(total / count));
                            } else {
                                setPhotoBrightness(null);
                            }
                        } else {
                            setPhotoBrightness(null);
                        }
                    } catch {
                        setPhotoBrightness(null);
                    }
                } else {
                    setPhotoBrightness(null);
                }
            })
            .catch(() => setEntry(null))
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleSavePlace = (name, city, description, imageName) => {
        // Możesz dodać obsługę zapisu miejsca jeśli potrzebujesz
        setIsModalVisible(false);
    };

    const handleDelete = async () => {
        if (!params.id) return;
        const id =
            typeof params.id === 'string'
                ? parseInt(params.id, 10)
                : Array.isArray(params.id)
                ? parseInt(params.id[0], 10)
                : undefined;
        if (!id || isNaN(id)) {
            setDeleteModalVisible(false);
            return;
        }
        try {
            await deleteEntry(id);
            setDeleteModalVisible(false);
            router.back();
        } catch {
            setDeleteModalVisible(false);
        }
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
        content: {
            flex: 1,
            padding: 16,
            zIndex: 1,
        },
        card: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            marginBottom: 16,
        },
        header: {
            backgroundColor: 'transparent',
            elevation: 0,
        },
        headerContent: {
            color: 'black',
            fontWeight: 'bold',
        },
        sectionTitle: {
            fontWeight: 'bold',
            marginBottom: 4,
        },
        moodRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        addButton: {
            marginTop: 24,
            backgroundColor: '#4CAF50',
        },
        addButtonContainer: {
            backgroundColor: '#4CAF50',
            padding: 14,
            borderRadius: 8,
            marginBottom: 10,
            alignItems: 'center',
            elevation: 3,
        },
        addButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '500',
        },
        centeredView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 22,
            backgroundColor: 'rgba(0,0,0,0.4)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
        },
        modalView: {
            margin: 20,
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 35,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        modalText: {
            marginBottom: 15,
            textAlign: 'center',
        },
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
                <Appbar.Content title="Podsumowanie dnia" titleStyle={styles.headerContent} />
            </Appbar.Header>
            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
                {loading ? (
                    <Text>Ładowanie...</Text>
                ) : !entry ? (
                    <Text>Brak danych.</Text>
                ) : (
                    <>
                        <Card style={styles.card}>
                            <Card.Title title="Kroki" left={props => <Avatar.Icon {...props} icon="walk" color="#4CAF50" />} />
                            <Card.Content>
                                <Text variant="headlineMedium">{entry.steps} / {entry.stepsGoal || stepsGoal}</Text>
                                <ProgressBar progress={entry.steps / (entry.stepsGoal || stepsGoal)} color="#4CAF50" style={{ marginTop: 8 }} />
                                <Text variant="bodySmall" style={{ marginTop: 4 }}>Cel: {entry.stepsGoal || stepsGoal} kroków</Text>
                            </Card.Content>
                        </Card>
                        <Card style={styles.card}>
                            <Card.Title title="Aktywność fizyczna" left={props => <Avatar.Icon {...props} icon="run" color="#4CAF50" />} />
                            <Card.Content>
                                <Text variant="headlineMedium">{entry.activity} min</Text>
                                <Text variant="bodySmall" style={{ marginTop: 4 }}>Dzienny cel: {entry.activityGoal || 30} min</Text>
                            </Card.Content>
                        </Card>
                        <Card style={styles.card}>
                            <Card.Title title="Ćwiczenia" left={props => <Avatar.Icon {...props} icon="dumbbell" color="#4CAF50" />} />
                            <Card.Content>
                                {!entry.exercises || entry.exercises.length === 0 ? (
                                    <Text variant="bodyMedium">Brak ćwiczeń</Text>
                                ) : (
                                    entry.exercises.map((exercise: string, idx: number) => (
                                        <List.Item
                                            key={idx}
                                            title={exercise}
                                            left={props => <List.Icon {...props} icon="check-circle-outline" color="#4CAF50" />}
                                            style={{ paddingVertical: 0 }}
                                        />
                                    ))
                                )}
                            </Card.Content>
                        </Card>
                        <Card style={styles.card}>
                            <Card.Title title="Samopoczucie" left={props => <Avatar.Icon {...props} icon="emoticon-happy-outline" color="#4CAF50" />} />
                            <Card.Content>
                                <View style={styles.moodRow}>
                                    <Text variant="headlineMedium">{entry.mood}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                        {/* Sekcja zdjęcia */}
                        {entry.photoUri ? (
                            <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                <Image
                                    source={{ uri: entry.photoUri }}
                                    style={{ width: 220, height: 160, borderRadius: 12, marginBottom: 8 }}
                                    contentFit="cover"
                                />
                                {photoBrightness !== null && !isNaN(photoBrightness) && (
                                    <Text style={{ marginBottom: 4, color: '#555' }}>
                                        Jasność zdjęcia: {Math.round(photoBrightness * 4)} lux
                                    </Text>
                                )}
                            </View>
                        ) : null}
                        <Button
                            icon="plus"
                            mode="contained"
                            style={styles.addButton}
                            onPress={() =>
                                router.push({
                                    pathname: '/edit',
                                    params: {
                                        id: entry.id,
                                        steps: entry.steps,
                                        activityMinutes: entry.activity,
                                        mood: entry.mood,
                                        exercises: JSON.stringify(entry.exercises || []),
                                        photoUri: entry.photoUri || ''
                                    }
                                })
                            }
                        >
                            Edytuj aktywność
                        </Button>
                        <Button
                            icon="delete"
                            mode="contained"
                            style={[styles.addButton, { backgroundColor: '#f44336', marginTop: 12 }]}
                            onPress={() => setDeleteModalVisible(true)}
                        >
                            Usuń aktywność
                        </Button>
                        <AddPlaceModal
                            visible={isModalVisible}
                            onClose={() => setIsModalVisible(false)}
                            onSave={handleSavePlace}
                        />
                    </>
                )}
            </ScrollView>
            {/* MODAL usuwania */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={deleteModalVisible}
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>
                            Aktywność została usunięta!
                        </Text>
                        <Button
                            mode="contained"
                            onPress={handleDelete}
                        >
                            OK
                        </Button>
                    </View>
                </View>
            </Modal>
        </View>
    );
}