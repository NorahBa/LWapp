import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { CartContext } from "../context/CartContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { LinearGradient } from "expo-linear-gradient";

type CartScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CartScreen"
>;

const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { items: cartItems, removeFromCart } = useContext(CartContext);
  const scrollY = new Animated.Value(0);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const renderItem = ({ item }: any) => (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [0, 0, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image_url }} style={styles.image} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.price}>
          {typeof item.price === "number" && !isNaN(item.price)
            ? item.price
            : 0}{" "}
          SAR
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="trash-outline" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#029687", "#02b8a8"]}
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
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
        </View>
      </LinearGradient>

      {/* Main content with ScrollView */}
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {cartItems.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIllustration}>
                <Ionicons name="cart-outline" size={80} color="#bdc3c7" />
                <View style={styles.emptyCircle}></View>
              </View>
              <Text style={styles.emptyTitle}>Your cart feels lonely</Text>
              <Text style={styles.emptySubtitle}>
                Let's fill it with amazing products
              </Text>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.shopButtonText}>Browse Products</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <Animated.FlatList
              data={cartItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
            />
          )}
        </ScrollView>
      </View>

      {/* Fixed Footer */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Total Items: {cartItems.length}
            </Text>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>
                {total.toLocaleString()} SAR
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate("Checkout")}
          >
            <LinearGradient
              colors={["#029687", "#02b8a8"]}
              style={styles.checkoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fcfc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#029687",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgb(160, 29, 29)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cartBadge: {
    position: "absolute",
    right: 20,
    top: 50,
    backgroundColor: "#F3B545",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  cartBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 100,
  },
  emptyIllustration: {
    position: "relative",
    marginBottom: 30,
  },
  emptyCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(2, 150, 135, 0.1)",
    top: -20,
    left: -20,
    zIndex: -1,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 30,
    textAlign: "center",
  },
  shopButton: {
    flexDirection: "row",
    backgroundColor: "#029687",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#029687",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 150,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#029687",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(2, 150, 135, 0.1)",
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "rgba(2, 150, 135, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  infoContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#029687",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    borderTopWidth: 1,
    borderColor: "rgba(2, 150, 135, 0.1)",
  },
  summaryContainer: {
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 18,
    color: "#2c3e50",
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#029687",
  },
  checkoutButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#029687",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  checkoutGradient: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 10,
  },
});

export default CartScreen;