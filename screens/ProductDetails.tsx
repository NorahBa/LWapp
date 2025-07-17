import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

const ProductDetails = ({ route }) => {
  const { product } = route.params;
  const navigation = useNavigation();
  const { addToCart } = useCart();
console.log("Product Details:", product);
  const formatCurrency = (amount) => {
    return `${amount?.toLocaleString('en-SA')} SAR`;
  };

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
        <Text style={styles.headerTitle}>Product Details</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image_url }} 
            style={styles.image} 
            resizeMode="contain"
          />
        </View>

        {/* Product Info */}
        <View style={styles.detailsCard}>
          <Text style={styles.title}>{product.name}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>{formatCurrency(product.originalPrice)}</Text>
            )}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url
            })}
          >
            <LinearGradient
              colors={['#029687', '#02b8a8']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="cart" size={20} color="#fff" />
              <Text style={styles.buttonText}>Add to Cart</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.Description}>
            {product.Description || 'No description available for this product.'}
          </Text>

          {/* Features */}
          {product.features && (
            <>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.featuresContainer}>
                {product.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#029687" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
  scrollContainer: {
    paddingBottom: 30,
  },
  imageContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 16,
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(2, 150, 135, 0.1)',
  },
  image: {
    width: '100%',
    height: 250,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(2, 150, 135, 0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    lineHeight: 28,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#029687',
    marginRight: 10,
    textShadowColor: 'rgba(2, 150, 135, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  originalPrice: {
    fontSize: 18,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 25,
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(2, 150, 135, 0.2)',
    paddingBottom: 5,
  },
  Description: {
    fontSize: 15,
    color: '#34495e',
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresContainer: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 15,
    color: '#34495e',
    marginLeft: 8,
  },
});

export default ProductDetails;