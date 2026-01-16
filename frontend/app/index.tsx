import LoginButton from "@/components/LoginButton";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import HomeScreen from "../components/HomeScreen";
import { styles } from "./styles/home.styles";

export default function Index() {
    return (
        <View style={styles.container}>
            <LoginButton />
            <HomeScreen />
        </View>
    );
}
