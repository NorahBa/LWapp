import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { useCart } from "../context/CartContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "PastInvoices">;

interface InvoiceItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Invoice {
  id: string;
  date: string;
  total: number;
  items: InvoiceItem[];
  status: "completed" | "pending" | "cancelled";
}

const PastInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const auth = getAuth();
  const navigation = useNavigation<NavigationProp>();
  const { items } = useCart();

  const fetchInvoices = async () => {
    try {
      if (!auth.currentUser?.uid) throw new Error("User not authenticated");

      const q = query(
        collection(db, "shopping_carts"),
        where("userId", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedInvoices: Invoice[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.createdAt || !data.items || data.total === undefined) return;

        fetchedInvoices.push({
          id: doc.id,
          date: data.createdAt.toDate().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          total: parseFloat(data.total.toFixed(2)),
          items: data.items.map((item: any) => ({
            name: item.name || "Unknown",
            price: parseFloat(item.price?.toFixed(2)) || 0,
            quantity: item.quantity || 1,
          })),
          status: data.status || "completed",
        });
      });

      setInvoices(fetchedInvoices.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }));
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchInvoices();
      else {
        setLoading(false);
        setInvoices([]);
      }
    });

    return unsubscribe;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
  };

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <TouchableOpacity
      style={styles.invoiceCard}
      onPress={() => navigation.navigate("InvoiceDetails", { invoice: item })}
    >
      <View style={styles.invoiceHeader}>
        <Text style={styles.invoiceDate}>{item.date}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "completed" && styles.statusCompleted,
            item.status === "pending" && styles.statusPending,
            item.status === "cancelled" && styles.statusCancelled,
          ]}
        >
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.invoiceBody}>
        <View style={styles.itemsPreview}>
          {item.items.slice(0, 2).map((product, index) => (
            <View key={`${item.id}-${index}`} style={styles.previewItem}>
              <Text style={styles.previewText} numberOfLines={1}>
                {product.quantity}x {product.name}
              </Text>
              <Text style={styles.previewPrice}>
                {(product.price * product.quantity).toFixed(2)} SAR
              </Text>
            </View>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{item.items.length - 2} more item(s)
            </Text>
          )}
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>{item.total.toFixed(2)} SAR</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const BottomNavigationBar = () => (
    <View style={styles.bottomNavContainer}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate("Shopping")}
      >
        <Ionicons name="home" size={24} color="#029687" />
        <Text style={styles.navButtonText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate("CartScreen")}
      >
        <View style={{ position: "relative" }}>
          <Ionicons name="cart" size={24} color="#029687" />
          {items.length > 0 && (
            <View style={styles.bottomNavBadge}>
              <Text style={styles.bottomNavBadgeText}>{items.length}</Text>
            </View>
          )}
        </View>
        <Text style={styles.navButtonText}>Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate("PastInvoices")}
      >
        <MaterialIcons name="receipt" size={24} color="#029687" />
        <Text style={[styles.navButtonText, styles.activeNavText]}>
          Invoices
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate("Profile")}
      >
        <Ionicons name="person" size={24} color="#029687" />
        <Text style={styles.navButtonText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#029687", "#02b8a8"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>My Invoices</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#029687" />
          <Text style={styles.loadingText}>Loading your invoices...</Text>
        </View>
      ) : invoices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../assets/LazyWait-logo.webp")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>No invoices found</Text>
          <Text style={styles.emptySubText}>
            Your purchase history will appear here
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchInvoices}
          >
            <Ionicons name="refresh" size={20} color="#029687" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderInvoiceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.invoiceList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#029687"]}
              tintColor="#029687"
            />
          }
        />
      )}

      <BottomNavigationBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8f7",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#029687",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#029687",
  },
  refreshButtonText: {
    color: "#029687",
    fontWeight: "600",
  },
  invoiceList: {
    padding: 15,
    paddingBottom: 80,
  },
  invoiceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    borderColor: "rgba(2, 150, 135, 0.1)",
    borderWidth: 1,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f8f7",
    paddingBottom: 10,
  },
  invoiceDate: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: "rgba(46, 204, 113, 0.2)",
  },
  statusPending: {
    backgroundColor: "rgba(241, 196, 15, 0.2)",
  },
  statusCancelled: {
    backgroundColor: "rgba(231, 76, 60, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  invoiceBody: {
    marginTop: 5,
  },
  itemsPreview: {
    marginBottom: 10,
  },
  previewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  previewText: {
    fontSize: 14,
    color: "#2c3e50",
    flex: 1,
    marginRight: 10,
  },
  previewPrice: {
    fontSize: 14,
    color: "#029687",
    fontWeight: "600",
    minWidth: 80,
    textAlign: "right",
  },
  moreItems: {
    fontSize: 12,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f8f7",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#029687",
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 10,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    fontSize: 12,
    color: "#029687",
    marginTop: 5,
  },
  activeNavText: {
    fontWeight: "bold",
    color: "#02b8a8",
  },
  bottomNavBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#F3B545",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomNavBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default PastInvoices;
