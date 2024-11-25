import { Searchbar, useTheme, SegmentedButtons, Button, Modal, Portal, RadioButton, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  Dimensions,
  ToastAndroid,
  Platform,
  PermissionsAndroid,
  Alert,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {fromAddress} from "react-geocode";
import Geolocation from '@react-native-community/geolocation'
import CameraInfoCard from "../components/CameraInfoCard";
import Carousel from "react-native-reanimated-carousel";
import axios from 'axios';

const ITEM_HEIGHT = Dimensions.get('window').width * 0.75;

export default function CctvMaps() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState(250);
  const [cameraMarkers, setCameraMarkers] = useState([]);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(0);
  const [originMarker, setOriginMarker] = useState(null);
  const [visibleMarkers, setVisibleMarkers] = useState([]);
  const [isGovtOrPrivate, setIsGovtOrPrivate] = useState("");
  const [isWorkingOrNotWorking, setIsWorkingOrNotWorking] = useState("");
  const [visibleRegion, setVisibleRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showSearchInNewRegionButton, setShowSearchInNewRegionButton] = useState(false);
  const [showSetToUserLocationButton, setShowSetToUserLocationButton] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const mapRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (cameraMarkers.length > 0 && mapRef.current && !isSearching) {
      focusMarker(selectedMarkerIndex);
    } else if (cameraMarkers.length === 0 && selectedMarkerIndex > 0) {
      setSelectedMarkerIndex(0);
    }
  }, [selectedMarkerIndex, cameraMarkers]);

  useEffect(() => {
    if (region != null && !isSearching) {
      setOriginMarker({
        latitude: region.latitude,
        longitude: region.longitude,
      });
      fetchNearestCameraLocations();
    }
  }, [region, selectedRadius]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      getOneTimeLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getOneTimeLocation();
        } else {
          ToastAndroid.show('Permission Denied', ToastAndroid.SHORT);
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const radius = [
    {label: "250m", value: 250},
    {label: "500m", value: 500},
    {label: "1km", value: 1000},
    {label: "1.5km", value: 1500},
  ]

  function searchLocation() {
    setCameraMarkers([]); // Clear the cameraMarkers state

    fromAddress(searchQuery)
      .then(({results}) => {
        let newRegion = {
          latitude: results[0].geometry.location.lat,
          longitude: results[0].geometry.location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
        setRegion(newRegion);
        mapRef.current.animateToRegion(newRegion, 1000);
      })
      .catch(error => {
        console.error("Error in geocoding:", error);
        ToastAndroid.show("Error finding location", ToastAndroid.SHORT);
      })
      .finally(() => {
        setIsSearching(false);
      });
  }

  const fetchNearestCameraLocations = async () => {
    const uri = "http://10.70.13.203:8080/nearby_cameras";
    setCameraMarkers([]);
    setVisibleMarkers([]);
    console.log(cameraMarkers);

    try {
      const response = await axios.post(uri, {
        latitude: region.latitude,
        longitude: region.longitude,
        radius_meters: selectedRadius,
        status_filter: isWorkingOrNotWorking,
        ownership_filter: isGovtOrPrivate,
      });
      setIsSearching(true);

      if (Array.isArray(response.data)) {
        const newCameraMarkers = response.data.map(camera => ({
          id: camera.id,
          coordinate: {
            latitude: parseFloat(camera.latitude) || 0,
            longitude: parseFloat(camera.longitude) || 0,
          },
          title: camera.location || "Camera",
          description: `Owner: ${camera.owner_name || 'Unknown'}, Status: ${camera.status || 'Unknown'}`,
          privateGovt: camera.private_govt || 'Unknown',
          contactNo: camera.contact_no || 'Unknown',
          coverage: camera.coverage || 'Unknown',
          backup: camera.backup || 'Unknown',
          connectedNetwork: camera.connected_network || 'Unknown',
          cameraId: camera.camera_id || 'Unknown',
          distance: camera.distance || 0,
        }));

        setCameraMarkers(newCameraMarkers);
        setIsSearching(false);
        // return newCameraMarkers;
      } else {
        throw new Error('Expected array response, got ' + typeof response.data);
      }
    } catch (error) {
      console.error("Error fetching camera locations:", error);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);

        if (error.response.status === 422) {
          ToastAndroid.show("Invalid request. Please try again.", ToastAndroid.SHORT);
        } else {
          ToastAndroid.show(`Server error: ${error.response.status}`, ToastAndroid.SHORT);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        ToastAndroid.show("No response from server", ToastAndroid.SHORT);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
        ToastAndroid.show("Error setting up request", ToastAndroid.SHORT);
      }

      Alert.alert("Error", "Error fetching camera locations:\n" + error.message);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  const focusMarker = (index) => {
    if (mapRef.current && cameraMarkers[index]) {
      mapRef.current.animateToRegion({
        latitude: cameraMarkers[index].coordinate.latitude,
        longitude: cameraMarkers[index].coordinate.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  const handleMarkerPress = (index) => {
    setSelectedMarkerIndex(index);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ index: index });
    }
  };

  const handleMapRegionChange = useCallback((newRegion) => {
    const visibleMarkers = cameraMarkers.filter(marker =>
      marker.coordinate.latitude >= newRegion.latitude - newRegion.latitudeDelta / 2 &&
      marker.coordinate.latitude <= newRegion.latitude + newRegion.latitudeDelta / 2 &&
      marker.coordinate.longitude >= newRegion.longitude - newRegion.longitudeDelta / 2 &&
      marker.coordinate.longitude <= newRegion.longitude + newRegion.longitudeDelta / 2
    );
    setVisibleMarkers(visibleMarkers);
  }, [cameraMarkers]);

  const renderCarouselItem = useCallback(({ item }) => (
    <CameraInfoCard
      cameraLocation={item.title}
      cameraClass={item.privateGovt}
      cameraOwner={item.description.split(',')[0].split(': ')[1]}
      cameraContactNo={item.contactNo}
      cameraStatus={item.description.split(',')[1].split(': ')[1]}
      allData={item}
    />
  ), []);

  const memoizedMarkers = useMemo(() =>
      visibleMarkers.map((marker, index) => (
        <Marker
          coordinate={marker.coordinate}
          key={marker.id || index}
          onPress={() => handleMarkerPress(cameraMarkers.indexOf(marker))}
          pinColor="blue"
        />
      )),
    [visibleMarkers, handleMarkerPress]
  );

  const handleMapRegionChangeComplete = (newRegion) => {
    setVisibleRegion(newRegion);

    // Check if the new region is significantly different from the current search region
    if (region) {
      const latDiff = Math.abs(newRegion.latitude - region.latitude);
      const lonDiff = Math.abs(newRegion.longitude - region.longitude);

      if (latDiff > region.latitudeDelta / 4 || lonDiff > region.longitudeDelta / 4) {
        setShowSearchInNewRegionButton(true);
      } else {
        setShowSearchInNewRegionButton(false);
      }
    }

    // Check if the new region is different from the user's location
    if (userLocation) {
      const latDiff = Math.abs(newRegion.latitude - userLocation.latitude);
      const lonDiff = Math.abs(newRegion.longitude - userLocation.longitude);

      if (latDiff > 0.01 || lonDiff > 0.01) { // Roughly 1km
        setShowSetToUserLocationButton(true);
      } else {
        setShowSetToUserLocationButton(false);
      }
    }
  };

  const searchInNewRegion = () => {
    setCameraMarkers([]);
    setVisibleMarkers([]);
    if (visibleRegion) {
      setRegion(visibleRegion);
      fetchNearestCameraLocations();
      setShowSearchInNewRegionButton(false);
    }
  };

  const setToUserLocation = () => {
    setCameraMarkers([]);
    setVisibleMarkers([]);
    if (userLocation) {
      const newRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 1000);
      fetchNearestCameraLocations();
      setShowSetToUserLocationButton(false);
    }
  };

  // Modify getOneTimeLocation to also set userLocation
  const getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const currentLongitude = position.coords.longitude;
        const currentLatitude = position.coords.latitude;
        const newRegion = {
          latitude: currentLatitude,
          longitude: currentLongitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(newRegion);
        setUserLocation({
          latitude: currentLatitude,
          longitude: currentLongitude,
        });
      },
      (error) => {
        ToastAndroid.show(error.message, ToastAndroid.SHORT);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 1000
      },
    );
  };

  const showFilterModal = () => setIsFilterModalVisible(true);
  const hideFilterModal = () => setIsFilterModalVisible(false);

  const applyFilters = () => {
    hideFilterModal();
    fetchNearestCameraLocations();
  };


  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        }
      ]
    }
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          minWidth: '100%',
          borderRadius: 15,
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: 5,
        }}
      >
        <Searchbar
          placeholder='Search'
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
          style={styles.searchbar}
          onSubmitEditing={searchLocation}
          loading={isSearching}
          icon="filter-variant"
          onIconPress={showFilterModal}
        />
        <SegmentedButtons
          value={selectedRadius}
          onValueChange={setSelectedRadius}
          buttons={radius}
          style={styles.segmentedButtons}
        />
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          region={region}
          style={styles.map}
          userInterfaceStyle={theme.dark ? 'dark' : 'light'}
          showsUserLocation={true}
          loadingEnabled={true}
          loadingIndicatorColor={theme.colors.primary}
          loadingBackgroundColor={theme.colors.background}
          toolbarEnabled={false}
          onRegionChangeComplete={handleMapRegionChangeComplete}
          showsMyLocationButton={false}
        >
          {originMarker && (
            <>
              <Marker
                coordinate={originMarker}
                pinColor="red"
                title="Origin"
                description="Center of search radius"
              />
              <Circle
                center={originMarker}
                radius={selectedRadius}
                strokeColor="rgba(255, 0, 0, 0.5)"
                fillColor="rgba(255, 0, 0, 0.1)"
              />
            </>
          )}
          {cameraMarkers.map((marker, index) => (
            <Marker
              coordinate={marker.coordinate}
              key={index}
              onPress={() => handleMarkerPress(index)}
              pinColor="blue"
            />
          ))}
        </MapView>
        <View style={{
          flexDirection: 'column',
          position: 'absolute',
          top: 20
        }}
        >
          {showSearchInNewRegionButton && (
            <TouchableOpacity style={styles.floatingButton} onPress={searchInNewRegion}>
              <Button mode="contained">Search in this area</Button>
            </TouchableOpacity>
          )}
          {showSetToUserLocationButton && (
            <TouchableOpacity style={[styles.floatingButton, styles.userLocationButton]} onPress={setToUserLocation}>
              <Button mode="contained">Set to my location</Button>
            </TouchableOpacity>
          )}
        </View>
        { cameraMarkers.length === 0 || isSearching ?
        null :
          <View
            style={styles.carouselContainer}
          >
            <Carousel
              ref={carouselRef}
              data={cameraMarkers}
              renderItem={renderCarouselItem}
              width={Dimensions.get('window').width}
              height={ITEM_HEIGHT}
              loop={false}
              pagingEnabled={true}
              onSnapToItem={setSelectedMarkerIndex}
              mode='parallax'
              windowSize={5}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              removeClippedSubviews={true}
            />
          </View>
        }
      </View>
      <Portal>
        <Modal visible={isFilterModalVisible} onDismiss={hideFilterModal} contentContainerStyle={[styles.modalContainer, {backgroundColor: theme.colors.background}]}>
          <Text style={styles.modalTitle}>Filters</Text>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Owner Type</Text>
            <RadioButton.Group onValueChange={value => setIsGovtOrPrivate(value)} value={isGovtOrPrivate}>
              <RadioButton.Item label="All" value="" />
              <RadioButton.Item label="Government" value="government" />
              <RadioButton.Item label="Private" value="private" />
            </RadioButton.Group>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Status</Text>
            <RadioButton.Group onValueChange={value => setIsWorkingOrNotWorking(value)} value={isWorkingOrNotWorking}>
              <RadioButton.Item label="All" value="" />
              <RadioButton.Item label="Working" value="working" />
              <RadioButton.Item label="Not Working" value="not working" />
            </RadioButton.Group>
          </View>

          <Button mode="contained" onPress={applyFilters} style={styles.applyButton}>
            Apply Filters
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  searchbar: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  segmentedButtons: {
    marginBottom: 15,
    marginHorizontal: 10,
  },
  map: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 15,
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 0,
    height: 250,
    width: '95%',
    marginHorizontal: 10,
  },
  floatingButton: {
    position: 'absolute',
    top: 120, // Adjust as needed
    alignSelf: 'center',
    zIndex: 1,
  },
  userLocationButton: {
    top: 180, // Adjust as needed
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
});
