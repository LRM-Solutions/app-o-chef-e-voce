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
        headerShown: true,
        header: () => <CustomHeader />,
      }}
    >
      <Stack.Screen name="ProductsList" component={ProductsScreen} />
      <Stack.Screen name="SingleProduct" component={SingleProductScreen} />
    </Stack.Navigator>
  );
};

export default ProductsStack;
