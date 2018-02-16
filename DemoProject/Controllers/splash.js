import React, {Component} from 'react'
import {
    AppRegistry,
    Text,
    Image,
    View,
    Button,
    StyleSheet

} from 'react-native'
var navigation  = require('./route')
var TimerMixin = require('react-timer-mixin');
import Login from './Login'
import Home from './Home'
import Registration from './Registration'


export default class SplashScreen extends Component {

    static navigationOptions = {
        header: null
    };

    componentDidMount() {
        console.log('STEP---3')

        this.timer = setTimeout(() => {
            console.log('I do not leak!');

            this.props.navigation.navigate('ProductDetail')
            //navigate('Login', { name: 'Jane' })

        }, 1000);
    }

    render() {
        return (    <View style={{backgroundColor:'#414448',alignItems: 'center',justifyContent:'center',flex:1}}>
            <Image
                style={styles.image}
                source={require('../Images/Home/FoodieLogo.png')}
                resizeMode={'cover'}
            />
        </View>)
    }



    constructor(props) {
        super(props);
        // this.state = {showText: true};
        //
        // // Toggle the state every second
        // setInterval(() => {
        //     this.setState({ showText: !this.state.showText });
        // }, 1000);
    }


}

const styles = StyleSheet.create({

    image: {
        backgroundColor: '#DDDDDD',

        backgroundColor:'transparent'
    }


})

