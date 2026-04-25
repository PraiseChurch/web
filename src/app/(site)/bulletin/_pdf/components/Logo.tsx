import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../styles";

export const Logo: React.FC = () => (
  <View style={styles.logoPlaceholder}>
    <Text style={styles.logoPlaceholderText}>[Church logo placeholder]</Text>
  </View>
);
