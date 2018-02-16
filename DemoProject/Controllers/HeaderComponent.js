//Import a library
import React from 'react'
import {Text, View, Button, AppRegistry, TouchableHighlight, Image, StyleSheet} from 'react-native'
//Create  a component

 const Header = () =>
    (
        <View style={styles.container}>
            <Text style={styles.headerText}> Food Ordering App </Text>
            <View style={styles.touchableContainerView}>
                <TouchableHighlight onPress={this.onPressMenuButton}>
                    <Image
                        style={styles.image}
                        source={require('../Images/Home/menu.png')}
                    />
                </TouchableHighlight>

            </View>

        </View>
    );

export default Header;

const styles = StyleSheet.create({

    container: {backgroundColor: 'white', height: 64, flexDirection: 'row'},
    headerText: {
        backgroundColor: 'red',
        height: 44,
        fontWeight: 'bold',
        paddingTop: 13,
        marginTop: 20,
        flex: 1,
        textAlignVertical: "center",
        textAlign: "center"
    },
    touchableContainerView: {
        position: 'absolute',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: 'transparent',
        marginTop: 30,
        marginLeft: 12
    },
    image: {
        backgroundColor: '#DDDDDD',
        width: 25,
        height: 25,

    }

})

//MARK:- Button Methods

onPressMenuButton = () => {
    console.log('Menu button pressed');
}


