import React, {Component} from 'react'
import {
    AppRegistry,
    Text,
    Image,
    View,
    Button,
    StyleSheet,
    TouchableHighlight,
    TextInput
} from 'react-native';

import GridView from 'react-native-super-grid';

const Dimensions = require('Dimensions');
const window = Dimensions.get('window');
const deviceWidth = Dimensions.get('window').width


export default class HomeVC extends Component {

    // const navigationOption
    // {
    //    
    // }


    render() {
        // Taken from https://flatuicolors.com/


        const items = [
            {name: 'CHINESE', code: '#1abc9c', image: require('../Images/Food/chinese.jpg')},
            {name: 'ITALIAN', code: '#2ecc71', image: require('../Images/Food/italian.jpg')},
            {name: 'INDIAN', code: '#3498db', image: require('../Images/Food/indian.jpeg')},
            {name: 'SOUTH', code: '#9b59b6', image: require('../Images/Food/SOUTH-INDIAN.jpg')},
            {name: 'MAXICAN', code: '#34495e', image: require('../Images/Food/maxicon.jpg')},
            {name: 'PANJABI', code: '#16a085', image: require('../Images/Food/panjabi.jpg')},
            {name: 'SALAD', code: '#27ae60', image: require('../Images/Food/SALAD.jpg')},
            {name: 'THAI', code: '#2980b9', image: require('../Images/Food/thai.jpg')},
            {name: 'CHINESE', code: '#1abc9c', image: require('../Images/Food/chinese.jpg')},
            {name: 'ITALIAN', code: '#2ecc71', image: require('../Images/Food/italian.jpg')},
            {name: 'INDIAN', code: '#3498db', image: require('../Images/Food/indian.jpeg')},
            {name: 'SOUTH', code: '#9b59b6', image: require('../Images/Food/SOUTH-INDIAN.jpg')},
            {name: 'MAXICAN', code: '#34495e', image: require('../Images/Food/maxicon.jpg')},
            {name: 'PANJABI', code: '#16a085', image: require('../Images/Food/panjabi.jpg')},
            {name: 'SALAD', code: '#27ae60', image: require('../Images/Food/SALAD.jpg')},
            {name: 'THAI', code: '#2980b9', image: require('../Images/Food/thai.jpg')}

        ];


        return (



            <GridView
                itemDimension={deviceWidth/2 - 24}
                items={items}
                itemsPerRow={2}

                style={styles.gridView}
                renderItem={item => (
                <View style={{height :(deviceWidth/2 - 14) + 30,backgroundColor:item.code,borderRadius:5 }}>
                 <View style={[styles.itemContainer, { backgroundColor: item.code }]}>
                    <Image
                       style={{height:'95%',width:'95%', borderTopLeftRadius:50,}}
                       source={item.image}
                       resizeMode={'cover'}
                    />

                </View>
                 <Text style={styles.itemName}>{item.name}</Text>


            </View>

        )}
            />
        );
    }
}

const styles = StyleSheet.create({
    gridView: {
        paddingTop: 12,
        flex: 1,
    },
    itemContainer: {
        justifyContent: 'center',
        borderTopLeftRadius:5,
        borderTopRightRadius:5,
        backgroundColor:'orange',
        height: (deviceWidth / 2 - 20),
        alignItems: 'center',
        padding:1
    },
    itemName: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        justifyContent: 'center',
        textAlign:'center',
        paddingTop:3
    },
    itemCode: {
        fontWeight: '300',
        fontSize: 12,
        color: '#fff'
    },
});