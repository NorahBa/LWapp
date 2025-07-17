import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCart } from "../context/CartContext";
import { useNavigation } from "@react-navigation/native";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Product } from "../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Shopping">;

const auth = getAuth();

const offers = [
  {
    id: '1',
    title: 'Summer Sale',
    description: 'Up to 30% off on all devices',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    gradient: ['rgba(2, 184, 168, 0.6)', 'rgba(2, 150, 135, 0.7)', 'rgba(1, 107, 96, 0.8)'],
    icon: 'sunny-outline',
    buttonText: 'Shop Now'
  },
  {
    id: '2',
    title: 'New Arrivals',
    description: 'Check out our latest products',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    gradient: ['rgba(243, 181, 69, 0.6)', 'rgba(255, 149, 0, 0.7)', 'rgba(232, 131, 0, 0.8)'],
    icon: 'sparkles-outline',
    buttonText: 'Explore'
  },
  {
    id: '3',
    title: 'Premium Membership',
    description: 'Get exclusive benefits with our premium plan',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    gradient: ['rgba(2, 150, 135, 0.6)', 'rgba(1, 107, 96, 0.7)', 'rgba(1, 77, 68, 0.8)'],
    icon: 'diamond-outline',
    buttonText: 'Join Now'
  },
  {
    id: '4',
    title: 'Limited Time Offer',
    description: 'Special discounts this week only',
    image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    gradient: ['rgba(243, 181, 69, 0.6)', 'rgba(232, 131, 0, 0.7)', 'rgba(217, 110, 0, 0.8)'],
    icon: 'alarm-outline',
    buttonText: 'Grab Deal'
  },
];

