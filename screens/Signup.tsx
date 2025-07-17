import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import FormikInput from "../components/ui/FormikInput";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Signup"
>;

const SignupSchema = Yup.object().shape({
  firstName: Yup.string().min(2).max(50).required("First name is required"),
  lastName: Yup.string().min(2).max(50).required("Last name is required"),
  email: Yup.string().email().required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]+$/, "Digits only")
    .min(10)
    .required("Phone is required"),
  vatNumber: Yup.string().min(8).required("VAT is required"),
  street: Yup.string().min(5).required("Street is required"),
  state: Yup.string().min(2).required("State is required"),
  password: Yup.string().min(6).required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

const SignupScreen = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();

  const handleSignup = async (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    vatNumber: string,
    street: string,
    state: string,
    password: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName,
        lastName,
        email,
        phone,
        vatNumber,
        address: {
          street1: street,
          state,
        },
        createdAt: new Date(),
        role: "customer",
      });

      Alert.alert("🎉 Welcome!", "Your account has been created.");
      navigation.navigate("Shopping");
    } catch (error: any) {
      let message = "Signup failed. Try again.";
      if (error.code === "auth/email-already-in-use") {
        message = "This email is already registered.";
      }
      Alert.alert("Error", message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#e6f5f3", "#d1f0ed"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Motion Circles */}
      <Animatable.View
        animation="pulse"
        easing="ease-out"
        iterationCount="infinite"
        duration={4000}
        style={[styles.circle, styles.circleTop]}
      />
      <Animatable.View
        animation="pulse"
        easing="ease-out"
        iterationCount="infinite"
        delay={1000}
        duration={5000}
        style={[styles.circle, styles.circleBottom]}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View animation="fadeInDown" duration={1000} style={styles.headerContainer}>
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitle}>Please fill in all required information</Text>
        </Animatable.View>

        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            vatNumber: "",
            street: "",
            state: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={SignupSchema}
          onSubmit={(values) =>
            handleSignup(
              values.firstName,
              values.lastName,
              values.email,
              values.phone,
              values.vatNumber,
              values.street,
              values.state,
              values.password
            )
          }
        >
          {({ handleSubmit }) => (
            <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.formContainer}>
              <Text style={styles.sectionHeader}>👤 Personal Info</Text>
              <View style={styles.nameRow}>
                <View style={styles.halfInputContainer}>
                  <FormikInput name="firstName" label="First Name" placeholder="John" icon="person" />
                </View>
                <View style={styles.halfInputContainer}>
                  <FormikInput name="lastName" label="Last Name" placeholder="Doe" icon="person" />
                </View>
              </View>
              <FormikInput name="email" label="Email Address" placeholder="your@email.com" icon="email" />
              <FormikInput name="phone" label="Phone Number" placeholder="05XXXXXXXX" icon="phone" />
              <FormikInput name="vatNumber" label="VAT Number" placeholder="12345678" icon="badge" />

              <Text style={styles.sectionHeader}>🏠 Address Info</Text>
              <FormikInput name="street" label="Street Address" placeholder="123 Main Street" icon="home" />
              <FormikInput name="state" label="State / Region" placeholder="Riyadh" icon="map" />

              <Text style={styles.sectionHeader}>🔐 Security</Text>
              <FormikInput name="password" label="Password" placeholder="••••••••" icon="lock" type="password" />
              <FormikInput name="confirmPassword" label="Confirm Password" placeholder="••••••••" icon="lock" type="password" />

              <TouchableOpacity onPress={handleSubmit} activeOpacity={0.9} style={styles.signupButton}>
                <LinearGradient
                  colors={["#029687", "#02b8a8"]}
                  style={styles.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f5f3",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2c3e50",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: "#029687",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "600",
    color: "#029687",
    marginTop: 15,
    marginBottom: 10,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInputContainer: {
    width: "48%",
  },
  signupButton: {
    marginTop: 20,
    borderRadius: 15,
    overflow: "hidden",
    height: 55,
  },
  gradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  loginContainer: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  loginLink: {
    color: "#029687",
    fontWeight: "bold",
    fontSize: 14,
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
    backgroundColor: "rgba(2, 150, 135, 0.1)",
  },
  circleTop: {
    width: width * 0.9,
    height: width * 0.9,
    top: -width * 0.5,
    right: -width * 0.4,
  },
  circleBottom: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.7,
    left: -width * 0.5,
    backgroundColor: "rgba(243, 181, 69, 0.1)",
  },
});

export default SignupScreen;
