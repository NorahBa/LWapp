import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Product = {
  quantity: number;
  id: string;
  name: string;
  price: number;
  image_url: string;
};

type CartContextType = {
  items: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
};

type ModalContent = {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
};

// REPLACE THESE WITH YOUR ACTUAL PRODUCT IDs
const LICENSE_PLUS_ID = "8DHhTNwcwIWFkvekPiIW";
const LICENSE_PRO_ID = "TnwrjM7YOD0uj6614VRx";
const ADDITIONAL_LICENSE_ID = "1bSFRpiLedOKXPYjAmgp";

export const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  total: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [modal, setModal] = useState<ModalContent>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showModal = (title: string, message: string, type: ModalContent['type'] = 'info') => {
    setModal({
      visible: true,
      title,
      message,
      type
    });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, visible: false }));
  };

  // Load cart from storage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const json = await AsyncStorage.getItem("cart");
        if (json) setItems(JSON.parse(json));
      } catch (error) {
        console.error("Failed to load cart", error);
      }
    };
    loadCart();
  }, []);

  // Save cart to storage when items change
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem("cart", JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save cart", error);
      }
    };
    saveCart();
  }, [items]);

  const addToCart = (product: Product) => {
    // Check for existing license conflicts
    const hasPlus = items.some(item => item.id === LICENSE_PLUS_ID);
    const hasPro = items.some(item => item.id === LICENSE_PRO_ID);
    
    // Handle license conflicts
    if (product.id === LICENSE_PLUS_ID && hasPro) {
      showModal(
        "License Conflict", 
        "You can't add POS Plus license when POS Pro is already in your cart",
        'error'
      );
      return;
    }
    
    if (product.id === LICENSE_PRO_ID && hasPlus) {
      showModal(
        "License Conflict", 
        "You can't add POS Pro license when POS Plus is already in your cart",
        'error'
      );
      return;
    }

    // Handle Additional POS license dependency
    if (product.id === ADDITIONAL_LICENSE_ID) {
      const hasMainLicense = hasPlus || hasPro;
      
      if (!hasMainLicense) {
        showModal(
          "Missing Requirement", 
          "You need to have either POS Plus or POS Pro license before adding Additional POS licenses",
          'error'
        );
        return;
      }
    }

    // Check if product already exists in cart
    const existingItem = items.find(item => item.id === product.id);
    
    if (existingItem) {
      // Update quantity if item exists
      setItems(prev => prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
      showModal("Updated", `${product.name} quantity increased`, 'success');
    } else {
      // Add new item to cart
      setItems(prev => [...prev, { ...product, quantity: 1 }]);
      showModal("Added", `${product.name} added to cart`, 'success');
    }
  };

  const removeFromCart = (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    if (!itemToRemove) return;
    
    if (itemToRemove.quantity > 1) {
      // Decrease quantity
      setItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        )
      );
      showModal("Removed", `One ${itemToRemove.name} removed`, 'info');
    } else {
      // Remove item completely
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
      showModal("Removed", `${itemToRemove.name} removed from cart`, 'info');
      
      // Check if we need to remove additional licenses
      if (id === LICENSE_PLUS_ID || id === LICENSE_PRO_ID) {
        const hasMainLicense = newItems.some(item => 
          item.id === LICENSE_PLUS_ID || item.id === LICENSE_PRO_ID
        );
        
        if (!hasMainLicense) {
          // Remove all additional licenses if no main license exists
          const updatedItems = newItems.filter(item => item.id !== ADDITIONAL_LICENSE_ID);
          
          if (updatedItems.length !== newItems.length) {
            setItems(updatedItems);
            showModal(
              "Removed Additional Licenses", 
              "All Additional POS licenses were removed since no main license exists",
              'info'
            );
          }
        }
      }
    }
  };

  const clearCart = () => {
    setItems([]);
    showModal("Cleared", "Cart is now empty", 'success');
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, total }}
    >
      {children}
      
      {/* Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modal.visible}
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            modal.type === 'error' && styles.errorModal,
            modal.type === 'success' && styles.successModal,
            modal.type === 'info' && styles.infoModal
          ]}>
            <Text style={styles.modalTitle}>{modal.title}</Text>
            <Text style={styles.modalMessage}>{modal.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={hideModal}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </CartContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successModal: {
    borderTopWidth: 5,
    borderTopColor: '#4CAF50',
  },
  errorModal: {
    borderTopWidth: 5,
    borderTopColor: '#F44336',
  },
  infoModal: {
    borderTopWidth: 5,
    borderTopColor: '#2196F3',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  modalButton: {
    backgroundColor: '#029687',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CartProvider;