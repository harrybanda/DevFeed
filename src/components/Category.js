import React from "react";
import { Container, Content, Spinner, Text, Title, List, ListItem, Body, Thumbnail, Left, Right, Button, Icon, Item, Input, Header } from "native-base";
import { firebase } from "../../App";
import { Actions } from 'react-native-router-flux';
import SearchInput, { createFilter } from 'react-native-search-filter';

const KEYS_TO_FILTERS = ['name'];

export default class Category extends React.Component {
  constructor() {
    super()
    this.state = {
      data: [],
      searchTerm: '',
      loading: true
    }
    this.itemsRef = firebase.database().ref('feeds');
  }

  searchUpdated(term) {
    this.setState({ searchTerm: term })
  }

  onAddPress(titleData) {
    this.props.clear();

    let data = [ ...this.state.data ];
    data[titleData._key].added = true;
    this.setState({ data });

    firebase.database()
      .ref('users/' + firebase.auth().currentUser.uid + '/feeds/' + titleData._key)
      .set({
        url: titleData.url,
        name: titleData.name,
        image: titleData.image
      })
  }

  listenForItems(itemsRef) {
    this.setState({ loading: true });
    itemsRef.on('value', (snap) => {
      var items = [];
      snap.forEach((child) => {
        items.push({
          url: child.val().url,
          name: child.val().name,
          image: child.val().image,
          added: false,
          _key: child.key
        });
      });
      this.setState({ data: items });
      this.setState({ loading: false });
    });
  }

  checkAdded(titleData) {
    if (!this.state.data[titleData._key].added) {
      return <Icon style={{ color: '#757575' }} name='add' />
    } else {
      return <Text style={{ color: '#757575' }}>added</Text>
    }
  }

  componentDidMount() {
    this.listenForItems(this.itemsRef);
  }

  loadList(titles) {
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
      return titles;
    }
  }

  render() {
    const filter = this.state.data.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
    var that = this;
    let titles = filter.map(function (titleData) {
      return (
        <List key={titleData._key}>
          <ListItem>
            <Thumbnail square small source={{ uri: titleData.image }} />
            <Body>
              <Text>{titleData.name}</Text>
            </Body>
            <Button transparent onPress={() => that.onAddPress(titleData)}>
              {that.checkAdded(titleData)}
            </Button>
          </ListItem>
        </List>
      );
    });
    return (
      <Container>
        <Header searchBar>
          <Left>
            <Button transparent onPress={(Actions.pop)}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Item>
            <Icon name="search" />
            <Input
              placeholder="Search"
              onChangeText={(term) => { this.searchUpdated(term) }}
            />
          </Item>
        </Header>
        <Content>{this.loadList(titles)}</Content>
      </Container>
    );
  }

} 
