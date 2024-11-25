import { Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import {View, StyleSheet, ActivityIndicator} from "react-native";
import React, {useEffect} from 'react';
import { Avatar } from 'react-native-paper';
import { useState } from "react";
import UserInfo from "../components/UserInfo";
import * as SecureStore from 'expo-secure-store';

export default function Profile() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [phone, setPhone] = useState(null);
  const [id, setId] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(loading) {
      setAllFields()
        .then(() => setLoading(false))
    }
  }, []);

  const setAllFields = async () => {
    const tempName = await SecureStore.getItemAsync('userOfficerName');
    const tempId = await SecureStore.getItemAsync('userOfficerId');
    const tempEmail = await SecureStore.getItemAsync('userOfficerEmail');
    const tempPhone = await SecureStore.getItemAsync('userOfficerPhone');
    const tempRank = await SecureStore.getItemAsync('userOfficerRank');
    setName(tempName);
    setId(tempId);
    setEmail(tempEmail);
    setPhone(tempPhone);
    setRank(tempRank);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      { loading ?
        <ActivityIndicator size="large" color={theme.colors.primary} /> :
        <>
          <View
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <View
              style={{
                paddingTop: 20,
              }}
            >
              <Avatar.Icon size={64} icon="account" style={{backgroundColor: "#545454"}} color="white" />
            </View>
            <Text
              variant="headlineMedium"
              style={{
                paddingTop: 20,
              }}
            >
              {name}
            </Text>
          </View>
          <View
            style={{
              paddingTop: 10,
              paddingStart: 18,
            }}
          >
            <UserInfo title={"OFFICER ID"} info={id} />
            <UserInfo title={"EMAIL"} info={email} />
            <UserInfo title={"PHONE"} info={phone} />
            <UserInfo title={"RANK"} info={rank} />
          </View>
        </>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})
