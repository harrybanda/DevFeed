import React from "react";
import { Image, ImageBackground, Spinner } from "react-native";
import { Container, Header, Content, Form, Item, Input, Button, Text, Icon } from "native-base";
import { firebase } from "../../App";
import { Actions } from 'react-native-router-flux';

export default class LogIn extends React.Component {
    constructor() {
        super()
        this.state = {
            email: '',
            password: '',
            error: '',
            loading: false
        }
    }

    onLogInPress() {
        this.setState({ error: '', loading: true });
        const { email, password } = this.state;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ error: '', loading: false });
                Actions.news();
            })
            .catch(() => {
                this.setState({ error: 'Authentication Failed', loading: false })
            })

    }

    renderButtonOrLoading() {
        if (this.state.loading) {
            return <Text style={{ color: '#fff' }}>Loading...</Text>
        }
        return (
            <Content>
                <Form style={{
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                >
                    <Button style={{ marginTop: 10, backgroundColor: "#03A9F4" }} block primary onPress={this.onLogInPress.bind(this)}>
                        <Text>LogIn</Text>
                    </Button>

                    <Text style={{ marginTop: 10, marginBottom: 10, color: "#fff" }}>Don't have an account?</Text>
                    <Button block bordered light onPress={()=> Actions.signup()}>
                        <Text>SignUp</Text>
                    </Button>
                </Form>
            </Content>
        );
    }

    render() {
        return (
            <Container>
                <ImageBackground
                    source={require('../images/login_bg.png')}
                    style={{
                        flex: 1,
                    }}>
                    <Form
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center'}}
                    >
                    <Image style={{marginTop: 80, width: 260, height: 143 }} source={require('../images/logo.png')} />
                    </Form>
                    <Content>
                        <Form style={{ marginTop: 30, marginLeft: 70, marginRight: 70 }}>
                            <Item>
                                <Icon active style={{ color: '#fff' }} name='email' />
                                <Input
                                    placeholderTextColor="#fff"
                                    placeholder="Email"
                                    onChangeText={email => this.setState({ email })}
                                    value={this.state.email}
                                />
                            </Item>
                            <Item last>
                                <Icon active style={{ color: '#fff' }} name='lock' />
                                <Input
                                    placeholderTextColor="#fff"
                                    placeholder="Password"
                                    secureTextEntry
                                    onChangeText={password => this.setState({ password })}
                                    value={this.state.password}
                                    style={{ borderBottomColor: '#fff' }}
                                />
                            </Item>
                            <Text style={{ color: '#fff' }}>{this.state.error}</Text>
                            {this.renderButtonOrLoading()}
                        </Form>
                    </Content>
                </ImageBackground>
            </Container>
        );
    }

} 
