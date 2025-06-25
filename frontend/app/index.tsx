import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, ProgressBar, Text } from 'react-native-paper';
import { getEntries } from '../api/entries';
import { Image } from 'expo-image'; // dodaj import

export default function HomeScreen() {
    const router = useRouter();
    const [daysData, setDaysData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEntries()
            .then(data => setDaysData(data))
            .catch(() => setDaysData([]))
            .finally(() => setLoading(false));
    }, []);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f5f5f5',
            padding: 12,
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
            zIndex: 0,
        },
        card: {
            marginBottom: 16,
            borderRadius: 12,
            elevation: 3,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            backgroundColor: '#fff',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
        },
        dateText: {
            fontWeight: 'bold',
            fontSize: 16,
        },
        dayText: {
            color: '#888',
            fontSize: 14,
        },
        progressRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            backgroundColor: '#fff',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
        },
        progressItem: {
            flex: 1,
            alignItems: 'center',
            marginHorizontal: 4,
        },
        progressLabel: {
            fontSize: 12,
            color: '#666',
            marginBottom: 4,
        },
        progressValue: {
            fontWeight: 'bold',
            fontSize: 14,
            marginBottom: 2,
        },
        progressBar: {
            width: 50,
            height: 8,
            borderRadius: 4,
            marginBottom: 2,
        },
        appbar: {
            backgroundColor: '#4CAF50',
            elevation: 4,
            marginBottom: 12,
            alignItems: 'center',
        },
        appbarTitle: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 20,
            textAlign: 'center',
            width: '100%',
        },
        editButtonContainer: {
            backgroundColor: '#fff',
            padding: 16,
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            zIndex: 2,
        },
        editButton: {
            backgroundColor: '#4CAF50',
            marginBottom: 12,
        },
        statsButton: {
            backgroundColor: '#2196F3',
        },
        scrollContent: {
            paddingBottom: 140,
        }
    });

    return (
        <View style={{ flex: 1 }}>
            <Image
                source={require('../assets/images/home-background.png')}
                style={styles.backgroundImage}
                contentFit="cover"
                contentPosition="center"
            />
            <Appbar style={styles.appbar}>
                <Appbar.Content
                    title={
                        <View>
                            <Text style={styles.appbarTitle}>WELLNESS TRACKER</Text>
                        </View>
                    }
                />
            </Appbar>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <Text>Ładowanie...</Text>
                ) : daysData.length === 0 ? (
                    <Text>Brak danych.</Text>
                ) : (
                    daysData.map((day, idx) => (
                        <Card
                          key={idx}
                          style={styles.card}
                          onPress={() => router.push({ pathname: '/details', params: { id: day.id } })}
                        >
                            <View style={styles.header}>
                                <Text style={styles.dateText}>{day.date}</Text>
                                <Text style={styles.dayText}>{day.day}</Text>
                            </View>
                            <View style={styles.progressRow}>
                                <View style={styles.progressItem}>
                                    <Text style={styles.progressLabel}>Kroki</Text>
                                    <Text style={styles.progressValue}>{day.steps}/{day.stepsGoal}</Text>
                                    <ProgressBar
                                        progress={day.steps / day.stepsGoal}
                                        color="#4CAF50"
                                        style={styles.progressBar}
                                    />
                                </View>
                                <View style={styles.progressItem}>
                                    <Text style={styles.progressLabel}>Aktywność</Text>
                                    <Text style={styles.progressValue}>{day.activity}/{day.activityGoal} min</Text>
                                    <ProgressBar
                                        progress={day.activity / day.activityGoal}
                                        color="#2196F3"
                                        style={styles.progressBar}
                                    />
                                </View>
                                <View style={styles.progressItem}>
                                    <Text style={styles.progressLabel}>Samopoczucie</Text>
                                    <Text style={styles.progressValue}>
                                      {typeof day.mood === 'string' && day.mood.trim() !== '' && day.mood !== 'null'
                                        ? day.mood
                                        : 'Brak opisu'}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    ))
                )}
            </ScrollView>
            <View style={styles.editButtonContainer}>
                <Button
                    icon="plus"
                    mode="contained"
                    style={styles.editButton}
                    onPress={() => router.push('/add')}
                >
                    Dodaj aktywność
                </Button>
                <Button
                    icon="chart-bar"
                    mode="contained"
                    style={styles.statsButton}
                    onPress={() => router.push('/stats')}
                >
                    Statystyki
                </Button>
            </View>
        </View>
    );
}