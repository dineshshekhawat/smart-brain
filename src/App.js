import React, { Component } from 'react';
import Particles from 'react-particles-js';

import './App.css';

import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';

const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user : {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  }

  calculateFaceLocation = (response) => {
    console.log('calculateFaceLocation() called with response', response);

    const clarifaiFace = response.outputs[0].data.regions[0].region_info.bounding_box;
    console.log('clarifaiFace', clarifaiFace);

    const image = document.getElementById('inputImage');

    const width = Number(image.width);
    console.log('width', width);

    const height = Number(image.height);
    console.log('height', height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    };
  }

  displayFaceBox = (box) => {
    console.log('displayFaceBox() called with box', box);
    this.setState({box: box});
  }

  onInputChange = (event) => {
    const inputValue = event.target.value;
    // console.log('inputValue:', inputValue);
    this.setState({input: inputValue});
  }

  onPictureSubmit = () => {
    const inputValue = this.state.input;
    this.setState({imageUrl: inputValue});
    
    fetch('https://dry-brook-80875.herokuapp.com/imageUrl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        console.log('chain 2 response', response);
        this.displayFaceBox(this.calculateFaceLocation(response));
        
        console.log('Send a PUT request with current user state', this.state.user);
        fetch('https://dry-brook-80875.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries: count }));
          console.log('after entry count update current user state', this.state.user);
        })
        .catch(console.log);
      })
      .catch(error => console.log(error));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
    }

    this.setState({route: route})
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles
          className='particles'
          params={particlesOptions} />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}/>
        { route === 'home' ?
          ( 
            <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onPictureSubmit={this.onPictureSubmit} />
              <FaceRecognition
                box={box}
                imageUrl={imageUrl} />
            </div>
          )

          : 
          
          (
            this.state.route === 'signin' ?

            <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>

            :

            <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> 
          )

        }
      </div>
    );
  }
}

export default App;
