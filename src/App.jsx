import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: "",
      images: [],
      searchTermsList: [],
      selectedSearchTerms: [],
      selectedSearchType: "any",
      error: null
    }
  }

  componentDidMount = () => {
    const searchTermsList = localStorage.getItem("searchTermsList");
    if (searchTermsList) {
      this.setState({ searchTermsList: JSON.parse(searchTermsList) });
    }
    else {
      this.setState({ searchTermsList: [""] });
    }
  }

  showSearchTermsList = () => {
    return (this.state.searchTermsList.map((searchTermItem) => {
      return (
        <option key={searchTermItem} value={searchTermItem}>{searchTermItem}</option>
      );
    }));
  }

  changeSearchType = (event) => {
    const selectedSearchType = event.target.value;

    this.setState({ selectedSearchType });
  }

  singleSearchImages = (event) => {
    const searchTerm = event.target.value;

    if (searchTerm !== undefined && searchTerm !== "") {
      const cachedResult = localStorage.getItem(searchTerm);
      if (cachedResult) {
        this.setState({ searchTerm, images: JSON.parse(cachedResult) });
        return;
      }

      const searchTermsList = [...this.state.searchTermsList];

      searchTermsList.push(searchTerm);
      localStorage.setItem("searchTermsList", JSON.stringify(searchTermsList));

      fetch("https://api.flickr.com/services/rest/?method=flickr.photos.search&safe_search=1&format=json&nojsoncallback=1&api_key=bac9f1ccfd854f27894fd47c4f01b1e8&content_type=1&is_getty=1&per_page=100&text=" + searchTerm)
        .then(res => res.json())
        .then(
          (result) => {
            localStorage.setItem(searchTerm, JSON.stringify(result.photos.photo));
            this.setState({ searchTerm, images: result.photos.photo, searchTermsList });
          },
          (error) => {
            console.log(error);
            this.setState({ error });
          }
        )
      return;
    }
    else {
      this.setState({ searchTerm: "", images: [] });
    }
  }

  multipleSearchImages = (event) => {
    const selectedSearchTerm = event.target.value;
    let selectedSearchTerms = this.state.selectedSearchTerms;
    const selectedSearchType = this.state.selectedSearchType;
    let tagString = "";

    if (selectedSearchTerm !== undefined && selectedSearchTerm !== "") {
      if (selectedSearchTerms.includes(selectedSearchTerm)) {
        selectedSearchTerms.splice(selectedSearchTerms.indexOf(selectedSearchTerm), 1);      
      }
      else {
        selectedSearchTerms.push(selectedSearchTerm);
      }

      tagString = selectedSearchTerms[0];

      for (var i = 1, l = selectedSearchTerms.length; i < l; i++) {
        tagString += "%2C" + selectedSearchTerms[i];
      }

      fetch("https://api.flickr.com/services/rest/?method=flickr.photos.search&safe_search=1&format=json&nojsoncallback=1&api_key=bac9f1ccfd854f27894fd47c4f01b1e8&content_type=1&is_getty=1&per_page=100&tags=" + tagString + "&tag_mode=" + selectedSearchType)
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({ selectedSearchTerms, images: result.photos.photo });
          },
          (error) => {
            console.log(error);
            this.setState({ error });
          }
        )
    }
    else {
      this.setState({ selectedSearchTerms: [""], images: [] });
    }
  }

  showImages() {
    if (this.state.images !== undefined && this.state.images !== []) {
      return (this.state.images.map((image) => {
        const imageUrl = "https://farm" + image.farm + ".staticflickr.com/" + image.server + "/" + image.id + "_" + image.secret + ".jpg";
        return (
          <div className="Photo" key={image.id}>
            <img src={imageUrl} alt="Could not be displayed" />
          </div>
        )
      }))
    }
  }

  clearSelection = (event) => {
    this.setState({ selectedSearchTerms: [] });
  }

  render() {
    return (
      <div className="App">
        <div className="AppHeader">
          <h1>Image Gallery</h1>
          <form>
            <div className="SingleTermSearch">
              <h3>Single Term Search</h3>
              <input
                type="text"
                name="searchTerm"
                value={this.state.searchTerm}
                placeholder="search for images...."
                onChange={this.singleSearchImages}
              />
              <div className="SingleSearchTermSelect">
                <select value={this.state.searchTerm} onChange={this.singleSearchImages}>
                  {this.showSearchTermsList()}
                </select>
              </div>
            </div>
            <div className="MultipleTermsSearch">
              <h3>Multiple Terms Search</h3>
              <div className="SearchTypes">
                <select value={this.state.selectedSearchType} onChange={this.changeSearchType}>
                  <option value="all">AND</option>
                  <option value="any">OR</option>
                </select>
              </div>
              <div className="SelectList">
                <div className="MultipleSearchTermsSelect">
                  <select multiple={true} value={this.state.selectedSearchTerms} onChange={this.multipleSearchImages}>
                    {this.showSearchTermsList()}
                  </select>
                </div>
                <div className="ClearButton">
                  <button title="ClearSelections" onClick={this.clearSelection}>
                    Clear Selections
                  </button>
                </div>
              </div>
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
