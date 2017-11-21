import React from 'react';
import { StyleSheet, StatusBar } from "react-native";
import { Container, Content, StyleProvider, Spinner } from "native-base";
import { Router, Scene, Actions } from 'react-native-router-flux';
import NavigationStateHandler from 'react-native-router-flux-focus-hook'

import News from "./src/components/News";
import Category from "./src/components/Category";
import LogIn from "./src/components/LogIn";
import SignUp from "./src/components/SignUp";

import getTheme from "./src/native-base-theme/components";
import commonColor from "./src/native-base-theme/variables/commonColor";
import Expo from "expo";
import * as firebase from 'firebase';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "<KEY>",
  authDomain: "<Domain>",
  databaseURL: "<URL>",
  storageBucket: "<Bucket>",
};
firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isReady: false,
      logged: false,
      loading: true
    };
  }

  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf")
    });

    this.setState({ isReady: true });

    var that = this;

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        that.setState({
          logged: true,
          loading: false,
        });
      } else {
        that.setState({ loading: false })
      }
    })
  }

  render() {
    const navigationStateHandler = new NavigationStateHandler()

    if (!this.state.isReady) {
      return <Expo.AppLoading />;
    }
    if (this.state.loading) {
      return (
        <Container style={{ flex: 1 }}>
          <Content
            contentContainerStyle={{
              justifyContent: "center",
              alignItems: "center",
              flex: 1
            }}>
            <Spinner color='blue' />
          </Content>
        </Container>
      );

    }
    return (
      <StyleProvider style={getTheme(commonColor)}>
        <Container style={styles.container}>
          <Router
            createReducer={navigationStateHandler.getReducer.bind(navigationStateHandler)}
            navigationStateHandler={navigationStateHandler}
          >
            <Scene key="login" component={LogIn} hideNavBar="true" initial={!this.state.logged} />
            <Scene key="news" component={News} hideNavBar="true" initial={this.state.logged} />
            <Scene key="signup" component={SignUp} hideNavBar="true" />
            <Scene key="category" component={Category} hideNavBar="true" />
          </Router>
        </Container>
      </StyleProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export { firebase };