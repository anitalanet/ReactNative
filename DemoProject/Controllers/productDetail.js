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
    ImageBackground,
    ScrollView,
    TextInput
} from 'react-native';
import Stars from 'react-native-stars';
//import Icon from 'react-native-vector-icons';
const INT = 'Ingredians'
const HOW = 'How to'
const REVIEW = 'Review'

export default class productDetail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentTab: INT,
            starCount:0

        }
    }

    tabChanged = (tabValue) => {
        this.setState({
            currentTab: tabValue
        })
    }

    renderTabs(tab) {

        return (
            <View style={{backgroundColor:'white',width:'100%', height:200,marginBottom:5}}>
                <Text style={{color:'gray',fontSize:20,fontWeight:'600',margin:10}}> Chinese Pasta : {tab}</Text>

                <View
                    style={{ width:'90%',justifyContent:'center',alignItems:'center',alignSelf:'center',marginTop:5 }}>
                    <Text style={{color:'gray',justifyContent:'flex-start'}}>A Delicious pasta is easy to make and ready to serve. This is very delecious
                            food for health people with good health and tasty food. </Text>
                </View>

            </View>
        )
    }

    render() {
        return (
            <ScrollView >
                <ImageBackground
                    style={{width:'100%',height:400,backgroundColor:'purple',alignItems:'center',justifyContent:'flex-end' }}
                    source={require('../Images/Food/chinese.jpg')}>

                    <View style={{backgroundColor:'white',width:'90%', height:200,marginBottom:12,borderRadius:3}}>
                        <Text style={{color:'gray',fontSize:20,fontWeight:'600',margin:10}}> Chinese Pasta </Text>
                        <View style={{alignItems:'flex-start',paddingLeft:15,flexDirection:'row'}}>
                            <Stars
                                backingColor={'red'}
                                starSize={15}
                                spacing={3}
                                rating={3}
                                count={5}
                                half={true}
                                selectedStar={(rating) => this.onStarRatingPress(rating)}


                            />
                            <Text style={{color:'gray',fontSize:12,marginLeft:5}}> 35 reviews </Text>
                        </View>
                        <View style={{marginTop:8,marginLeft:15 ,flexDirection:'row'}}>
                            <Image style={{width:15,height:15,alignItems:'center',justifyContent:'flex-start'}}
                                   source={require('../Images/Home/watch.png')}/>
                            <Text style={{color:'gray',fontSize:12,fontWeight:'600',marginLeft:3}}> 30m </Text>
                        </View>
                        <View
                            style={{height:1, width:'90%',backgroundColor:'gray',justifyContent:'center',alignItems:'center',alignSelf:'center',marginTop:15}}/>
                        <View
                            style={{ width:'90%',justifyContent:'center',alignItems:'center',alignSelf:'center',marginTop:5 }}>
                            <Text style={{color:'gray',justifyContent:'flex-start'}}>A Delicious pasta is easy to make and ready to serve. This is very delecious
                            food for health people with good health and tasty food. </Text>
                        </View>

                    </View>
                </ImageBackground>
                <View style={{backgroundColor:'gray',height:30,width:'100%',flexDirection:'row'}}>
                    <TouchableHighlight onPress={() => this.tabChanged(INT)}
                                        style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'white'}}>
                        <Text style={{color:'gray'}}>Ingredians</Text>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => this.tabChanged(HOW)}
                                        style={{flex:1,justifyContent:'center',alignItems:'center',marginLeft:1,backgroundColor:'white'}}>
                        <Text style={{color:'gray'}}>How to</Text>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => this.tabChanged(REVIEW)}
                                        style={{flex:1,justifyContent:'center',alignItems:'center',marginLeft:1,backgroundColor:'white'}}>
                        <Text style={{color:'gray'}}>Review</Text>
                    </TouchableHighlight>
                </View>
                <View
                    style={{height:200,marginTop:8,justifyContent:'center',alignItems:'center'}}>
                    {
                        this.renderTabs(this.state.currentTab)
                    }


                </View>
            </ScrollView>
        );

    }

    onStarRatingPress(rating) {
        debugger
        this.setState({
            starCount: rating
        });

        console.log(rating);
    }

}