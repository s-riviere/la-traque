// React
import { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import ImageViewing from 'react-native-image-viewing';

export const CustomImage = ({ source, canZoom, onPress }) => {
    // canZoom : boolean
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={canZoom ? () => setIsModalVisible(true) : onPress}>
                <Image style={styles.image} resizeMode="contain" source={source}/>
            </TouchableOpacity>
            <ImageViewing
                images={[source]}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
                swipeToCloseEnabled={false}
                doubleTapToZoomEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center"
    },
    image: {
        width: "100%",
        height: undefined,
        aspectRatio: 1.5
    }
});