const ShoppingScreen = () => {
  const { addToCart, items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<"license" | "device">("license");
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useLayoutEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    navigation.setOptions({
      header: () => (
        <LinearGradient
          colors={['#029687', '#02b8a8']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Home</Text>
          </View>
          <View style={styles.headerIcons}>
            {user ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.email?.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => navigation.navigate("Login")}
              >
                <Ionicons name="log-in-outline" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      ),
    });

    return () => unsubscribe();
  }, [navigation, items, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
          type: "device"
        }));
        
        const plansSnapshot = await getDocs(collection(db, "Subscription_plans"));
        const plansData = plansSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            type: "license",
            price: data.price,
            image_url: data.image_url,
            Description: data.Description
          } as Product;
        });
        
        setProducts([...productsData, ...plansData]);
        setSubscriptionPlans(plansData);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const typeMatch = activeType === "license" ? p.type === "license" : p.type === "device";
    const searchMatch = searchQuery === "" || 
      (p.name && p.name.includes(searchQuery)) || 
      (p.Description && p.Description.includes(searchQuery));
    return typeMatch && searchMatch;
  });

  const SearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#029687" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
      />
      {searchQuery !== "" && (
        <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#888" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ProductDetails", { product: item })}
      activeOpacity={0.8}
      style={styles.cardContainer}
    >
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.name} numberOfLines={3} ellipsizeMode="tail">
            {item.name}
          </Text>
          <View style={styles.rowBetween}>
            <Text style={styles.price}>
              {item.price?.toLocaleString?.() || 0} SAR
            </Text>
            <TouchableOpacity
              style={styles.cartIcon}
              onPress={(e) => {
                e.stopPropagation();
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  image_url: item.image_url,
                  type: item.type,
                  Description: item.Description
                });
              }}
            >
              <Ionicons name="cart" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FilterBar = () => (
    <View style={styles.filterBar}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeType === "license" && styles.activeFilter,
          ]}
          onPress={() => setActiveType("license")}
        >
          <Ionicons 
            name="key" 
            size={16} 
            color={activeType === "license" ? "#fff" : "#029687"} 
            style={styles.filterIcon}
          />
          <Text
            style={
              activeType === "license" ? styles.activeText : styles.inactiveText
            }
          >
            Licenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeType === "device" && styles.activeFilter,
          ]}
          onPress={() => setActiveType("device")}
        >
          <Ionicons 
            name="phone-portrait" 
            size={16} 
            color={activeType === "device" ? "#fff" : "#029687"} 
            style={styles.filterIcon}
          />
          <Text
            style={
              activeType === "device" ? styles.activeText : styles.inactiveText
            }
          >
            Devices
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const OfferItem = ({ offer }: { offer: typeof offers[0] }) => (
    <View style={styles.offerItemContainer}>
      <Image 
        source={{ uri: offer.image }} 
        style={styles.offerImage}
        blurRadius={1}
      />
      <LinearGradient
        colors={offer.gradient}
        style={styles.offerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0.1, 0.6, 0.9]}
      >
        <View style={styles.offerContent}>
          <View style={styles.offerIconContainer}>
            <Ionicons name={offer.icon} size={32} color="white" />
          </View>
          <View style={styles.offerTextContainer}>
            <Text style={styles.offerTitle}>{offer.title}</Text>
            <Text style={styles.offerDescription}>{offer.description}</Text>
            <TouchableOpacity style={styles.offerButton}>
              <Text style={styles.offerButtonText}>{offer.buttonText}</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const OfferSection = () => (
    <View style={styles.offerContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={screenWidth - 30}
        snapToAlignment="center"
        contentContainerStyle={styles.offerScrollContent}
      >
        {offers.map((offer) => (
          <TouchableOpacity 
            key={offer.id} 
            activeOpacity={0.9}
            onPress={() => console.log('Offer pressed', offer.id)}
            style={styles.offerTouchable}
          >
            <OfferItem offer={offer} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const BottomNavigationBar = () => (
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNavContent}>
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
        
        {user ? (
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate("PastInvoices")}
          >
            <MaterialIcons name="receipt" size={24} color="#029687" />
            <Text style={styles.navButtonText}>Invoices</Text>
          </TouchableOpacity>
        ) : null}
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person" size={24} color="#029687" />
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scrollView}>
        <SearchBar />
        <OfferSection />
        
        <View style={styles.mainContent}>
          <FilterBar />
          
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderProduct}
            scrollEnabled={false}
            contentContainerStyle={styles.productsContainer}
            ListHeaderComponent={
              <Text style={styles.productsTitle}>
                {activeType === "license" ? "Software Licenses" : "Devices"}
              </Text>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-off" size={50} color="#029687" />
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
      
      <BottomNavigationBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f0f8f7",
  },
  scrollView: {
    flex: 1,
    marginBottom: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(2, 150, 135, 0.2)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  clearButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  offerContainer: {
    height: 220,
    backgroundColor: '#fff',
    paddingVertical: 15,
  },
  offerScrollContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  offerTouchable: {
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  offerItemContainer: {
    width: screenWidth - 30,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  offerGradient: {
    width: '100%',
    height: '100%',
    padding: 20,
    justifyContent: 'center',
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  offerTextContainer: {
    flex: 1,
  },
  offerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  offerDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  offerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  offerButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 5,
    fontSize: 14,
  },
  mainContent: {
    flex: 1,
    paddingBottom: 20,
  },
  filterBar: {
    backgroundColor: '#f0f8f7',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(2, 150, 135, 0.1)',
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 15,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: "#e6f5f3",
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    minWidth: 110,
    justifyContent: 'center',
  },
  filterIcon: {
    marginRight: 6,
    width: 16,
    height: 18,
  },
  activeFilter: {
    backgroundColor: "#029687",
    shadowColor: "#029687",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderColor: '#029687',
  },
  activeText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  inactiveText: {
    color: "#3F4346",
    fontSize: 14,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: "#2c3e50",
    marginLeft: 20,
    marginBottom: 15,
    marginTop: 10,
    textShadowColor: "rgba(44, 62, 80, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardContainer: {
    width: '50%',
    padding: 5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#029687",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(2, 150, 135, 0.1)",
    height: 250,
  },
  imageContainer: {
    height: 130,
    backgroundColor: "#f8fcfc",
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 12,
    height: 120,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2c3e50",
    lineHeight: 20,
    flex: 1,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    color: "#029687",
    fontWeight: "800",
    textShadowColor: "rgba(2, 150, 135, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cartIcon: {
    backgroundColor: "#F3B545",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#F3B545",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3B545",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    color: "#3F4346",
    fontWeight: "bold",
  },
  productsContainer: {
    paddingHorizontal: 5,
    paddingBottom: 20,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 35,
    height: 70,
    width: '100%',
    paddingHorizontal: 10,
    elevation: 10,
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(2, 150, 135, 0.1)',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
    width: 70,
  },
  navButtonText: {
    fontSize: 12,
    color: '#029687',
    marginTop: 5,
    fontWeight: '600',
  },
  bottomNavBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F3B545',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  bottomNavBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ShoppingScreen;