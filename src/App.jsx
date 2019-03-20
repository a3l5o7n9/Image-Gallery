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
      selectedSearchType: "singleTerm",
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

  openSearchTermsList = () => {
    if (this.state.searchTermsList !== undefined && this.state.searchTermsList !== []) {
      return (
        <div className="searchTermsSelect">
          <select multiple={true} value={this.state.selectedSearchTerms} onChange={this.searchImages}>
            {this.showSearchTermsList()}
          </select>
        </div>
      );
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

  searchImages = (event) => {
    const searchTerm = event.target.value;
    let selectedSearchTerms = this.state.selectedSearchTerms;
    const selectedSearchType = this.state.selectedSearchType;
    let tagString = "";
    let tagModeString = "&tag_mode=any";

    if (searchTerm !== undefined && searchTerm !== "") {
      const cachedResult = localStorage.getItem(searchTerm);
      if (cachedResult) {
        const searchTermImages = JSON.parse(cachedResult);

        switch (selectedSearchType) {
          case "singleTerm":
            {
              this.setState({ searchTerm, selectedSearchTerms: [searchTerm], images: searchTermImages });
              return;
            }
          default:
            {
              break;
            }
        }
      }

      if (selectedSearchType === "multipleTermAND" || selectedSearchType === "multipleTermOR") {
        if (selectedSearchTerms.includes(searchTerm)) {
          selectedSearchTerms.splice(selectedSearchTerms.indexOf(searchTerm), 1);
        }
        else {
          selectedSearchTerms.push(searchTerm);
        }

        tagString = "&tags=" + selectedSearchTerms[0];

        for (var i = 1, l = selectedSearchTerms.length; i < l; i++) {
          tagString += "%2C" + selectedSearchTerms[i];
        }
      }

      switch (selectedSearchType) {
        case "singleTerm":
          {
            const searchTermsList = [...this.state.searchTermsList];

            searchTermsList.push(searchTerm);
            localStorage.setItem("searchTermsList", JSON.stringify(searchTermsList));

            fetch("https://api.flickr.com/services/rest/?method=flickr.photos.search&safe_search=1&format=json&nojsoncallback=1&api_key=bac9f1ccfd854f27894fd47c4f01b1e8&content_type=1&is_getty=1&per_page=100&text=" + searchTerm)
              .then(res => res.json())
              .then(
                (result) => {
                  localStorage.setItem(searchTerm, JSON.stringify(result.photos.photo));
                  this.setState({ searchTerm, selectedSearchTerms, images: result.photos.photo, searchTermsList });
                },
                (error) => {
                  console.log(error);
                  this.setState({ error });
                }
              )
            return;
          }
        case "multipleTermAND":
          {
            tagModeString = "&tag_mode=all";
            break;
          }
        case "multipleTermOR":
          {
            tagModeString = "&tag_mode=any";
            break;
          }
        default:
          {
            break;
          }
      }

      fetch("https://api.flickr.com/services/rest/?method=flickr.photos.search&safe_search=1&format=json&nojsoncallback=1&api_key=bac9f1ccfd854f27894fd47c4f01b1e8&content_type=1&is_getty=1&per_page=100" + tagString + tagModeString)
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
      this.setState({ searchTerm: "", selectedSearchTerms: [""], images: [] });
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
            <div className="searchTypes">
              <select value={this.state.selectedSearchType} onChange={this.changeSearchType}>
                <option value="singleTerm">Single Term</option>
                <option value="multipleTermAND">Multiple - AND</option>
                <option value="multipleTermOR">Multiple - OR</option>
              </select>
            </div>
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
