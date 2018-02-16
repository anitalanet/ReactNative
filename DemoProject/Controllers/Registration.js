import React, {Component} from 'react'
import {
    AppRegistry,
    Text,
    Image,
    View,
    Button,
    StyleSheet,
    KeyboardAvoidingView,
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

            <KeyboardAvoidingView behavior="padding" style={{flex: 1, backgroundColor: "#414448", justifyContent: "flex-end"}}>

            <View style={{backgroundColor:'#414448',alignItems: 'center',justifyContent:'center',flex:1}}>
                <TouchableHighlight onPress={this.onPressLearnMore} >
                <Image
                    style={styles.image}
                    source={require('../Images/Home/FoodieLogo.png')}
                    resizeMode={'cover'}
                />
                </TouchableHighlight>

                <View style={{backgroundColor:'transparent',width:320,padding : 10,marginTop:20}}>
                    <TextInput
                        placeholder='Email '
                        placeholderTextColor={'#e68a00'}
                        returnKeyType={ "next" }
                        keyboardType = { "email-address" }
                        style={{height: 40, borderColor: 'orange',color:'white', borderWidth: 1,padding:10,borderWidth:1,borderRadius:3}}
                        onSubmitEditing={(event) => {
                         this.refs.Password.focus();}}
                        onChangeText={(text) => this.setState({tv_name_placeHolderText: text})}
                    />
                    <TextInput
                        placeholder='Password'
                        ref='Password'
                        secureTextEntry={true}
                        placeholderTextColor={'#e68a00'}
                        returnKeyType={ "next" }
                        style={{height: 40, borderColor: '#e68a00',color:'white', borderWidth: 1,padding:10,marginTop:10,borderWidth:1,borderRadius:3}}
                        onSubmitEditing={(event) => {
                         this.refs.CPassword.focus();}}
                        onChangeText={(text) => this.setState({tv_name_placeHolderText1 : text})}
                    />
                    <TextInput
                        placeholder='Confirm Password'
                        ref='CPassword'
                        secureTextEntry={true}
                        onSubmitEditing={(event) => {
                         this.refs.PNumber.focus();}}
                        placeholderTextColor={'#e68a00'}
                        returnKeyType={ "next" }
                        style={{height: 40, borderColor: '#e68a00',color:'white', borderWidth: 1,padding:10,marginTop:10,borderWidth:1,borderRadius:3}}
                        onChangeText={(text) => this.setState({tv_name_placeHolderText1 : text})}
                    />
                    <TextInput
                        placeholder='Phone Number'
                        ref='PNumber'
                        onSubmitEditing={(event) => {
                         this.refs.Address.focus();}}
                        placeholderTextColor={'#e68a00'}
                        returnKeyType={ "next" }
                        keyboardType = { "phone-pad" }
                        style={{height: 40, borderColor: '#e68a00',color:'white', borderWidth: 1,padding:10,marginTop:10,borderWidth:1,borderRadius:3}}
                        onChangeText={(text) => this.setState({tv_name_placeHolderText1 : text})}
                    />
                    <TextInput
                        placeholder='Address'
                        ref='Address'

                        placeholderTextColor={'#e68a00'}
                        returnKeyType={ "done" }
                        style={{height: 40, borderColor: '#e68a00',color:'white', borderWidth: 1,padding:10,marginTop:10,borderWidth:1,borderRadius:3}}
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
                            Register
                        </Text>

                    </TouchableHighlight>

                </View>

            </View>

            </KeyboardAvoidingView>)
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


