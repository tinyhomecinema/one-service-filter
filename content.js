(function () {
  "use strict";

  // Checks if the current page is the watchlist and a service was selected
  if (!window.location.href.includes("/on/")
    || window.location.href.includes("/no-services/")
    || window.location.href.includes("/favorite-services/")
    || window.location.href.includes("/films/")) {
  return;
  }

  var films;

  if (window.location.href.includes("/watchlist/")) {
    films = document.getElementsByClassName('poster-list -p125 -grid -constrained')[0];
  } else {
    films = document.getElementsByClassName('js-list-entries poster-list -p125 -grid film-list')[0];
  }

  // Remove nodes which are not film nodes
  for (var i = films.childNodes.length-1; i >= 0; i--) {
    var node = films.childNodes[i];
    if (!node.attributes) {
      films.removeChild(node);
    }
  }

  var numberOfFilms = films.childNodes.length;

  if (numberOfFilms > 0) {
    var servicesSubMenu = document.getElementById('services-menu');
    var newItem = document.createElement('LI');
    var text = document.createTextNode('On selected service only');
    var link = document.createElement('A');
    newItem.setAttribute('class', '');
    link.setAttribute('class', 'item');
    link.setAttribute('style', 'cursor: pointer');
    link.appendChild(text);
    newItem.appendChild(link);
    newItem.addEventListener('click', processPage);
    servicesSubMenu.insertBefore(newItem, servicesSubMenu.children[3]);
  }

  function processPage() {

    newItem.setAttribute('class', ' smenu-subselected');

    var servicesMenu = document.getElementById('services-menu').getElementsByClassName('item');
    var servicesList = [];
    var servicesUrls = [];
    var currentService;
    const pages = [];

    for (var i = 8; i < servicesMenu.length - 2; i++) {
      servicesList.push(servicesMenu[i].innerText);
      servicesUrls.push(servicesMenu[i].href);
      if (!servicesMenu[i].href) {
        currentService = servicesMenu[i].innerText;
      }
    }

    console.log("Current Service: " + currentService);

    if (currentService) {

      for (var i = 0; i < servicesUrls.length; i++) {
        if (servicesUrls[i]) {
          removeFilms(servicesUrls[i], i);
          // Run a second time due to some films
          // not being removed in the first run
          removeFilms(servicesUrls[i], i);
        }
      }

    }

    async function removeFilms(url, index) {

      let pageObject = await fetch(url);
      let pageText = await pageObject.text();
      let serviceName = servicesList[index];

      for (var i = 0; i < films.childNodes.length; i++) {

        try {
          var node = films.childNodes[i];

          var filmId = node.getElementsByTagName('div')[0].getAttributeNode('data-item-id').value;
          var filmName = node.getElementsByTagName('div')[0].getAttributeNode('data-film-name').value;

          if (pageText.search(filmId) != -1) {
            films.removeChild(node);
            console.log("'" + filmName + "' removed. Available also on '" + serviceName + "'");
            numberOfFilms--;
          }
        } catch {}
      }

      var numberOfFilmsPhrase;

      if (numberOfFilms > 1) {
        numberOfFilmsPhrase = "The " + numberOfFilms + " films in this page are only available on " + currentService + " (<a href=\"\/settings\/stores\/\">edit&nbsp;favorites</a>)."
      } else {
        numberOfFilmsPhrase = "The film in this page is only available on " + currentService + " (<a href=\"\/settings\/stores\/\">edit&nbsp;favorites</a>)."
      }

      document.getElementsByClassName('ui-block-heading')[0].innerHTML = numberOfFilmsPhrase;
      newItem.removeEventListener('click', processPage);
      link.setAttribute('style', 'cursor: default');

    }
  }

})();
