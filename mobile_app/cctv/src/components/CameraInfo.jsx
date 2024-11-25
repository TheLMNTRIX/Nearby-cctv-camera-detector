import { Text } from 'react-native-paper';
import { View } from "react-native";
import React from "react";

export default function CameraInfo({ title, value }) {
    return (
        <View
            style={{
                paddingTop: 10,
            }}
        >
            <Text
                variant='labelLarge'
                style={{
                    color: "#A9A9A9",
                    fontWeight: "bold"
                }}
            >{title}</Text>
            <Text
                variant="titleLarge"
            >{value}</Text>
        </View>
    );
}

