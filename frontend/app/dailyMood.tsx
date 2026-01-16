import axios from "axios";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "./context/AuthContext";

type Mood = {
    emoji: string;
    rating: number;
};

type MoodEntry = {
    id: string;
    rate: number;
    date: string;
    createdAt: string;
    emoji: string;
};

const moodOptions: Mood[] = [
    { emoji: "😢", rating: 1 },
    { emoji: "😟", rating: 2 },
    { emoji: "😐", rating: 3 },
    { emoji: "😏", rating: 4 },
    { emoji: "😊", rating: 5 },
    { emoji: "😄", rating: 6 },
    { emoji: "😁", rating: 7 },
    { emoji: "😍", rating: 8 },
    { emoji: "🤩", rating: 9 },
    { emoji: "🤯", rating: 10 },
];

export default function DailyMood() {
    const { token } = useAuth();

    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [previousMoods, setPreviousMoods] = useState<MoodEntry[]>([]);

    const getMoods = async () => {
        try {
            const response = await axios.get(
                "http://localhost:3000/api/moods",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = response.data;

            if (data.error) {
                Alert.alert("Eroare", data.error);
                return;
            }

            // Map rate to emoji
            const mappedMoods: MoodEntry[] = data.moods.map((m: any) => {
                const match = moodOptions.find((o) => o.rating === m.rate);
                return { ...m, emoji: match ? match.emoji : "❓" };
            });

            setPreviousMoods(mappedMoods);

            // Select today's mood automatically if already tracked
            if (data.todayTracked && data.todayMood) {
                const todayMatch = moodOptions.find(
                    (o) => o.rating === data.todayMood.rate
                );
                if (todayMatch) setSelectedMood(todayMatch);
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Eroare", "Nu s-au putut încărca mood-urile.");
        }
    };

    useEffect(() => {
        if (token) getMoods();
    }, [token]);

    const handleSelectMood = (mood: Mood) => setSelectedMood(mood);

    const handleSelectRating = (rating: number) => {
        const mood = moodOptions.find((m) => m.rating === rating);
        if (mood) setSelectedMood(mood);
    };

    const handleSubmit = async () => {
        if (!selectedMood) {
            Alert.alert(
                "Atenție",
                "Te rog selectează o stare înainte de a trimite!"
            );
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:3000/api/moods",
                { rate: selectedMood.rating },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;

            if (data.error) {
                Alert.alert("Eroare", data.error);
                return;
            }

            // Add to previous moods
            const newEntry: MoodEntry = {
                id: data.mood.id,
                rate: data.mood.rate,
                date: data.mood.date,
                createdAt: data.mood.createdAt,
                emoji: selectedMood.emoji,
            };

            setPreviousMoods([newEntry, ...previousMoods]);

            Alert.alert(
                "Stare înregistrată",
                `Ai selectat ${selectedMood.emoji} cu rating ${selectedMood.rating}/10`
            );

            setSelectedMood(null);
        } catch (err) {
            console.error(err);
            Alert.alert("Eroare", "Nu s-a putut înregistra mood-ul.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Cum te simți azi?</Text>

            {/* Emoji selector */}
            <FlatList
                data={moodOptions}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.rating.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.emojiButton,
                            selectedMood?.emoji === item.emoji &&
                                styles.selectedEmoji,
                        ]}
                        onPress={() => handleSelectMood(item)}
                    >
                        <Text style={styles.emoji}>{item.emoji}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={{
                    paddingHorizontal: 10,
                    marginVertical: 20,
                }}
            />

            {/* Rating selector */}
            <Text style={styles.ratingLabel}>
                Rating: {selectedMood ? selectedMood.rating : "-"}
            </Text>
            <View style={styles.ratingContainer}>
                {moodOptions.map((item) => (
                    <TouchableOpacity
                        key={item.rating}
                        style={[
                            styles.ratingButton,
                            selectedMood?.rating === item.rating &&
                                styles.selectedRating,
                        ]}
                        onPress={() => handleSelectRating(item.rating)}
                    >
                        <Text
                            style={[
                                styles.ratingText,
                                selectedMood?.rating === item.rating && {
                                    color: "#fff",
                                },
                            ]}
                        >
                            {item.rating}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
            >
                <Text style={styles.submitText}>Trimite</Text>
            </TouchableOpacity>

            <Text style={styles.previousTitle}>Mood-uri anterioare:</Text>
            {previousMoods.length === 0 ? (
                <Text style={styles.noMoods}>Nu ai adăugat încă mood-uri.</Text>
            ) : (
                previousMoods.map((entry) => (
                    <View key={entry.id} style={styles.moodEntry}>
                        <Text style={styles.moodEmoji}>{entry.emoji}</Text>
                        <Text style={styles.moodText}>
                            {entry.rate}/10 -{" "}
                            {new Date(entry.date).toLocaleDateString()}{" "}
                            {new Date(entry.date).toLocaleTimeString()}
                        </Text>
                    </View>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: "#f0f4f8",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center",
    },
    emojiButton: {
        padding: 16,
        marginHorizontal: 6,
        borderRadius: 12,
        backgroundColor: "#fff",
        elevation: 3,
    },
    selectedEmoji: { borderWidth: 2, borderColor: "#2563eb" },
    emoji: { fontSize: 32 },
    ratingLabel: { fontSize: 18, fontWeight: "500", marginBottom: 12 },
    ratingContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    ratingButton: {
        width: 40,
        height: 40,
        margin: 4,
        borderRadius: 8,
        backgroundColor: "#e5e7eb",
        justifyContent: "center",
        alignItems: "center",
    },
    selectedRating: { backgroundColor: "#2563eb" },
    ratingText: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
    submitButton: {
        marginTop: 20,
        backgroundColor: "#2563eb",
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
    },
    submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    previousTitle: { marginTop: 30, fontSize: 20, fontWeight: "600" },
    noMoods: { marginTop: 10, fontSize: 16, color: "#6b7280" },
    moodEntry: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
        marginVertical: 6,
        borderRadius: 10,
        width: "100%",
        elevation: 2,
    },
    moodEmoji: { fontSize: 28, marginRight: 12 },
    moodText: { fontSize: 16 },
});
