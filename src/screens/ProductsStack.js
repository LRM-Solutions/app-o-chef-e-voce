import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProductsScreen from "./ProductsScreen";
import SingleProductScreen from "./SingleProductScreen";
import CustomHeader from "../components/CustomHeader";

const Stack = createStackNavigator();

const ProductsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ProductsList"
        component={ProductsScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="SingleProduct"
        component={SingleProductScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader />,
        }}
      />
    </Stack.Navigator>
  );
};

export default ProductsStack;
