import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

export type UserRole = "doctor" | "patient";

export type UserData = {
    id: string;
    email: string;
    name: string;
    role: UserRole;
};

type AuthContextType = {
    isLoggedIn: boolean;
    isLoading: boolean;
    user: UserData | null;
    token: string;
    login: (token: string, user: UserData) => Promise<void>;
    logout: () => Promise<void>;
    isDoctor: () => boolean;
    isPatient: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState("");
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const loadAuthState = async () => {
            try {
                const savedToken = await AsyncStorage.getItem("token");
                const savedUser = await AsyncStorage.getItem("user");

                if (savedToken && savedUser) {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.error("Error loading auth state:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadAuthState();
    }, []);

    const login = async (newToken: string, userData: UserData) => {
        setToken(newToken);
        setUser(userData);
        setIsLoggedIn(true);
        await AsyncStorage.setItem("token", newToken);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        setToken("");
        setUser(null);
        setIsLoggedIn(false);
    };

    const isDoctor = () => user?.role === "doctor";
    const isPatient = () => user?.role === "patient";

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                isLoading,
                user,
                token,
                login,
                logout,
                isDoctor,
                isPatient,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
