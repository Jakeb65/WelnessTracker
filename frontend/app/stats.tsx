import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Card, ProgressBar, Text } from 'react-native-paper';
import { getEntries } from '../api/entries';

const MONTHLY_STEPS_GOAL = 100000;
const MONTHLY_ACTIVITY_GOAL = 1000;

export default function StatsScreen() {
    const router = useRouter();
    const [monthData, setMonthData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEntries()
            .then((entries) => {
                if (!entries || entries.length === 0) {
                    setMonthData(null);
                    return;
                }
                // Wyciągnij miesiąc i rok z pierwszego wpisu
                let month = 'Brak danych';
                if (entries[0]?.date) {
                    const dateObj = new Date(entries[0].date);
                    const miesiace = [
                        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
                        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
                    ];
                    month = `${miesiace[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
                }
                const steps = entries.reduce((sum: number, e: any) => sum + (e.steps || 0), 0);
                const activity = entries.reduce((sum: number, e: any) => sum + (e.activity || 0), 0);
                const stepsGoal = entries.reduce((sum: number, e: any) => sum + (e.stepsGoal || 0), 0);
                const activityGoal = entries.reduce((sum: number, e: any) => sum + (e.activityGoal || 0), 0);

                // policz najczęściej wybierane samopoczucie
                const moodCounts: Record<string, number> = {};
                entries.forEach((e: any) => {
                    if (e.mood && typeof e.mood === 'string' && e.mood.trim() !== '') {
                        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
                    }
                });
                const mood = Object.keys(moodCounts).length > 0
                    ? Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0]
                    : 'Brak danych';

                setMonthData({
                    month,
                    steps,
                    stepsGoal: MONTHLY_STEPS_GOAL,         // <-- użyj stałej!
                    activity,
                    activityGoal: MONTHLY_ACTIVITY_GOAL,   // <-- użyj stałej!
                    mood,
                });
            })
            .catch(() => setMonthData(null))
            .finally(() => setLoading(false));
    }, []);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f5f5f5',
        },
        content: {
            flex: 1,
            padding: 16,
        },
        card: {
            backgroundColor: 'rgba(255,255,255,0.97)',
            borderRadius: 18,
            elevation: 4,
            marginBottom: 18,
            paddingVertical: 24,
            paddingHorizontal: 18,
        },
        monthTitle: {
            fontWeight: 'bold',
            fontSize: 22,
            textAlign: 'center',
            marginBottom: 18,
            color: '#333',
        },
        section: {
            marginBottom: 18,
        },
        sectionLabel: {
            fontSize: 15,
            color: '#666',
            marginBottom: 2,
        },
        sectionValue: {
            fontWeight: 'bold',
            fontSize: 18,
            marginBottom: 4,
            color: '#222',
        },
        progressBar: {
            height: 12,
            borderRadius: 6,
            marginBottom: 2,
        },
        appbar: {
            backgroundColor: '#2196F3',
            elevation: 4,
            marginBottom: 12,
            alignItems: 'center',
        },
        appbarTitle: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 20,
            textAlign: 'left',
            width: '100%',
        },
    });

    return (
        <View style={styles.container}>
            <Appbar style={styles.appbar}>
                <Appbar.BackAction onPress={() => router.back()} color="#fff" />
                <Appbar.Content title="Statystyki miesięczne" titleStyle={styles.appbarTitle} />
            </Appbar>
            <ScrollView style={styles.content}>
                <Card style={styles.card}>
                    {loading ? (
                        <Text>Ładowanie...</Text>
                    ) : !monthData ? (
                        <Text>Brak danych.</Text>
                    ) : (
                        <>
                            <Text style={styles.monthTitle}>{monthData.month}</Text>
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Kroki</Text>
                                <Text style={styles.sectionValue}>
                                    {monthData.steps} / {monthData.stepsGoal}
                                </Text>
                                <ProgressBar
                                    progress={monthData.stepsGoal ? monthData.steps / monthData.stepsGoal : 0}
                                    color="#4CAF50"
                                    style={styles.progressBar}
                                />
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Aktywność fizyczna</Text>
                                <Text style={styles.sectionValue}>
                                    {monthData.activity} / {monthData.activityGoal} min
                                </Text>
                                <ProgressBar
                                    progress={monthData.activityGoal ? monthData.activity / monthData.activityGoal : 0}
                                    color="#2196F3"
                                    style={styles.progressBar}
                                />
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Najczęstsze samopoczucie</Text>
                                <Text style={styles.sectionValue}>
                                    {monthData.mood}
                                </Text>
                            </View>
                        </>
                    )}
                </Card>
            </ScrollView>
        </View>
    );
}