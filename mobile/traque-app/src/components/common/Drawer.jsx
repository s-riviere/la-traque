// React
import { useState } from 'react';
import { ScrollView, View, Image, StyleSheet, TouchableHighlight } from 'react-native';
import Collapsible from 'react-native-collapsible';
import LinearGradient from 'react-native-linear-gradient';
// Constants
import { COLORS } from '@/config';

export const Drawer = ({ contentContainerStyle = {}, height, children }) => {
    const [collapsibleState, setCollapsibleState] = useState(true);

    return (
        <View style={styles.outerDrawerContainer}>
            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']} style={styles.gradient}/>
            <View style={styles.innerDrawerContainer}>
                <TouchableHighlight style={styles.collapsibleButton} underlayColor="#e9e9e9" onPress={() => setCollapsibleState(!collapsibleState)}>
                    <Image source={require('@/assets/images/arrow.png')} style={[styles.arrow, {transform: [{ scaleY: collapsibleState ? 1 : -1 }]}]} resizeMode="contain"/>
                </TouchableHighlight>
                <Collapsible style={[styles.collapsibleWindow, {height: height - 44}]} collapsed={collapsibleState}>
                    <ScrollView style={styles.outerScrollContainer} contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
                        {children}
                    </ScrollView>
                </Collapsible>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerDrawerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    gradient: {
        position: "absolute",
        top: -30,
        width: "100%",
        height: 70,
    },
    innerDrawerContainer: {
        width: "100%",
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    collapsibleButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
        height: 45
    },
    arrow: {
        width: 20,
        height: 20,
    },
    collapsibleWindow: {
        width: "100%",
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    outerScrollContainer: {
        flex: 1
    }
});
