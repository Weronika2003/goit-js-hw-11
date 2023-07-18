import axios from 'axios';
const API_KEY = '38295997-c79217038b4f657b51b1fa265';
const MAIN_URL = 'https://pixabay.com/api/';

export default class ImagesAPIService {
  constructor() {
    this.page = 1;
    this.searchValue = '';
  }

  async getImages() {
    const url = `${MAIN_URL}?key=${API_KEY}&q=${this.searchValue}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.page}&per_page=40`;
    const response = await axios.get(url);
    this.incrementPage();

    return response.data;
  }

  setSearchValue(query) {
    this.searchValue = query;
  }

  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }
}
