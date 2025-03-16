function ProcessPage() {

  var servicesMenu = document.getElementById('services-menu').getElementsByClassName('item');
  var servicesList = [];
  var servicesUrls = [];
  var currentService;
  const pages = [];

  for (var i = 7; i < servicesMenu.length - 2; i++) {
    servicesList.push(servicesMenu[i].innerText);
    servicesUrls.push(servicesMenu[i].href);
    if (!servicesMenu[i].href) {
      currentService = servicesMenu[i].innerText;
    }
  }

  console.log("Current Service: " + currentService);

  if (currentService) {

    var films = document.getElementsByClassName('poster-list -p125 -grid -constrained')[0];

    // Remove nodes which are not film nodes
    for (var i = films.childNodes.length-1; i >= 0; i--) {
      var node = films.childNodes[i];
      if (!node.attributes) {
        films.removeChild(node);
      }
    }

    var numberOfFilms = films.childNodes.length;

    for (var i = 0; i < servicesUrls.length; i++) {
      if (servicesUrls[i]) {
        removeFilms(servicesUrls[i], i);
      }
    }

  }

  async function removeFilms(url, index) {

    let pageObject = await fetch(url);
    let pageText = await pageObject.text();
    let serviceName = servicesList[index];

    var films = document.getElementsByClassName('poster-list -p125 -grid -constrained')[0];

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

    numberOfFilmsPhrase = "There are " + numberOfFilms + " films in this list only available on " + currentService + " (<a href=\"\/settings\/stores\/\">edit&nbsp;favorites</a>)."
    document.getElementsByClassName('ui-block-heading')[0].innerHTML = numberOfFilmsPhrase;

  }
}

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith('https://letterboxd.com/')) {
    chrome.scripting
    .executeScript({
      target : {tabId : tab.id, allFrames : true},
      func : ProcessPage,
    });
  }
});
