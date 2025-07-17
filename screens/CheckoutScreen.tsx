import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../context/CartContext";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged } from "firebase/auth";

type CheckoutScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Checkout"
>;

const CheckoutScreen = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { items: cartItems, total, clearCart } = useContext(CartContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "validation">("success");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setEmail(user.email || "");
        
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setName(userData.firstName || "");
            setPhone(userData.phone || "");
            setAddress(userData.address.state || "");
            
          }
          
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const showModal = (title: string, message: string, type: "success" | "error" | "validation") => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      showModal("Sign Up Required", "Please create an account to proceed with checkout", "validation");
      return;
    }

    if (!name || !email || !phone || !address) {
      showModal("Missing Information", "Please fill in all fields", "validation");
      return;
    }

    try {
      await addDoc(collection(db, "shopping_carts"), {
        name,
        email,
        phone,
        address,
        items: cartItems,
        total,
        status: "pending",
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid
      });

      clearCart();
      showModal("Order Confirmed", "Your order has been placed successfully!", "success");
      
      setTimeout(() => {
        setModalVisible(false);
        navigation.navigate("OrderConfirmation");
      }, 1500);
    } catch (error) {
      console.error("Checkout Error:", error);
      showModal("Order Failed", "There was an error processing your order", "error");
    }
  };

  const handleSignUp = () => {
    navigation.navigate("Signup");
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-SA')} ﷼`;
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#029687" />
      </View>
    );
  }

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
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {!isLoggedIn ? (
          <View style={styles.guestContainer}>
            <View style={styles.signupCard}>
              <Ionicons name="person-circle-outline" size={60} color="#029687" style={styles.signupIcon} />
              <Text style={styles.guestTitle}>Guest Checkout</Text>
              <Text style={styles.guestText}>
                Create an account to save your information and track your orders
              </Text>
              <TouchableOpacity 
                style={styles.signupButton}
                onPress={handleSignUp}
              >
                <Text style={styles.signupButtonText}>Sign Up for Free</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.signupButtonIcon} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.guestContinueButton}
                onPress={() => showModal("Sign Up Recommended", "For better experience, we recommend creating an account", "validation")}
              >
                <Text style={styles.guestContinueText}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Shipping Information</Text>
            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="#95a5a6"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, !isLoggedIn ? null : styles.disabledInput]}
                  placeholder="your@email.com"
                  placeholderTextColor="#95a5a6"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!isLoggedIn}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+966 50 123 4567"
                  placeholderTextColor="#95a5a6"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Shipping Address</Text>
                <TextInput
                  style={[styles.input, styles.addressInput]}
                  placeholder="123 Main Street, City, Country"
                  placeholderTextColor="#95a5a6"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items:</Text>
                <Text style={styles.summaryValue}>{cartItems.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                <Text style={styles.summaryValue}>Free</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer - Only show if logged in */}
      {isLoggedIn && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.footerTotalLabel}>Total:</Text>
            <Text style={styles.footerTotalAmount}>{formatCurrency(total)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <LinearGradient
              colors={['#029687', '#02b8a8']}
              style={styles.checkoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.checkoutText}>Complete Order</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => modalType !== "success" && setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <View style={styles.modalContainer}>
          <View style={[
            styles.modalContent,
            modalType === "success" && styles.successModal,
            modalType === "error" && styles.errorModal,
            modalType === "validation" && styles.validationModal
          ]}>
            <Ionicons
              name={
                modalType === "success" ? "checkmark-circle" :
                modalType === "error" ? "close-circle" :
                "warning"
              }
              size={48}
              color="#fff"
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            
            {modalType === "success" ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginTop: 15 }} />
            ) : (
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  modalType === "error" && styles.errorModalButton,
                  modalType === "validation" && styles.validationModalButton
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>
                  {modalType === "validation" ? "Sign Up Now" : "OK"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fcfc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 100,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  signupCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  signupIcon: {
    marginBottom: 15,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
  },
  guestText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  signupButton: {
    flexDirection: 'row',
    backgroundColor: '#029687',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 10,
  },
  signupButtonIcon: {
    marginLeft: 5,
  },
  guestContinueButton: {
    paddingVertical: 10,
  },
  guestContinueText: {
    color: '#029687',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(2, 150, 135, 0.1)',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#f8fcfc',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: 'rgba(2, 150, 135, 0.2)',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#95a5a6',
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(2, 150, 135, 0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(2, 150, 135, 0.1)',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#029687',
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  footerTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  footerTotalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#029687',
  },
  checkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  checkoutGradient: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successModal: {
    backgroundColor: '#27ae60',
  },
  errorModal: {
    backgroundColor: '#e74c3c',
  },
  validationModal: {
    backgroundColor: '#F3B545',
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    backgroundColor: '#fff',
    width: '100%',
    alignItems: 'center',
  },
  errorModalButton: {
    backgroundColor: '#fff',
  },
  validationModalButton: {
    backgroundColor: '#fff',
  },
  modalButtonText: {
    color: '#2c3e50',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CheckoutScreen;