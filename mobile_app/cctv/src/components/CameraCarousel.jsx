import React from 'react';
import { Dimensions, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import CameraInfoCard from './CameraInfoCard';

export default function CameraCarousel() {
    const width = Dimensions.get('window').width;
    return (
        <View>
            <Carousel
                width={width}
                height={width * 0.75}
                data={dummyData}
                loop={false}
                pagingEnabled={true}
                scrollAnimationDuration={500}
                onSnapToItem={(index) => console.log('current index:', index)}
                mode='parallax'
                renderItem={({ item }) => (
                    <CameraInfoCard
                      cameraLocation={item.location}
                      cameraClass={item.private_govt}
                      cameraOwner={item.owner}
                      cameraContactNo={item.contact}
                      cameraStatus={item.status}
                    />
                )}
            />
        </View>
    )

}
