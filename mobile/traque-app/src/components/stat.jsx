// React
import { TouchableOpacity, View, Image, Text, Alert } from 'react-native';

export const Stat = ({ children, source, description }) => {
    return (
        <TouchableOpacity onPress={description ? () => Alert.alert("Info", description) : null}>
            <View style={{height: 30, flexDirection: "row", justifyContent: 'center', alignItems: 'center'}}>
                {source && <Image source={source} style={{width: 30, height: 30, marginRight: 5}} resizeMode="contain"/>}
                <Text style={{fontSize: 15}}>{children}</Text>
            </View>
        </TouchableOpacity>
    );
};
