document.addEventListener("DOMContentLoaded", () => {
  const movieName = document.querySelector(".search__input");
  const searchButton = document.querySelector("#search-btn");
  const resultWrapper = document.querySelector("#result");
  const paginationWrapper = document.querySelector("#pagination");
  const form = document.querySelector("#search__form--film");
  const key = "abfdbba4";
  const itemsPerPage = 10;
  let currentPage = 1;
  let totalResults = 0;
  let isLoading = false;

  function searchFilmHandler(page = 1) {
    if (isLoading) {
      return;
    }
    const getMovieName = movieName.value.trim("");
    const getYear = document.getElementById("y")?.value.trim();
    const ApiUrl = `http://www.omdbapi.com/?s=${getMovieName}&apikey=${key}&page=${page}&plot=full${
      getYear ? `&y=${getYear}` : ""
    }`;
    resultWrapper.innerHTML = "";
    paginationWrapper.innerHTML = "";
    if (getMovieName.length === 0) {
      resultWrapper.innerHTML = `<h3 class="msg">Введите название фильма</h3>`;
      return;
    }
    isLoading = true;
    showLoadingIndicator();

    fetch(ApiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Ошибка отправки запроса! Статус: ${response.status}`
          );
        }
        return response.json();
      })
      .then((data) => {
        if (data.Error) {
          resultWrapper.innerHTML = `<h3 class="msg">${data.Error}</h3>`;
        } else {
          totalResults = parseInt(data.totalResults);
        }
        const detailedRequests = data.Search.map((movie) =>
          fetch(
            `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${key}&plot=full`
          )
            .then((response) => response.json())
            .then((detailedData) => {
              movie.Plot = detailedData.Plot;
              return movie;
            })
            .catch((error) => {
              console.error(
                "Ошибка при получении дополнительных данных:",
                error
              );
              return movie;
            })
        );
        Promise.all(detailedRequests)
          .then((updatedMovies) => {
            renderMovies(updatedMovies);
            renderPagination();
            initModal();
          })
          .catch((error) =>
            console.error("Ошибка при ожидании завершения запросов:", error)
          )
          .finally(() => {
            isLoading = false;
            hideLoadingIndicator();
          });
      })
      .catch((error) => {
        console.error("Ошибка при получении данных:", error);
        resultWrapper.innerHTML = `<h3 class="msg">Произошла ошибка при получении данных. Временные работы на сервере. Приносим извинения за предоставленные неудобства!</h3>`;
        paginationWrapper.innerHTML = "";
        isLoading = false;
        hideLoadingIndicator();
      });
  }

  function showLoadingIndicator() {
    resultWrapper.innerHTML = `<div class="loading-skeleton"></div>`;
  }

  function hideLoadingIndicator() {
    const loadingSkeleton = document.querySelector(".loading-skeleton");
    if (loadingSkeleton) {
      resultWrapper.removeChild(loadingSkeleton);
    }
  }

  function renderMovies(movies) {
    resultWrapper.innerHTML = movies
      .map((movie) => {
        console.log(movie);
        return `
          <div class="info">
            <img src=${movie.Poster} class="poster">
            <div class="info__wrapper">
              <h2>${movie.Title}</h2>
              <div class="details">
                <span>${movie.Year}</span>
                <span>${movie.Type}</span>
              </div>
              <button class="button modal__information" data-micromodal-trigger="modal-${
                movie.imdbID
              }">
                <span class="modal__signature">Details</span>
              </button>
      
              <div class="modal micromodal-slide" id="modal-${
                movie.imdbID
              }" aria-hidden="true">
                <div class="modal-overlay" tabindex="-1" data-micromodal-close>
                  <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-${
                    movie.imdbID
                  }-title">
                    <header class="modal-header">
                      <h2 class="modal-title" id="modal-${
                        movie.imdbID
                      }-title">Micromodal</h2>
                      <button class="modal-close" aria-label="Close modal" data-micromodal-close></button>
                    </header>
                    <div class="modal-content" id="modal-${
                      movie.imdbID
                    }-content">
                      <p class="modal-text">${
                        movie.Plot || "Информация отсутствует"
                      }</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function initModal() {
    MicroModal.init({
      disableScroll: true,
      awaitOpenAnimation: true,
      awaitCloseAnimation: true,
    });
  }

  function renderPagination() {
    const totalPage = Math.ceil(totalResults / itemsPerPage);
    const maxButtons = 5;
    const halfMaxButtons = Math.floor(maxButtons / 2);

    let startPage = Math.max(1, currentPage - halfMaxButtons);
    let endPage = Math.min(startPage + maxButtons - 1, totalPage);

    if (totalPage - endPage < halfMaxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    paginationWrapper.innerHTML = Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    )
      .map(
        (pageNumber) =>
          `<li class="pagination__item swiper-slide"><button class="pagination-btn" data-page="${pageNumber}" type="button">${pageNumber}</button></li>`
      )
      .join("");

    const paginationButtons = document.querySelectorAll(".pagination-btn");
    paginationButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const page = parseInt(button.dataset.page);
        currentPage = page;
        searchFilmHandler(page);
      });
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
  searchButton.addEventListener("click", () => searchFilmHandler(currentPage));
});
