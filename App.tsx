import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { CartProvider } from "./context/CartContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types/RootStackParamList";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./screens/Login";
import Signup from "./screens/Signup"
import ShoppingScreen from "./screens/ShoppingScreen";
import CartScreen from "./screens/CartScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import ProductDetails from "./screens/ProductDetails";
import OrderConfirmation from "./screens/OrderConfirmation";
import Profile from "./screens/Profile";
import PastInvoices from "./screens/PastInvoices";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Shopping"
            component={ShoppingScreen}
            options={{ headerTitle: "Home" }}
          />
          <Stack.Screen //first modified screen "Login" 
            name="Login"
            component={Login}
            options={{ headerShown: false }}

          />
          <Stack.Screen  
            name="Signup"
            component={Signup}
            options={{ headerShown: false }}

          />
          
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OrderConfirmation"
            component={OrderConfirmation}
            options={{headerShown: false }}
          />
          <Stack.Screen
            name="CartScreen"
            component={CartScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProductDetails"
            component={ProductDetails}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PastInvoices"
            component={PastInvoices} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
