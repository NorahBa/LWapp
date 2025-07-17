import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { LinearGradient } from "expo-linear-gradient";

type OrderConfirmationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "OrderConfirmation"
>;

const OrderConfirmationScreen = () => {
  const navigation = useNavigation<OrderConfirmationScreenNavigationProp>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#029687', '#02b8a8']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate("Shopping")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Confirmed</Text>
      </LinearGradient>

      {/* Confirmation Content */}
      <View style={styles.content}>
        <View style={styles.confirmationBox}>
          <Ionicons name="checkmark-circle" size={80} color="#02b8a8" />
          <Text style={styles.confirmationTitle}>Thank You!</Text>
          <Text style={styles.confirmationText}>
            Your order has been placed successfully.
          </Text>
        </View>
      </View>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation.navigate("Shopping")}
        >
          <LinearGradient
            colors={['#029687', '#02b8a8']}
            style={styles.continueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueText}>Back to Home</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fcfc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationBox: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(2, 150, 135, 0.1)',
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  confirmationText: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    borderTopWidth: 1,
    borderColor: 'rgba(2, 150, 135, 0.1)',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  continueGradient: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OrderConfirmationScreen;