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


export default class LoginComponent extends Component {


    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props)
        this.state = {tv_name_placeHolderText: 'Enter Email Address', tv_name_placeHolderText1: 'Enter Password'};

    }

    render() {
        return (


            <View style={{backgroundColor:'#414448',alignItems: 'center',justifyContent:'center',flex:1}}>
                <Image
                    style={styles.image}
                    source={require('../Images/Home/FoodieLogo.png')}
                    resizeMode={'cover'}
                />

                <View style={{backgroundColor:'transparent',width:320,height:200,padding : 10,marginTop:20}}>
                    <TextInput
                        placeholder='Email '
                        placeholderTextColor={'#e68a00'}
                        style={{height: 40, borderColor: 'orange', borderWidth: 1,padding:10,borderWidth:1,borderRadius:3}}
                        onChangeText={(text) => this.setState({tv_name_placeHolderText: text})}
                    />
                    <TextInput
                        placeholder='Password'
                        placeholderTextColor={'#e68a00'}
                        style={{height: 40, borderColor: '#e68a00', borderWidth: 1,padding:10,marginTop:10,borderWidth:1,borderRadius:3}}
                        onChangeText={(text) => this.setState({tv_name_placeHolderText1 : text})}
                    />
                    <TouchableHighlight onPress={this.onPressLearnMore} style={{borderRadius:3,borderWidth:1,
                marginTop:10,height:40,backgroundColor:'#e68a00',borderColor:'#e68a00'}}>
                        <Text
                            title="Login"
                            color='yellow'

                            style={{textAlign:'center',color:'white', fontSize: 17,
                                    fontWeight: 'bold',flex:1,marginTop:8}}
                            accessibilityLabel="Login"
                        >
                            Login
                        </Text>

                    </TouchableHighlight>
                    <Text
                        title="Login"
                        color='yellow'
                        style={{textAlign:'center',color:'white', fontSize: 12,
                                    fontWeight: 'bold',flex:1,marginTop:25,width:320,height:10,alignSelf:'center'}}
                        accessibilityLabel="Login"
                    >-----------------------OR-----------------------
                    </Text>

                </View>
                <View style={{backgroundColor:'transparent',width:320,height:180,padding : 10}}>
                    <TouchableHighlight onPress={this.onPressLearnMore} style={{borderRadius:3,
                marginTop:10,height:40}}>
                        <Image
                            style={{width:300,height:40}}
                            source={require('../Images/Home/gmailLogin.png')}
                        />

                    </TouchableHighlight>
                    <TouchableHighlight onPress={this.onPressLearnMore} style={{borderRadius:3,
                marginTop:10,height:40}}>
                        <Image
                            style={{width:308,height:40,left:-5}}
                            source={require('../Images/Home/fblogin.png')}
                        />

                    </TouchableHighlight>
                </View>
            </View>)
    }
}


onPressLearnMore = () => {

}

const styles = StyleSheet.create({

    image: {
        backgroundColor: '#DDDDDD',

        backgroundColor: 'transparent'
    }


})


