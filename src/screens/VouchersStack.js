import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import VouchersScreen from "./VouchersScreen";
import SingleVoucherScreen from "./SingleVoucherScreen";
import CustomHeader from "../components/CustomHeader";

const Stack = createStackNavigator();

const VouchersStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="VouchersList"
        component={VouchersScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="SingleVoucher"
        component={SingleVoucherScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader />,
        }}
      />
    </Stack.Navigator>
  );
};

export default VouchersStack;
