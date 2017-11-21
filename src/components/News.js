import React from "react";
import { Linking, BackHandler, Image } from "react-native";
import { Drawer, Spinner, Form, Content, List, ListItem, Body, Thumbnail, Text, Header, Container, Left, Right, Title, Icon, Button } from "native-base";
import { Actions } from 'react-native-router-flux';
import { firebase } from "../../App";
import TimeAgo from 'react-native-timeago'
import SideBar from './SideBar';

var DOMParser = require('xmldom').DOMParser;

export default class News extends React.Component {

  closeDrawer() {
    this.drawer._root.close();
  };
  openDrawer() {
    this.drawer._root.open();
  };

  constructor() {
    super()
    this.state = {
      data: [],
      news: [],
      urls: [],
      empty: false,
      loading: true,
      loadingUrls: true
    }
    this.itemsRef = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/feeds/');
  }

  listenForItems(itemsRef) {
    this.setState({ loadingUrls: true });
    itemsRef.on('value', (snap) => {
      var items = [];
      snap.forEach((child) => {
        items.push({
          url: child.val().url,
          name: child.val().name,
          image: child.val().image,
          _key: child.key
        });
      });
      this.setState({ urls: items });
      this.fetchData();
    })
  }

  clearArrays() {
    this.setState({ news: [] });
    this.setState({ data: [] });
  }

  checkDB(titleData) {
    var that = this;
    this.itemsRef.on('value', function (snapshot) {
      if (snapshot.exists()) {
        that.setState({ empty: false });
      } else {
        that.setState({ empty: true });
      }
    });
  }

  loadList(articles) {
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
            <Text style={{ marginTop: 20, marginBottom: 50, fontWeight: 'bold', color: '#BDBDBD' }}>Loading</Text>
          </Content>
        </Container>
      );
    } else {
      return articles;
    }
  }

  fetchData() {
    this.setState({ loading: true });
    return Promise.all(
      this.state.urls.map(url => fetch(url)
        .then(response => response.text())
        .then(responseData => {
          this.setState(
            (prevState, props) => ({
              data: [...prevState.data, ...this.extractData(responseData, url)]
            })
          );
        })
        .catch(err => console.error(err))
      )
    ).then(result => {
      this.sortData();
      this.setState({ news: this.state.data });
      this.setState({ loading: false });
    }, err => {
      console.error(err)
    });
  }

  componentDidMount() {
    this.listenForItems(this.itemsRef)
    this.props.navigationStateHandler.registerFocusHook(this)
    BackHandler.addEventListener('hardwareBackPress', function () {
      BackHandler.exitApp();
    });
    this.checkDB();
  }

  componentWillUnmount() {
    this.props.navigationStateHandler.unregisterFocusHook(this)
  }

  handleNavigationSceneFocus() {
    this.setState({ news: [] });
    this.setState({ data: [] });
    this.fetchData();
  }

  sortData() {
    this.state.data.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  }

  extractData(text, url) {
    var doc = new DOMParser().parseFromString(text, 'text/xml');
    var items_array = [];
    var items = doc.getElementsByTagName('item');

    for (var i = 0; i < items.length; i++) {
      items_array.push({
        title: items[i].getElementsByTagName('title')[0].lastChild.data,
        description: items[i].getElementsByTagName('description')[0].lastChild.data,
        link: items[i].getElementsByTagName('link')[0].textContent,
        date: items[i].getElementsByTagName('pubDate')[0].textContent,
        name: url.name
      })
    }
    return items_array;
  }

  onListPress(articleData) {
    Linking.openURL(articleData.link)
      .catch(err =>
        console.error('An error occurred', err)
      )
  }

  displayList(articles) {
    const goToCategory = () => Actions.category({clear: this.clearArrays.bind(this)});
    if (this.state.empty) {
      return (
        <Container style={{ flex: 1 }}>
          <Content
            contentContainerStyle={{
              justifyContent: "center",
              alignItems: "center",
              flex: 1
            }}>
            <Image
              style={{ height: 80, width: 80, marginBottom: 10 }}
              source={require('../images/empty.png')}
            />
            <Text style={{ marginBottom: 20, fontWeight: 'bold', color: '#BDBDBD' }}>Your feed list is empty</Text>
            <Form>
              <Button iconLeft small success
                style={{ justifyContent: 'center', marginBottom: 90 }}
                onPress={goToCategory}>
                <Icon name='add' />
                <Text>Add Feeds</Text>
              </Button>
            </Form>
          </Content>
        </Container>
      );
    } else {
      return (this.loadList(articles));
    }
  }

  render() {
    var that = this;
    const goToCategory = () => Actions.category({clear: this.clearArrays.bind(this)});
    let articles = this.state.news.map(function (articleData, index) {
      return (
        <List key={index}>
          <ListItem button onPress={() => that.onListPress(articleData)}>
            <Thumbnail square source={{ uri: articleData.thumbnail }} />
            <Body>
              <Text style={{ fontWeight: 'bold' }}>{articleData.title}</Text>
              <Text note numberOfLines={2}>{articleData.description.replace(/<{1}[^<>]{1,}>{1}/g, "")}</Text>
              <Text style={{ color: "#2196F3", fontWeight: 'bold' }} note>
                {articleData.name}{" . "}
                <TimeAgo time={articleData.date} /></Text>
            </Body>
          </ListItem>
        </List>
      );
    });
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<SideBar clear={this.clearArrays.bind(this)} data={this.state.data} news={this.state.news} urls={this.state.urls} navigator={this.navigator} />}
        onClose={() => this.closeDrawer()}>
        <Container>
          <Header>
            <Left>
              <Button transparent onPress={() => (this.openDrawer())}>
                <Icon name="menu" />
              </Button>
            </Left>
            <Body>
              <Title>DevFeed</Title>
            </Body>
            <Right>
              <Button transparent onPress={goToCategory}>
                <Icon name="add" />
              </Button>
            </Right>
          </Header>
          <Content>{that.displayList(articles)}</Content>
        </Container>
      </Drawer>
    );
  }

}