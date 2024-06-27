import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";

interface BadgeIconProps {
  name: string;
  size: number;
  color: string;
  badgeCount: number;
}

const BadgeIcon: React.FC<BadgeIconProps> = ({
  name,
  size,
  color,
  badgeCount,
}) => {
  return (
    <View style={styles.iconContainer}>
      <Feather name="activity" size={size} color={color} />
      {badgeCount > 0 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 24 + 10, // Adjusted for example size
    height: 24 + 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 7,
    width: 14,
    height: 14,
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
    position: "absolute",
    lineHeight: 8,
    alignSelf: "center",
    top: 4
  },
});

export default BadgeIcon;
