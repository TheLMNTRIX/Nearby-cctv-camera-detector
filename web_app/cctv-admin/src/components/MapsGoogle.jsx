import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Button } from "@/components/ui/button";

const ZoomControl = () => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const listener = map.addListener('zoom_changed', () => {
      setZoom(map.getZoom());
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map]);

  return (
    <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow">
      Zoom: {zoom}
    </div>
  );
};

const MapsGoogle = () => {
  const [position, setPosition] = useState({ lat: 53.54, lng: 10 });
  const [openInfoWindowIndex, setOpenInfoWindowIndex] = useState(null); // Track which InfoWindow is open
  const [loading, setLoading] = useState(true);
  const [cameraData, setCameraData] = useState([]); // State to store the camera data from the API
  const [radius, setRadius] = useState(1000); // State to store selected radius in meters

  // Function to fetch camera data
  const fetchCameraData = async (lat, lng, radiusMeters) => {
    try {
      const response = await fetch('http://10.70.13.203:8080/nearby_cameras', { // Replace with your actual API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          radius_meters: radiusMeters, // Use the provided radius
          status_filter: '', // Example filter
          ownership_filter: '', // Example filter
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setCameraData(data); // Save the response to state
    } catch (error) {
      console.error('Error fetching camera data:', error);
    }
  };

  // Get current position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition({ lat: latitude, lng: longitude });
          setLoading(false);

          // Fetch camera data once we have the current position with the default radius
          fetchCameraData(latitude, longitude, radius);
        },
        (error) => {
          console.error('Error getting current location:', error);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  }, []);

  // Handle radius change when the filter buttons are clicked
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius); // Update the radius state
    // console.log(radius)
    // return
    fetchCameraData(position.lat, position.lng, newRadius); // Fetch the data with the new radius
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <APIProvider apiKey='YOUR_API_KEY'>      
        <div className="flex justify-center gap-4 pb-4">
          <Button
            className={`px-4 py-2 ${radius === 500 ? ' text-white' : ''}`}
            variant={radius === 500 ? 'default' : 'outline'} // Highlight the selected button
            onClick={() => handleRadiusChange(500)}
          >
            500m
          </Button>
          <Button
            className={`px-4 py-2 ${radius === 1000 ? ' text-white' : ''}`}
            variant={radius === 1000 ? 'default' : 'outline'}
            onClick={() => handleRadiusChange(1000)}
          >
            1000m
          </Button>
          <Button
            className={`px-4 py-2 ${radius === 2000 ? ' text-white' : ''}`}
            variant={radius === 2000 ? 'default' : 'outline'}
            onClick={() => handleRadiusChange(2000)}
          >
            2000m
          </Button>
          <Button
            className={`px-4 py-2 ${radius === 5000 ? ' text-white' : ''}`}
            variant={radius === 5000 ? 'default' : 'outline'}
            onClick={() => handleRadiusChange(5000)}
          >
            5000m
          </Button>
        </div>

      <div className="h-[70vh]">
        <Map
          defaultZoom={15}
          defaultCenter={position}
          mapId='YOUR_MAP_ID'
        >
          {/* Marker for the user's current position */}
          <AdvancedMarker position={position} onClick={() => setOpenInfoWindowIndex('user')}>
            <Pin background={'#22C55E'} borderColor={'#065F46'} glyphColor={'#FFFFFF'} />
          </AdvancedMarker>

          {/* InfoWindow for the user's current location */}
          {openInfoWindowIndex === 'user' &&
            <InfoWindow position={position} onCloseClick={() => setOpenInfoWindowIndex(null)}>
              <p>Your current location</p>
            </InfoWindow>
          }

          {cameraData.map((camera, index) => (
            <AdvancedMarker
              key={index}
              position={{ lat: Number(camera.latitude), lng: Number(camera.longitude) }} // Camera location
              onClick={() => setOpenInfoWindowIndex(index)} // Open InfoWindow when marker is clicked
            >
              <Pin background={'#FF5722'} borderColor={'#BF360C'} glyphColor={'#FFFFFF'} />
            </AdvancedMarker>
          ))}

          {/* InfoWindows for each camera */}
          {cameraData.map((camera, index) => (
            openInfoWindowIndex === index && (
              <InfoWindow
                key={index}
                position={{ lat: Number(camera.latitude), lng: Number(camera.longitude) }}
                onCloseClick={() => setOpenInfoWindowIndex(null)}
              >
                <div>
                  <p className='text-[16px]'><strong>Location:</strong> {camera.location || 'No location available'}</p>
                  <p className='text-[16px]'><strong>Owner:</strong> {camera.owner_name || 'No owner available'}</p>
                  <p className='text-[16px]'><strong>Type:</strong> {camera.private_govt || 'No type available'}</p>
                  <p className='text-[16px]'><strong>Contact No:</strong> {camera.contact_no || 'No contact no. available'}</p>
                  <p className='text-[16px]'><strong>Coverage:</strong> {camera.coverage || 'No coverage available'}</p>
                  <p className='text-[16px]'><strong>Backup:</strong> {camera.backup || 'No backup available'}</p>
                  <p className='text-[16px]'><strong>Status:</strong> {camera.status || 'Unknown'}</p>
                  <p className='text-[16px]'><strong>Ownership:</strong> {camera.ownership || 'Unknown'}</p>
                </div>
              </InfoWindow>
            )
          ))}

          <ZoomControl />
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapsGoogle;
