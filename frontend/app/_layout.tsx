import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";
import "react-native-reanimated";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/context/AuthContext";

// Hide scrollbar on web
const useHideScrollbar = () => {
    useEffect(() => {
        if (Platform.OS === "web") {
            const style = document.createElement("style");
            style.textContent = `
                ::-webkit-scrollbar {
                    display: none;
                }
                * {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                html, body, #root {
                    overflow: hidden;
                    height: 100%;
                }
            `;
            document.head.appendChild(style);
            return () => {
                document.head.removeChild(style);
            };
        }
    }, []);
};

// Custom dark theme with our color scheme
const customDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: "#0f172a",
        card: "#1e293b",
        text: "#f8fafc",
        border: "#334155",
        primary: "#6366f1",
    },
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    useHideScrollbar();

    return (
        <View style={styles.outerContainer}>
            <View style={styles.appContainer}>
                <ThemeProvider value={customDarkTheme}>
                    <AuthProvider>
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                contentStyle: { backgroundColor: "#0f172a" },
                            }}
                        >
                            <Stack.Screen name="index" />
                            <Stack.Screen
                                name="login"
                                options={{
                                    presentation: "modal",
                                    animation: "slide_from_bottom",
                                }}
                            />
                            <Stack.Screen name="dailyMood" />
                            <Stack.Screen name="doctor" />
                            <Stack.Screen
                                name="modal"
                                options={{
                                    presentation: "modal",
                                    title: "Modal",
                                }}
                            />
                            <Stack.Screen
                                name="(tabs)"
                                options={{ headerShown: false }}
                            />
                        </Stack>
                        <StatusBar style="light" />
                    </AuthProvider>
                </ThemeProvider>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: "#0f172a",
        alignItems: "center",
        // @ts-ignore - web only style to hide scrollbar
        overflow: "hidden",
    },
    appContainer: {
        flex: 1,
        width: "100%",
        maxWidth: 1200,
        backgroundColor: "#0f172a",
        // @ts-ignore - web only style to hide scrollbar
        overflow: "auto",
        // @ts-ignore - hide scrollbar on webkit browsers
        scrollbarWidth: "none",
        msOverflowStyle: "none",
    },
});
