import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Appbar, Button, Text, TextInput } from 'react-native-paper';

export default function EditScreen() {
    const router = useRouter();
    const [steps, setSteps] = useState('');
    const [activityMinutes, setActivityMinutes] = useState('');
    const [mood, setMood] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        if (!steps.trim() || !activityMinutes.trim() || !mood.trim()) {
            setErrorMessage('Wszystkie pola są wymagane');
            setModalVisible(true);
            return;
        }
        setErrorMessage('');
        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        if (!errorMessage) {
            router.back();
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
                <Appbar.Content title="Dodaj aktywność" titleStyle={styles.headerContent} />
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
                <Text style={styles.label}>Samopoczucie</Text>
                <TextInput
                    placeholder="Jak się czujesz?"
                    value={mood}
                    onChangeText={setMood}
                    style={styles.input}
                />
                <Button
                    mode="contained"
                    style={styles.button}
                    onPress={handleSave}
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