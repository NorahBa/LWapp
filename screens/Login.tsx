import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import FormikInput from "../components/ui/FormikInput";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

type CartScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "login" //revise this one
>;

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
});

const LoginScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    isError: false,
  });

  // Page entry animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  // Background circles motion
  const topCircleAnim = useRef(new Animated.Value(0)).current;
  const bottomCircleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry content animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Top circle: scale + rotate + float
    Animated.loop(
      Animated.sequence([
        Animated.timing(topCircleAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(topCircleAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Bottom circle: floating up/down
    Animated.loop(
      Animated.sequence([
        Animated.timing(bottomCircleAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bottomCircleAnim, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const topCircleStyle = {
    transform: [
      {
        translateX: topCircleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 15],
        }),
      },
      {
        rotate: topCircleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "30deg"],
        }),
      },
      {
        scale: topCircleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
  };

  const bottomCircleStyle = {
    transform: [
      {
        translateY: bottomCircleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
      {
        scale: bottomCircleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        }),
      },
    ],
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showModal("Welcome back! 👋", "You've successfully logged in.", false);
      navigation.navigate("Shopping");
    } catch (error: any) {
      showModal("Login Failed", "Incorrect Email or password, please try again" , true);
    }
  };

  const handleGuestLogin = () => {
    navigation.navigate("Shopping");
    showModal("Guest Mode", "You're browsing as a guest", false);
  };

  const showModal = (title: string, message: string, isError: boolean) => {
    setModalContent({ title, message, isError });
    setModalVisible(true);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <LinearGradient colors={["#e6f5f3", "#d1f0ed"]} style={StyleSheet.absoluteFill} />

      {/* Moving Animated Circles */}
      <Animated.View style={[styles.circle, styles.circleTop, topCircleStyle]} />
      <Animated.View style={[styles.circle, styles.circleBottom, bottomCircleStyle]} />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
          <Animatable.View animation="bounceIn" duration={1000} delay={400} style={styles.headerContainer}>
            <Image source={require("../assets/LazyWait-logo.webp")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to continue</Text>
          </Animatable.View>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={(values) => handleLogin(values.email, values.password)}
          >
            {({ handleSubmit }) => (
              <Animatable.View animation="fadeInUp" duration={800} delay={600} style={styles.formContainer}>
                <FormikInput
                  name="email"
                  label="Email Address"
                  placeholder="your@email.com"
                  type="email"
                  icon="email"
                  containerStyle={styles.inputContainer}
                />
                <FormikInput
                  name="password"
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  icon="lock"
                  containerStyle={styles.inputContainer}
                />
                <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginButton} onPress={handleSubmit} activeOpacity={0.9}>
                  <LinearGradient colors={["#029687", "#02b8a8"]} style={styles.gradient}>
                    <Text style={styles.loginButtonText}>Log In</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin} activeOpacity={0.8}>
                  <Text style={styles.guestButtonText}>Continue as Guest</Text>
                </TouchableOpacity>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Signup")} activeOpacity={0.7}>
                    <Text style={styles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            )}
          </Formik>
        </Animated.View>
      </ScrollView>

      {/* Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <View style={styles.modalContainer}>
          <Animatable.View 
            animation="zoomIn" 
            duration={300}
            style={[
              styles.modalContent,
              modalContent.isError ? styles.modalError : styles.modalSuccess
            ]}
          >
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <Text style={styles.modalMessage}>{modalContent.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f5f3",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2c3e50",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 25,
    shadowColor: "#029687",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: "#029687",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    borderRadius: 15,
    overflow: "hidden",
    height: 55,
    marginBottom: 20,
  },
  gradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ecf0f1",
  },
  dividerText: {
    color: "#7f8c8d",
    paddingHorizontal: 10,
    fontSize: 14,
  },
  guestButton: {
    borderWidth: 2,
    borderColor: "#029687",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  guestButtonText: {
    color: "#029687",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  signupText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  signupLink: {
    color: "#029687",
    fontWeight: "bold",
    fontSize: 14,
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
  },
  circleTop: {
    width: 300,
    height: 300,
    top: -150,
    right: -100,
    backgroundColor: "rgba(2, 150, 135, 0.2)",
  },
  circleBottom: {
    width: 400,
    height: 400,
    bottom: -200,
    left: -100,
    backgroundColor: "rgba(243, 181, 69, 0.2)",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalSuccess: {
    borderTopWidth: 5,
    borderTopColor: "#02b8a8",
  },
  modalError: {
    borderTopWidth: 5,
    borderTopColor: "#e74c3c",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#2c3e50",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#7f8c8d",
  },
  modalButton: {
    backgroundColor: "#029687",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 2,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LoginScreen;
