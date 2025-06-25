import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface AddPlaceModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, city: string, description: string, imageName: string) => void;
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ visible, onClose, onSave }) => {
    const [name, setName] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [imageName, setImageName] = useState<string>('');

    const handleSave = () => {
        onSave(name, city, description, imageName);
        setName('');
        setCity('');
        setDescription('');
        setImageName('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Dodaj nowe miejsce</Text>
                    <TextInput
                        placeholder="np. Rynek"
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        placeholder="np. Kraków"
                        style={styles.input}
                        value={city}
                        onChangeText={setCity}
                    />
                    <TextInput
                        placeholder="np. Historyczne centrum..."
                        style={styles.input}
                        value={description}
                        onChangeText={setDescription}
                    />
                    <TextInput
                        placeholder="np. krakow"
                        style={styles.input}
                        value={imageName}
                        onChangeText={setImageName}
                    />
                    <View style={styles.buttonRow}>
                        <Pressable onPress={onClose} style={styles.buttonCancel}>
                            <Text style={[styles.buttonText, { color: '#333' }]}>Wróć</Text>
                        </Pressable>
                        <Pressable onPress={handleSave} style={styles.buttonSave}>
                            <Text style={styles.buttonText}>Zapisz</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '85%',
        elevation: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 12,
        borderRadius: 6,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttonCancel: {
        backgroundColor: '#ddd',
        padding: 10,
        borderRadius: 6,
        flex: 1,
        marginRight: 10,
    },
    buttonSave: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 6,
        flex: 1,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default AddPlaceModal;
