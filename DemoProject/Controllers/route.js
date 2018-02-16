//import splash from './splash'
import React from 'react'
import Login from './Login'
import Splash from './splash'
import Registration from './Registration'
import HomeVC from './Home'
import productDetail from './productDetail'
import {StackNavigator} from 'react-navigation';


const RootNavigator = StackNavigator({

        Splash: {
            screen: Splash,
            navigationOptions: {
                headerMode: 'none',
                headerTintColor: 'blue'
            }
        },
        Home: {
            screen: HomeVC,
            navigationOptions: {
                headerMode: 'none',
                headerTintColor: 'blue'
            }
        },
        ProductDetail: {
            screen: productDetail,
            navigationOptions: {
                headerMode: 'none',
                headerTintColor: 'blue'
            }
        },
        Login: {
            screen: Login,
            navigationOptions: {
                title:"Login",
                headerMode : "float",
                headerBackTitle : 'Back',
                Header :'true'
            }
        },
        Registration: {
            screen: Registration,
            navigationOptions: {
                title:"Login",
                headerMode : "float",
                headerBackTitle : 'Back',
                Header :'true'
            }
        },


    },
    // {
    //     headerMode: 'none',
    //     navigationOptions: {
    //         gesturesEnabled: false,
    //     }
    // }
);

export default RootNavigator;