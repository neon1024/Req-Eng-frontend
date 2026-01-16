import { useAuth } from "@/context/AuthContext";
import HomeScreen from "@/components/HomeScreen";
import LoginButton from "@/components/LoginButton";
import { View, StyleSheet, SafeAreaView } from "react-native";

export default function Index() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <LoginButton />
                <HomeScreen />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
});
