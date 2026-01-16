import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function BackButton() {
    const router = useRouter();

    const handleBack = () => {
        router.replace("/"); // sau router.push("/") dacă vrei istoric
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handleBack}>
            <Text style={styles.text}>Înapoi</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#2563eb",
        borderRadius: 8,
        alignSelf: "flex-start", // pune-l în colțul stânga sus
        margin: 16,
    },
    text: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});
