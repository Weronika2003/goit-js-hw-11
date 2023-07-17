import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import ImagesAPIService from './ImagesAPIService';
import createMarkup from './CreateMarkup';
import LoadMoreBtn from './loadMoreBtn';

const imagesAPIService = new ImagesAPIService();
const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  isHidden: true,
});

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  buttonEl: document.querySelector("button[type='submit']"),
};
const { form, gallery, buttonEl } = refs;

const container = document.createElement('div');
container.className = 'search-container';
while (form.firstChild) {
  container.appendChild(form.firstChild);
}
form.appendChild(container);
buttonEl.textContent = '🔍';

form.addEventListener('submit', onSubmit);
loadMoreBtn.button.addEventListener('click', onLoadMore);

let lightbox = null;

async function appendImages() {
  const currentPage = imagesAPIService.page;

  try {
    const { hits, totalHits } = await imagesAPIService.getImages();
    if (hits.length === 0) {
      onInvalidInput();
    }
    if (currentPage === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    const nextPage = imagesAPIService.page;
    const maxPage = Math.ceil(totalHits / 40);
    if (nextPage > maxPage) {
      loadMoreBtn.hide();
    }

    gallery.insertAdjacentHTML('beforeend', createMarkup(hits));
    checkingLightbox();
  } catch (err) {
    onError(err);
  }
  loadMoreBtn.enable();
}

function onLoadMore() {
  loadMoreBtn.disable();
  appendImages();
  smoothScrollToNextCards();
  lightbox.refresh();
}

function onSubmit(e) {
  e.preventDefault();
  const inputValue = form.elements.searchQuery.value.trim();

  if (inputValue === '') {
    Notiflix.Notify.warning('Empty query');
    return;
  }

  clearNewsList();
  imagesAPIService.setSearchValue(inputValue);
  loadMoreBtn.show();

  imagesAPIService.resetPage();
  appendImages()
    .catch(onError)
    .finally(() => form.reset());
}

function checkingLightbox() {
  if (!lightbox) {
    lightbox = new SimpleLightbox('.gallery a', {
      captions: true,
      captionDelay: 250,
    });
  } else {
    lightbox.refresh();
  }
}

function clearNewsList() {
  gallery.innerHTML = '';
}

function onError(err) {
  console.error(err);
  clearNewsList();
  loadMoreBtn.hide();
}

function onInvalidInput() {
  throw new Error(
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    )
  );
  return;
}

function smoothScrollToNextCards() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
