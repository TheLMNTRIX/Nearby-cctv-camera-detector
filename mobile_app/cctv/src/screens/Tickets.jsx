import React, {useState, useEffect, useRef} from 'react';
import { ScrollView } from "react-native-gesture-handler";
import { Text, TextInput, RadioButton, Button, useTheme, Modal, Portal } from "react-native-paper";
import {View, StyleSheet, PermissionsAndroid, Platform, Alert} from "react-native";
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

function Radio_Button({ title, label1, label2, value, setFunction }) {
    return (
        <View
            style={{ display: "flex", alignItems: "start", paddingHorizontal: 12 }}
        >
            <Text
                variant='titleMedium'
                style={{
                    color: "#666666",
                    fontSize: 18,
                    paddingTop: 10
                }}
            >{title}</Text>
            <RadioButton.Group onValueChange={newValue => setFunction(newValue)} value={value}>
                <View style={{ flexDirection: "row", paddingVertical: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text variant="bodyLarge" style={{ fontSize: 18 }}>{label1}</Text>
                        <RadioButton value={label1} />
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text variant="bodyLarge" style={{ fontSize: 18 }}>{label2}</Text>
                        <RadioButton value={label2} />
                    </View>
                </View>
            </RadioButton.Group>
        </View>
    );
}

function Text_Input({ label, value, setFunction, isDisabled = false }) {
    return (
        <TextInput
            style={{
                margin: 10
            }}
            mode='outlined'
            label={label}
            value={value}
            onChangeText={value => setFunction(value)}
            disabled={isDisabled}
        />
    );
}

const DEFAULT_REGION = {
    latitude: 15.496777,
    longitude: 73.827827,
    latitudeDelta: 0.0411,
    longitudeDelta: 0.0220,
};

export default function Tickets() {
    const theme = useTheme();
    const mapRef = useRef(null);

    const [cameraLocation, setCameraLocation] = useState("");
    const [cameraPrivateGovt, setCameraPrivateGovt] = useState("");
    const [cameraOwner, setCameraOwner] = useState("");
    const [cameraContactNo, setCameraContactNo] = useState("");
    const [cameraLatitude, setCameraLatitude] = useState(DEFAULT_REGION.latitude.toString());
    const [cameraLongitude, setCameraLongitude] = useState(DEFAULT_REGION.longitude.toString());
    const [cameraCoverage, setCameraCoverage] = useState("");
    const [cameraBackup, setCameraBackup] = useState("");
    const [cameraConnected, setCameraConnected] = useState("");
    const [cameraStatus, setCameraStatus] = useState("");
    const [region, setRegion] = useState(DEFAULT_REGION);

    const handleClear = () => {
        setCameraLocation("");
        setCameraPrivateGovt("");
        setCameraOwner("");
        setCameraContactNo("");
        setCameraLatitude(DEFAULT_REGION.latitude.toString());
        setCameraLongitude(DEFAULT_REGION.longitude.toString());
        setCameraCoverage("");
        setCameraBackup("");
        setCameraConnected("");
        setCameraStatus("");
    };

    const handleConfirm = async () => {
        try {
            const response = await axios.post('http://10.70.13.203:8080/OnGroundCreateCamera', {
                location: cameraLocation,
                private_govt: cameraPrivateGovt,
                owner_name: cameraOwner,
                contact_no: cameraContactNo,
                latitude: cameraLatitude,
                longitude: cameraLongitude,
                coverage: cameraCoverage,
                backup: cameraBackup,
                connected_network: cameraConnected,
                status: "Pending",
                description: "New Camera Created"
            });
            console.log('Camera details submitted successfully:', response.data);
            Alert.alert(
              "Camera submitted",
              "Camera details submitted successfully",
              [{
                  text: 'Ok',
                  onPress: () => {handleClear()}
              }]
            )
        } catch (error) {
            console.error('Error submitting camera details:', error);
            Alert.alert(
              "Error",
              "Could not submit camera details:\n" + error.message,
              [{
                  text: 'Ok'
              }]
            )
        }
    };

    return (
      <ScrollView style={{backgroundColor: theme.colors.background}}>
          <Text variant="titleLarge" style={styles.title}>Enter Camera Details:</Text>

          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={DEFAULT_REGION}
            region={region}
            onRegionChangeComplete={(newRegion) => {
                setRegion({
                    latitude: parseFloat(newRegion.latitude.toFixed(4)),
                    longitude: parseFloat(newRegion.longitude.toFixed(4)),
                    latitudeDelta: newRegion.latitudeDelta,
                    longitudeDelta: newRegion.longitudeDelta
                });
                setCameraLatitude(newRegion.latitude.toFixed(4).toString());
                setCameraLongitude(newRegion.longitude.toFixed(4).toString());
            }}
            showsUserLocation={true}
            loadingEnabled={true}
            loadingIndicatorColor={theme.colors.primary}
            loadingBackgroundColor={theme.colors.background}
            toolbarEnabled={false}
            zoomControlEnabled={true}
          >
              <Marker coordinate={{latitude: region.latitude, longitude: region.longitude}} />
          </MapView>

          <Text_Input label="Location" value={cameraLocation} setFunction={setCameraLocation} />
          <Text_Input label="Private/Govt" value={cameraPrivateGovt} setFunction={setCameraPrivateGovt} />
          <Text_Input label="Owner" value={cameraOwner} setFunction={setCameraOwner} />
          <Text_Input label="Contact No" value={cameraContactNo} setFunction={setCameraContactNo} />
          <Text_Input label="Latitude" value={cameraLatitude} setFunction={setCameraLatitude} isDisabled={true} />
          <Text_Input label="Longitude" value={cameraLongitude} setFunction={setCameraLongitude} isDisabled={true} />
          <Text_Input label="Coverage" value={cameraCoverage} setFunction={setCameraCoverage} />
          <Text_Input label="Backup" value={cameraBackup} setFunction={setCameraBackup} />
          <Radio_Button title="Connected:" label1="Yes" label2="No" value={cameraConnected} setFunction={setCameraConnected} />
          <Radio_Button title="Status:" label1="Working" label2="Not Working" value={cameraStatus} setFunction={setCameraStatus} />

          <View style={styles.buttonContainer}>
              <Button
                icon="check"
                mode="contained"
                onPress={handleConfirm}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                style={styles.button}
              >
                  Submit
              </Button>
              <Button
                icon="close"
                mode="outlined"
                onPress={handleClear}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                style={styles.button}
              >
                  Clear
              </Button>
          </View>
      </ScrollView>
    );
}

const styles = StyleSheet.create({
    title: {
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    map: {
        height: 300,
        marginVertical: 10,
        marginHorizontal: 10,
    },
    radioButtonContainer: {
        display: "flex",
        alignItems: "flex-start",
        paddingHorizontal: 12,
    },
    radioTitle: {
        color: "#666666",
        fontSize: 18,
        paddingTop: 10,
    },
    radioGroup: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    radioOption: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20,
    },
    radioLabel: {
        fontSize: 18,
    },
    textInput: {
        margin: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingVertical: 20,
    },
    button: {
        minWidth: 150,
    },
    buttonContent: {
        paddingVertical: 2,
    },
    buttonLabel: {
        fontSize: 16,
    },
});

