import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { DynamicText, DynamicView } from "@/components";

const Login = () => {
  return (
    <DynamicView flex={1} variant="centerItems">
      <DynamicView>
        <FontAwesome name="cart-plus" size={48} color="green" />
        <DynamicText mt="S">Login to your account</DynamicText>
      </DynamicView>
    </DynamicView>
  );
};

export default Login;
