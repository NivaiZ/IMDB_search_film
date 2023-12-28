document.addEventListener("DOMContentLoaded", () => {
  const movieName = document.querySelector(".search__input");
  const searchButton = document.querySelector("#search-btn");
  const resultWrapper = document.querySelector("#result");
  const form = document.querySelector("#search__form--film");
  const key = "abfdbba4";

  function searchFilmHandler() {
    const getMovieName = movieName.value;
    const ApiUrl = `http://www.omdbapi.com/?s=${getMovieName}&apikey=${key}`;

    if (getMovieName.length <= 0) {
      resultWrapper.innerHTML = `<h3 class="msg">Введите название фильма</h3>`;
    }
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
        hideLoadingIndicator();
        if (data.Error) {
          resultWrapper.innerHTML = `<h3 class="msg">${data.Error}</h3>`;
        } else if (data.Search && data.Search.length > 0) {
          resultWrapper.innerHTML = data.Search.map((movie) => {
            return `
              <div class="info">
                <img src=${movie.Poster} class="poster">
                <div>
                    <h2>${movie.Title}</h2>
                    <div class="details">
                        <span>${movie.Year}</span>
                        <span>${movie.Type}</span>
                    </div>
                </div>
              </div>
            `;
          }).join("");
        } else {
          resultWrapper.innerHTML = `<h3 class="msg">Фильмы не найдены</h3>`;
        }
      })
      .catch((error) => {
        console.error("Ошибка при получении данных:", error);
        resultWrapper.innerHTML = `<h3 class="msg">Произошла ошибка при получении данных</h3>`;
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

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  searchButton.addEventListener("click", searchFilmHandler);
});
