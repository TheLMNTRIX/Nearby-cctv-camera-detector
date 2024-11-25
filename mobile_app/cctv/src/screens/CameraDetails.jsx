import {View, StyleSheet, Linking, Alert} from 'react-native';
import {Button, Card, Modal, Portal, RadioButton, Text, TextInput, useTheme} from 'react-native-paper';
import {useNavigation, useRoute} from "@react-navigation/native";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import React, {useState} from "react";
import axios from "axios";
import * as SecureStore from 'expo-secure-store'

export default function CameraDetails() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [otherReportText, setOtherReportText] = useState("");

  const mapsLink = "https://www.google.com/maps/search/?api=1&query="+route.params.data.coordinate.latitude+"%2C"+route.params.data.coordinate.longitude;

  const showReportModal = () => setIsReportModalVisible(true);
  const hideReportModal = () => setIsReportModalVisible(false);

  const submitReport = async () => {
    try {
      const reason = () => {
        return (reportReason === 'Other' ? otherReportText : reportReason);
      };
      const response = await axios.post('http://10.70.13.203:8080/report', {
        "camera_id": route.params.data.cameraId,
        "location": route.params.data.title,
        "description": reason(),
        "reported_by": await SecureStore.getItemAsync('userOfficerName')
      });
      console.log('Report submitted successfully:', response.data);
      Alert.alert(
        "Report submitted",
        "Report submitted successfully",
        [{
          text: 'Ok',
          onPress: () => {
            hideReportModal()
            navigation.goBack()
          }
        }]
      )
    } catch (error) {
      console.error('Error submitting report details:', error);
      Alert.alert(
        "Error",
        "Could not submit report details:\n" + error.message,
        [{
          text: 'Ok'
        }]
      )
    }
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: route.params.data.coordinate.latitude,
            longitude: route.params.data.coordinate.longitude,
            latitudeDelta: 0.0130,
            longitudeDelta: 0.0060,
          }}
          style={{
            flex: 0.6,
            alignSelf: 'stretch',
            borderRadius: 15,
          }}
          scrollEnabled={false}
          zoomControl={false}
          pitchEnabled={false}
          zoomTapEnabled={false}
          rotateEnabled={false}
          toolbarEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: route.params.data.coordinate.latitude,
              longitude: route.params.data.coordinate.longitude,
            }}
            pinColor="red"
          />
        </MapView>
        <Card style={{flex: 0.4, alignSelf: 'stretch'}} mode="elevated">
          <Card.Content>
            <Text variant="headlineMedium">{route.params.data.title}</Text>
            <Text variant="bodyMedium">{route.params.data.description}</Text>
            <Text variant="bodyMedium">Owner type: {route.params.data.privateGovt}</Text>
            <Text variant="bodyMedium">Contact No.: {route.params.data.contactNo}</Text>
            <Text variant="bodyMedium">Backup: {route.params.data.backup}</Text>
            <Text variant="bodyMedium">Coverage: {route.params.data.coverage}</Text>
            <Text variant="bodyMedium">Connected to Network: {route.params.data.connectedNetwork}</Text>
            <Text variant="bodyMedium">Arial Distance to camera: {Math.round((route.params.data.distance + Number.EPSILON) * 100) / 100}km</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={showReportModal}>Report</Button>
            <Button onPress={() => {Linking.openURL(mapsLink)}}>Open in Maps</Button>
          </Card.Actions>
        </Card>
      <Portal>
        <Modal visible={isReportModalVisible} onDismiss={hideReportModal} contentContainerStyle={[styles.modalContainer, {backgroundColor: theme.colors.background}]}>
          <Text variant="headlineMedium" style={styles.modalTitle}>Report Camera</Text>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>What's wrong?</Text>
            <RadioButton.Group onValueChange={value => setReportReason(value)} value={reportReason}>
              <RadioButton.Item label="Camera Does Not Exist" value="Camera Does Not Exist" />
              <RadioButton.Item label="Camera Does Not Work" value="Camera Does Not Work" />
              <RadioButton.Item label="Camera at Different Location" value="Camera at Different Location" />
              <RadioButton.Item label="Owner details are Wrong" value="Owner Details are Wrong" />
              <RadioButton.Item label="Other" value="Other" />
            </RadioButton.Group>
            <TextInput
              style={{margin: 10}}
              mode='outlined'
              placeholder="Describe the issue"
              value={otherReportText}
              onChangeText={value => setOtherReportText(value)}
              disabled={!(reportReason === 'Other')}
            />
          </View>
          <Button mode='contained' onPress={submitReport} style={styles.applyButton}>
            Submit Report
          </Button>
        </Modal>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  applyButton: {
    marginTop: 20,
  },
})
