"use strict";

/**
 * Approssimazione decimale di un numero.
 *
 * @param {String}  type  Il tipo di approssimazione.
 * @param {Number}  value Il numero.
 * @param {Integer} exp   L'esponente (the 10 logarithm of the adjustment base).
 * @returns {Number} Il valore approssimato.
 */
function decimalAdjust(type, value, exp) {
  // Se exp è undefined o zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // Se value non è un numero o exp non è un intero...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Se value è negativo...
  if (value < 0) {
    return -decimalAdjust(type, -value, exp);
  }
  // Shift
  value = value.toString().split('e');
  value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

// Decimal round
if (!Math.round10) {
  Math.round10 = function(value, exp) {
    return decimalAdjust('round', value, exp);
  };
}
// Decimal floor
if (!Math.floor10) {
  Math.floor10 = function(value, exp) {
    return decimalAdjust('floor', value, exp);
  };
}
// Decimal ceil
if (!Math.ceil10) {
  Math.ceil10 = function(value, exp) {
    return decimalAdjust('ceil', value, exp);
  };
}


const defaultOptions = {
  'allow-alpha': true,
};

// Save default options to storage
chrome.storage.sync.get('defaultOptions', function() {
  chrome.storage.sync.set({
    defaultOptions
  });
});

const themes = {
  'current': {
    images: {
      headerURL: '',
    },

    colors: {
      accentcolor: 'white',
      textcolor: 'white',
      toolbar: 'rgba(0,0,0,0.25)',
      toolbar_text: 'rgba(255,255,255,1)',
      toolbar_field: 'rgba(255,255,255,1)',
      toolbar_field_text: '#0c0c0d',
      toolbar_top_separator: 'rgba(0,0,0,0)',
      toolbar_bottom_separator: 'rgba(0,0,0,0.25)',
      toolbar_vertical_separator: 'rgba(255,255,255,0.25)'
    }
  },
  'previous': null
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomColor(allowAlpha = true, allowNull = true, forceNull = false) {
  let finalResult = null
  let maxValue = 256

  if (forceNull) {
    return null
  }

  if (allowNull) {
    maxValue = 257
  }

  if (allowAlpha) {
    finalResult = 'rgba(' + randomInt(0, maxValue) + ',' + randomInt(0, maxValue) + ',' + randomInt(0, maxValue) + ',' + Math.round10(Math.random(), -2) + ')'
  } else {
    finalResult = 'rgb(' + randomInt(0, maxValue) + ',' + randomInt(0, maxValue) + ',' + randomInt(0, maxValue) + ')'
  }

  if (finalResult.includes('256')) {
    finalResult = null
  }

  return finalResult

}

function newColorSet(theme) {

  var options;
  chrome.storage.sync.get(['options', 'defaultOptions'], function(storage) {
    options = Object.assign(storage.defaultOptions, storage.options);

    console.log(options['allow-alpha'] + " what")

    for (var colorAttr in theme.colors) {
      if (theme.colors.hasOwnProperty(colorAttr)) {
        theme.colors[colorAttr] = randomColor(options['allow-alpha'], options['allow-null'])
      }
    }

  });

  return (theme)

}


// Morning, Afternoon or Night
var currentTheme = '';
async function setTheme(theme) {
  // if (currentTheme === theme) {
  //   // No point in changing the theme if it has already been set.
  //   return;
  // }
  currentTheme = theme;
  // Theme each window with the appropriate theme (morning/afternoon/night/dawn/private)
  browser.windows.getAll().then(wins => wins.forEach(themeWindow));
}

browser.windows.onCreated.addListener(themeWindow);

function themeWindow(window) {
  // Check if the window is in private browsing
  if (window.incognito) {
    browser.theme.update(window.id, themes['privatebrowsing']);
  } else {
    browser.theme.update(window.id, themes[currentTheme]);
  }
}

/**
 * Listen for messages from the background script.
 * Call "beastify()" or "reset()".
 */
browser.runtime.onMessage.addListener((message) => {
  if (message.command === "newTheme") {

    themes['new'] = newColorSet(themes.current)

    console.log(themes['new'].colors)

    setTheme('new');
  }
  if (message.command === "undoTheme") {
    setTheme(message.theme);
  }
});
