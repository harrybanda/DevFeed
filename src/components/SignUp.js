import React from "react";
import { Image, ImageBackground } from "react-native";
import { Container, Header, Content, Form, Item, Input, Button, Text, Icon } from "native-base";
import { firebase } from "../../App";
import { Actions } from 'react-native-router-flux';

export default class SignUp extends React.Component {
    constructor() {
        super()
        this.state = {
            username: '',
            email: '',
            password: '',
            error: '',
            loading: false
        }
    }

    onSignUpPress() {
        this.setState({ error: '', loading: true });
        const { email, password, username } = this.state;
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ error: '', loading: false });
                firebase.database().ref('users/' + firebase.auth().currentUser.uid).set({
                    email: this.state.email,
                    username: this.state.username
                });
                Actions.news()
            })
            .catch(() => {
                this.setState({ error: 'Authentication Failed', loading: false })
            })

    }

    renderButtonOrLoading() {
        if (this.state.loading) {
            return <Text>Loading...</Text>
        }
        return (
            <Content>
                <Form>
                    <Button style={{ marginTop: 10 }} block success onPress={this.onSignUpPress.bind(this)}>
                        <Text>Create Account</Text>
                    </Button>
                </Form>
            </Content>
        );
    }

    render() {
        return (
            <Container>
                <Content>
                    <Form
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{ marginTop: 100, fontWeight: 'bold', fontSize: 30 }}>Sign up to DevFeed</Text>
                    </Form>
                    <Form style={{ marginTop: 30, marginLeft: 70, marginRight: 70 }}>

                        <Item>
                            <Icon  style={{ color: '#757575' }}  name='account-circle' />
                            <Input
                                placeholder="Username"
                                onChangeText={username => this.setState({ username })}
                                value={this.state.username}
                            />
                        </Item>
                        <Item>
                            <Icon style={{ color: '#757575' }} name='email' />
                            <Input

                                placeholder="Email"
                                onChangeText={email => this.setState({ email })}
                                value={this.state.email}
                            />
                        </Item>
                        <Item last>
                            <Icon style={{ color: '#757575' }} name='lock' />
                            <Input
                                placeholder="Password"
                                secureTextEntry
                                onChangeText={password => this.setState({ password })}
                                value={this.state.password}
                                style={{ borderBottomColor: '#fff' }}
                            />
                        </Item>
                        <Text>{this.state.error}</Text>
                        {this.renderButtonOrLoading()}
                        <Button style={{ marginTop: 20 }} transparent onPress={() => Actions.login()}>
                            <Text>Existing user? Login</Text>
                        </Button>
                    </Form>
                </Content>
            </Container>
        );
    }
} 
