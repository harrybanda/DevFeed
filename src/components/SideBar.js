import React from "react";
import { Image, Alert } from "react-native";
import { Content, Container, Text, Button, List, ListItem, Thumbnail, Body, Icon } from "native-base";
import { firebase } from "../../App";
import { Actions } from 'react-native-router-flux';
import { Constants } from "expo/src/BarCodeScanner";

export default class SideBar extends React.Component {
    constructor() {
        super()
        this.state = {
            data: [],
            empty: false
        }
        this.itemsRef = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/feeds/');
    }

    logout() {
        firebase.auth().signOut().then(() => {
            Actions.login({ type: "reset" })
        });
    }

    delete(titleData) {
        this.props.clear();
        firebase.database()
            .ref('users/' + firebase.auth().currentUser.uid + '/feeds/' + titleData._key)
            .remove();
    }

    checkDB() {
        var that = this;
        this.itemsRef.on('value', function (snapshot) {
            if (snapshot.exists())
                that.setState({ empty: false });
            else
                that.setState({ empty: true });
        });
    }

    onDeletePress(titleData) {
        Alert.alert(
            'Delete Subscription',
            'Remove ' + titleData.name + '?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Remove', onPress: () => this.delete(titleData) },
            ],
            { cancelable: false }
        )
    }

    componentDidMount() {
        this.checkDB();
    }

    displayList(titles) {
        if (this.state.empty) {
            return (
                <Content
                    contentContainerStyle={{
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                    <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#BDBDBD' }}>Empty List</Text>
                </Content>
            );
        } else {
            return titles
        }
    }

    render() {
        var that = this;
        let titles = this.props.urls.map(function (titleData) {
            return (
                <List key={titleData._key}>
                    <ListItem avatar>
                        <Thumbnail square small source={{ uri: titleData.image }} />
                        <Body>
                            <Text>{titleData.name}</Text>
                        </Body>
                        <Button transparent onPress={() => that.onDeletePress(titleData)}>
                            <Icon style={{ color: '#757575' }} name='delete' />
                        </Button>
                    </ListItem>
                </List>
            );
        });
        return (
            <Container style={{ backgroundColor: '#ffffff' }}>
                <Content>
                    <Content
                        contentContainerStyle={{
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: '#2196F3',
                            height: 180
                        }}>
                        <Image
                            square
                            style={{ height: 80, width: 70 }}
                            source={require('../images/ic_account_circle.png')}
                        />
                        <Text style={{ fontWeight: 'bold', color: '#fff' }}>{firebase.auth().currentUser.email}</Text>
                    </Content>

                    <Content>
                        <Text note style={{ fontWeight: 'bold', marginTop: 5, marginLeft: 17, marginBottom: 10 }}>
                            Subscriptions
                       </Text>

                        {that.displayList(titles)}

                        <Button style={{ marginBottom: 5 }} transparent onPress={this.logout.bind(this)}>
                            <Text>Logout</Text>
                        </Button>
                    </Content>
                </Content>
            </Container>
        );
    }

} 
