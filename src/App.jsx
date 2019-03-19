import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: "",
      images: [],
      searchTermsList: [], 
      error: null
    }
  }

  openSearchTermsList = (event) => {
    if (this.state.searchTermsList !== undefined && this.state.searchTermsList !== [])
    {
      return(
        <div className="searchTermsSelect">
          <select value={this.state.searchTerm} onChange={this.searchImages}>
            {this.showSearchTermsList()}
          </select>
        </div>
      );
    }
  }

  showSearchTermsList = () => {
    return(this.state.searchTermsList.map((searchTermItem) => {
      return (
        <option value={searchTermItem}>{searchTermItem}</option>
      );
    }));
  }

  showImages() {
    if (this.state.images !== undefined && this.state.images !== [])
    {
      return(this.state.images.map((image) => {
        const imageUrl = "https://farm" + image.farm + ".staticflickr.com/" + image.server + "/" + image.id + "_" + image.secret + ".jpg";
        return (
        <div className="Photo">
          <img src={imageUrl} alt="Could not be displayed"/>
        </div>
        )
      }))
    }  
  }

  searchImages = (event) => {
    const searchTerm = event.target.value;
    if (searchTerm !== undefined && searchTerm !== "")
    {
      const cachedResult = localStorage.getItem(searchTerm);
      if(cachedResult) {
        this.setState({ searchTerm, images: JSON.parse(cachedResult) });
        return;
      }

      const searchTermsList = [...this.state.searchTermsList];

      searchTermsList.push(searchTerm);
      localStorage.setItem(searchTermsList, JSON.stringify(searchTermsList));

      fetch("https://api.flickr.com/services/rest/?method=flickr.photos.search&safe_search=1&format=json&nojsoncallback=1&api_key=bac9f1ccfd854f27894fd47c4f01b1e8&content_type=1&is_getty=1&text=" + searchTerm)
        .then(res => res.json())
        .then(
          (result) => {
            localStorage.setItem(searchTerm, JSON.stringify(result.photos.photo));
            this.setState({searchTerm, images: result.photos.photo, searchTermsList });
          },
          (error) => {
            console.log(error);
            this.setState({error});
          }
        )
    }
    else
    {
      this.setState({searchTerm: "", images: []});
    }
  }

  render() {
    return (
      <div className="App">
        <div className="AppHeader">
          <h1>Image Gallery</h1>
          <form>
            <input 
              type="text" 
              name="searchTerm" 
              value={this.state.searchTerm} 
              placeholder="search for images...."
              onChange={this.searchImages}
            />
            <div className="selectList">
              {this.openSearchTermsList()}
            </div>
          </form>         
        </div>
        <div className="Gallery">
          {this.showImages()}
        </div>
        <div className="Notice">
          <p>
            This product uses the Flickr API but is not endorsed or certified by SmugMug, Inc.
          </p>
        </div>
      </div>
    );
  }
}

export default App;
