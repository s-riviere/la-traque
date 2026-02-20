// React
import { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import ImageViewing from 'react-native-image-viewing';

export const TouchableImage = ({ source, onPress }) => {

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image style={styles.image} resizeMode="contain" source={source}/>
        </TouchableOpacity>
    );
};

export const ExpandableImage = ({ source }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                <Image style={styles.image} resizeMode="contain" source={source}/>
            </TouchableOpacity>
            <ImageViewing
                images={[source]}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
                imageIndex={0}
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
