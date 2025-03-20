(function () {
  "use strict";

  // If user is not logged in, do not load menu item
  if (!document.body.getAttributeNode('class').value.includes("logged-in")) {return}

  var films;
  var numberOfFilms;

  // Get Services menu
  if (window.location.href.includes("/watchlist/")) {
      films = document.getElementsByClassName('poster-list -p125 -grid -constrained')[0];
      if (!films) {
        films = document.getElementsByClassName('poster-list -p125 -grid -scaled128')[0];
      }
  } else {
    films = document.getElementsByClassName('js-list-entries poster-list -p125 -grid film-list')[0];
  }

  // If there are no films on the list for the selected service, end the script
  try {
    numberOfFilms = films.childNodes.length;
  } catch {
    return;
  }

  // Remove nodes which are not film nodes
  for (let i = numberOfFilms-1; i >= 0; i--) {
    var node = films.childNodes[i];
    if (!node.attributes) {
      films.removeChild(node);
    }
  }

  numberOfFilms = films.childNodes.length;

  // Create Services menu item to remove films
  if (numberOfFilms > 0) {
    var servicesMenu = document.getElementById('services-menu');
    var newItem = document.createElement('LI');
    var link = document.createElement('A');
    const text = document.createTextNode('On selected service only');
    newItem.setAttribute('class', '');
    link.setAttribute('class', 'item');
    link.setAttribute('style', 'cursor: pointer');
    link.appendChild(text);
    newItem.appendChild(link);
    newItem.addEventListener('click', processPage);
    servicesMenu.insertBefore(newItem, servicesMenu.children[3]);
  }

  function processPage() {

    newItem.setAttribute('class', ' smenu-subselected');

    var servicesMenuItems = document.getElementById('services-menu').getElementsByClassName('item');
    var servicesList = [];
    var servicesUrls = [];
    var currentService;

    // Get available services from menu
    for (let i = 8; i < servicesMenuItems.length - 2; i++) {
      servicesList.push(servicesMenuItems[i].innerText);
      servicesUrls.push(servicesMenuItems[i].href);
      if (!servicesMenuItems[i].href) {
        currentService = servicesMenuItems[i].innerText;
      }
    }

    console.log("Current Service: " + currentService);

    // If a service is selected, remove films
    // which are available on other services
    if (currentService) {
      for (let i = 0; i < servicesUrls.length; i++) {
        if (servicesUrls[i]) {
          removeFilms(servicesUrls[i], i);
        }
      }
    }

    async function removeFilms(url, index) {

      // Get page content for other services
      var pageObject = await fetch(url);
      var pageText = await pageObject.text();
      var serviceName = servicesList[index];

      var node ;
      var filmId;
      var filmName;

      // Check if film is in another service and remove it
      for (var i = films.childNodes.length-1; i >= 0; i--) {
        try {
          node = films.childNodes[i];
          filmId = node.getElementsByTagName('div')[0].getAttributeNode('data-item-id').value;
          if (pageText.search(filmId) != -1) {
            films.removeChild(node);
            try {
              filmName = node.getElementsByTagName('div')[0].getAttributeNode('data-film-name').value;
            } catch {filmName = filmId}
            console.log("'" + filmName + "' removed. Available also on '" + serviceName + "'");
            numberOfFilms--;
          }
        } catch(err) {
          console.log("ERROR: Unable to remove '" + filmName + "'.");
          console.log("ERROR: " + err);
        }
      }

      // Updated list header phrase with the number of films available only on the selected service
      if (numberOfFilms > 1) {
        var numberOfFilmsPhrase = "The " + numberOfFilms + " films in this page are only available on ";
      } else if (numberOfFilms == 1) {
        var numberOfFilmsPhrase = "The film in this page is only available on ";
      } else {
        var numberOfFilmsPhrase = "No films in this page are only available on ";
      }
      numberOfFilmsPhrase += currentService + " (<a href=\"\/settings\/stores\/\">edit&nbsp;favorites</a>)."

      document.getElementsByClassName('ui-block-heading')[0].innerHTML = numberOfFilmsPhrase;

      // Remove clickable property of menu item
      newItem.removeEventListener('click', processPage);
      link.setAttribute('style', 'cursor: default');

    }
  }

})();
