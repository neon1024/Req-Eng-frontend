import { useAuth } from "@/app/context/AuthContext";
import { styles } from "@/app/styles/home.styles";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>Bun venit</Text>
            <Text style={styles.subtitle}>
                Monitorizează-ți starea, notează emoțiile și accesează exerciții
                de relaxare.
            </Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.buttonPrimary}
                    onPress={() => router.replace("/dailyMood")}
                >
                    <Text style={styles.buttonText}>Starea zilnică</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonSecondary}
                    onPress={() => alert("")}
                >
                    <Text style={styles.buttonText}>Jurnal emoțional</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonSecondary}
                    onPress={() => alert("")}
                >
                    <Text style={styles.buttonText}>Exerciții</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonAlert}
                    onPress={() => alert("")}
                >
                    <Text style={styles.buttonText}>Ajutor de urgență</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
