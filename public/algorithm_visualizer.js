/**
 * algorithm-visualizer - Algorithm Visualizer
 * @version v0.1.0
 * @author Jason Park & contributors
 * @link https://github.com/parkjs814/AlgorithmVisualizer#readme
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _$ = $;
var extend = _$.extend;


var cache = {
  lastFileUsed: '',
  files: {}
};

var assertFileName = function assertFileName(name) {
  if (!name) {
    throw 'Missing file name';
  }
};

/**
 * Global application cache
 */
module.exports = {
  getCachedFile: function getCachedFile(name) {
    assertFileName(name);
    return cache.files[name];
  },
  updateCachedFile: function updateCachedFile(name, updates) {
    assertFileName(name);
    if (!cache.files[name]) {
      cache.files[name] = {};
    }
    extend(cache.files[name], updates);
  },
  getLastFileUsed: function getLastFileUsed() {
    return cache.lastFileUsed;
  },
  setLastFileUsed: function setLastFileUsed(file) {
    cache.lastFileUsed = file;
  }
};

},{}],2:[function(require,module,exports){
'use strict';

var Editor = require('../editor');
var TracerManager = require('../tracer_manager');
var DOM = require('../dom/setup');

var _require = require('../dom/loading_slider');

var showLoadingSlider = _require.showLoadingSlider;
var hideLoadingSlider = _require.hideLoadingSlider;


var Cache = require('./cache');

var state = {
  isLoading: null,
  editor: null,
  tracerManager: null,
  categories: null,
  loadedScratch: null
};

var initState = function initState(tracerManager) {
  state.isLoading = false;
  state.editor = new Editor(tracerManager);
  state.tracerManager = tracerManager;
  state.categories = {};
  state.loadedScratch = null;
};

/**
 * Global application singleton.
 */
var App = function App() {

  this.getIsLoading = function () {
    return state.isLoading;
  };

  this.setIsLoading = function (loading) {
    state.isLoading = loading;
    if (loading) {
      showLoadingSlider();
    } else {
      hideLoadingSlider();
    }
  };

  this.getEditor = function () {
    return state.editor;
  };

  this.getCategories = function () {
    return state.categories;
  };

  this.getCategory = function (name) {
    return state.categories[name];
  };

  this.setCategories = function (categories) {
    state.categories = categories;
  };

  this.updateCategory = function (name, updates) {
    $.extend(state.categories[name], updates);
  };

  this.getTracerManager = function () {
    return state.tracerManager;
  };

  this.getLoadedScratch = function () {
    return state.loadedScratch;
  };

  this.setLoadedScratch = function (loadedScratch) {
    state.loadedScratch = loadedScratch;
  };

  var tracerManager = TracerManager.init();

  initState(tracerManager);
  DOM.setup(tracerManager);
};

App.prototype = Cache;

module.exports = App;

},{"../dom/loading_slider":7,"../dom/setup":9,"../editor":29,"../tracer_manager":64,"./cache":1}],3:[function(require,module,exports){
'use strict';

/**
 * This is the main application instance.
 * Gets populated on page load. 
 */

module.exports = {};

},{}],4:[function(require,module,exports){
'use strict';

var app = require('../app');
var Server = require('../server');
var showAlgorithm = require('./show_algorithm');

var _$ = $;
var each = _$.each;


var addAlgorithmToCategoryDOM = function addAlgorithmToCategoryDOM(category, subList, algorithm) {
  var $algorithm = $('<button class="indent collapse">').append(subList[algorithm]).attr('data-algorithm', algorithm).attr('data-category', category).click(function () {
    Server.loadAlgorithm(category, algorithm).then(function (data) {
      showAlgorithm(category, algorithm, data);
    });
  });

  $('#list').append($algorithm);
};

var addCategoryToDOM = function addCategoryToDOM(category) {
  var _app$getCategory = app.getCategory(category);

  var categoryName = _app$getCategory.name;
  var categorySubList = _app$getCategory.list;


  var $category = $('<button class="category">').append('<i class="fa fa-fw fa-caret-right">').append(categoryName).attr('data-category', category);

  $category.click(function () {
    $('.indent[data-category="' + category + '"]').toggleClass('collapse');
    $(this).find('i.fa').toggleClass('fa-caret-right fa-caret-down');
  });

  $('#list').append($category);

  each(categorySubList, function (algorithm) {
    addAlgorithmToCategoryDOM(category, categorySubList, algorithm);
  });
};

module.exports = function () {
  each(app.getCategories(), addCategoryToDOM);
};

},{"../app":3,"../server":56,"./show_algorithm":20}],5:[function(require,module,exports){
'use strict';

var Server = require('../server');

var _$ = $;
var each = _$.each;


var addFileToDOM = function addFileToDOM(category, algorithm, file, explanation) {
  var $file = $('<button>').append(file).attr('data-file', file).click(function () {
    Server.loadFile(category, algorithm, file, explanation);
    $('.files_bar > .wrapper > button').removeClass('active');
    $(this).addClass('active');
  });
  $('.files_bar > .wrapper').append($file);
  return $file;
};

module.exports = function (category, algorithm, files, requestedFile) {
  $('.files_bar > .wrapper').empty();

  each(files, function (file, explanation) {
    var $file = addFileToDOM(category, algorithm, file, explanation);
    if (requestedFile && requestedFile == file) $file.click();
  });

  if (!requestedFile) $('.files_bar > .wrapper > button').first().click();
  $('.files_bar > .wrapper').scroll();
};

},{"../server":56}],6:[function(require,module,exports){
'use strict';

var showAlgorithm = require('./show_algorithm');
var addCategories = require('./add_categories');
var showDescription = require('./show_description');
var addFiles = require('./add_files');
var showFirstAlgorithm = require('./show_first_algorithm');
var showRequestedAlgorithm = require('./show_requested_algorithm');
var showWiki = require('./show_wiki');

module.exports = {
  showAlgorithm: showAlgorithm,
  addCategories: addCategories,
  showDescription: showDescription,
  addFiles: addFiles,
  showFirstAlgorithm: showFirstAlgorithm,
  showRequestedAlgorithm: showRequestedAlgorithm,
  showWiki: showWiki
};

},{"./add_categories":4,"./add_files":5,"./show_algorithm":20,"./show_description":21,"./show_first_algorithm":22,"./show_requested_algorithm":23,"./show_wiki":24}],7:[function(require,module,exports){
'use strict';

var showLoadingSlider = function showLoadingSlider() {
  $('#loading-slider').removeClass('loaded');
};

var hideLoadingSlider = function hideLoadingSlider() {
  $('#loading-slider').addClass('loaded');
};

module.exports = {
  showLoadingSlider: showLoadingSlider,
  hideLoadingSlider: hideLoadingSlider
};

},{}],8:[function(require,module,exports){
'use strict';

var create = function create() {
  var $container = $('<section class="module_wrapper">');
  $('.module_container').append($container);
  return $container;
};

module.exports = {
  create: create
};

},{}],9:[function(require,module,exports){
'use strict';

var setupDividers = require('./setup_dividers');
var setupDocument = require('./setup_document');
var setupFilesBar = require('./setup_files_bar');
var setupInterval = require('./setup_interval');
var setupModuleContainer = require('./setup_module_container');
var setupPoweredBy = require('./setup_powered_by');
var setupScratchPaper = require('./setup_scratch_paper');
var setupSideMenu = require('./setup_side_menu');
var setupTopMenu = require('./setup_top_menu');
var setupWindow = require('./setup_window');

/**
 * Initializes elements once the app loads in the DOM.
 */
var setup = function setup() {

  $('.btn input').click(function (e) {
    e.stopPropagation();
  });

  // dividers
  setupDividers();

  // document
  setupDocument();

  // files bar
  setupFilesBar();

  // interval
  setupInterval();

  // module container
  setupModuleContainer();

  // powered by
  setupPoweredBy();

  // scratch paper
  setupScratchPaper();

  // side menu
  setupSideMenu();

  // top menu
  setupTopMenu();

  // window
  setupWindow();
};

module.exports = {
  setup: setup
};

},{"./setup_dividers":10,"./setup_document":11,"./setup_files_bar":12,"./setup_interval":13,"./setup_module_container":14,"./setup_powered_by":15,"./setup_scratch_paper":16,"./setup_side_menu":17,"./setup_top_menu":18,"./setup_window":19}],10:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var app = require('../../app');

var addDividerToDom = function addDividerToDom(divider) {
  var _divider = _slicedToArray(divider, 3);

  var vertical = _divider[0];
  var $first = _divider[1];
  var $second = _divider[2];

  var $parent = $first.parent();
  var thickness = 5;

  var $divider = $('<div class="divider">');

  var dragging = false;
  if (vertical) {
    (function () {
      $divider.addClass('vertical');

      var _left = -thickness / 2;
      $divider.css({
        top: 0,
        bottom: 0,
        left: _left,
        width: thickness
      });

      var x = void 0;
      $divider.mousedown(function (_ref) {
        var pageX = _ref.pageX;

        x = pageX;
        dragging = true;
      });

      $(document).mousemove(function (_ref2) {
        var pageX = _ref2.pageX;

        if (dragging) {
          var new_left = $second.position().left + pageX - x;
          var percent = new_left / $parent.width() * 100;
          percent = Math.min(90, Math.max(10, percent));
          $first.css('right', 100 - percent + '%');
          $second.css('left', percent + '%');
          x = pageX;
          app.getTracerManager().resize();
          $('.files_bar > .wrapper').scroll();
        }
      });

      $(document).mouseup(function (e) {
        dragging = false;
      });
    })();
  } else {
    (function () {

      $divider.addClass('horizontal');
      var _top = -thickness / 2;
      $divider.css({
        top: _top,
        height: thickness,
        left: 0,
        right: 0
      });

      var y = void 0;
      $divider.mousedown(function (_ref3) {
        var pageY = _ref3.pageY;

        y = pageY;
        dragging = true;
      });

      $(document).mousemove(function (_ref4) {
        var pageY = _ref4.pageY;

        if (dragging) {
          var new_top = $second.position().top + pageY - y;
          var percent = new_top / $parent.height() * 100;
          percent = Math.min(90, Math.max(10, percent));
          $first.css('bottom', 100 - percent + '%');
          $second.css('top', percent + '%');
          y = pageY;
          app.getTracerManager().resize();
        }
      });

      $(document).mouseup(function (e) {
        dragging = false;
      });
    })();
  }

  $second.append($divider);
};

module.exports = function () {
  var dividers = [['v', $('.sidemenu'), $('.workspace')], ['v', $('.viewer_container'), $('.editor_container')], ['h', $('.data_container'), $('.code_container')]];
  for (var i = 0; i < dividers.length; i++) {
    addDividerToDom(dividers[i]);
  }
};

},{"../../app":3}],11:[function(require,module,exports){
'use strict';

var app = require('../../app');

module.exports = function () {
  $(document).on('click', 'a', function (e) {
    e.preventDefault();
    if (!window.open($(this).attr('href'), '_blank')) {
      alert('Please allow popups for this site');
    }
  });

  $(document).mouseup(function (e) {
    app.getTracerManager().command('mouseup', e);
  });
};

},{"../../app":3}],12:[function(require,module,exports){
'use strict';

var definitelyBigger = function definitelyBigger(x, y) {
  return x > y + 2;
};

module.exports = function () {

  $('.files_bar > .btn-left').click(function () {
    var $wrapper = $('.files_bar > .wrapper');
    var clipWidth = $wrapper.width();
    var scrollLeft = $wrapper.scrollLeft();

    $($wrapper.children('button').get().reverse()).each(function () {
      var left = $(this).position().left;
      var right = left + $(this).outerWidth();
      if (0 > left) {
        $wrapper.scrollLeft(scrollLeft + right - clipWidth);
        return false;
      }
    });
  });

  $('.files_bar > .btn-right').click(function () {
    var $wrapper = $('.files_bar > .wrapper');
    var clipWidth = $wrapper.width();
    var scrollLeft = $wrapper.scrollLeft();

    $wrapper.children('button').each(function () {
      var left = $(this).position().left;
      var right = left + $(this).outerWidth();
      if (clipWidth < right) {
        $wrapper.scrollLeft(scrollLeft + left);
        return false;
      }
    });
  });

  $('.files_bar > .wrapper').scroll(function () {

    var $wrapper = $('.files_bar > .wrapper');
    var clipWidth = $wrapper.width();
    var $left = $wrapper.children('button:first-child');
    var $right = $wrapper.children('button:last-child');
    var left = $left.position().left;
    var right = $right.position().left + $right.outerWidth();

    if (definitelyBigger(0, left) && definitelyBigger(clipWidth, right)) {
      var scrollLeft = $wrapper.scrollLeft();
      $wrapper.scrollLeft(scrollLeft + clipWidth - right);
      return;
    }

    var lefter = definitelyBigger(0, left);
    var righter = definitelyBigger(right, clipWidth);
    $wrapper.toggleClass('shadow-left', lefter);
    $wrapper.toggleClass('shadow-right', righter);
    $('.files_bar > .btn-left').attr('disabled', !lefter);
    $('.files_bar > .btn-right').attr('disabled', !righter);
  });
};

},{}],13:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var app = require('../../app');
var Toast = require('../toast');

var parseFloat = Number.parseFloat;


var minInterval = 0.1;
var maxInterval = 10;
var startInterval = 0.5;
var stepInterval = 0.1;

var normalize = function normalize(sec) {

  var interval = void 0;
  var message = void 0;
  if (sec < minInterval) {
    interval = minInterval;
    message = 'Interval of ' + sec + ' seconds is too low. Setting to min allowed interval of ' + minInterval + ' second(s).';
  } else if (sec > maxInterval) {
    interval = maxInterval;
    message = 'Interval of ' + sec + ' seconds is too high. Setting to max allowed interval of ' + maxInterval + ' second(s).';
  } else {
    interval = sec;
    message = 'Interval has been set to ' + sec + ' second(s).';
  }

  return [interval, message];
};

module.exports = function () {

  var $interval = $('#interval');
  $interval.val(startInterval);
  $interval.attr({
    max: maxInterval,
    min: minInterval,
    step: stepInterval
  });

  $('#interval').on('change', function () {
    var tracerManager = app.getTracerManager();

    var _normalize = normalize(parseFloat($(this).val()));

    var _normalize2 = _slicedToArray(_normalize, 2);

    var seconds = _normalize2[0];
    var message = _normalize2[1];


    $(this).val(seconds);
    tracerManager.interval = seconds * 1000;
    Toast.showInfoToast(message);
  });
};

},{"../../app":3,"../toast":25}],14:[function(require,module,exports){
'use strict';

var app = require('../../app');

module.exports = function () {

  var $module_container = $('.module_container');

  $module_container.on('mousedown', '.module_wrapper', function (e) {
    app.getTracerManager().findOwner(this).mousedown(e);
  });

  $module_container.on('mousemove', '.module_wrapper', function (e) {
    app.getTracerManager().findOwner(this).mousemove(e);
  });

  $module_container.on('DOMMouseScroll mousewheel', '.module_wrapper', function (e) {
    app.getTracerManager().findOwner(this).mousewheel(e);
  });
};

},{"../../app":3}],15:[function(require,module,exports){
'use strict';

module.exports = function () {
  $('#powered-by').click(function () {
    $('#powered-by-list button').toggleClass('collapse');
  });
};

},{}],16:[function(require,module,exports){
'use strict';

var app = require('../../app');
var Server = require('../../server');
var showAlgorithm = require('../show_algorithm');

module.exports = function () {
  $('#scratch-paper').click(function () {
    var category = 'scratch';
    var algorithm = app.getLoadedScratch();
    Server.loadAlgorithm(category, algorithm).then(function (data) {
      showAlgorithm(category, algorithm, data);
    });
  });
};

},{"../../app":3,"../../server":56,"../show_algorithm":20}],17:[function(require,module,exports){
'use strict';

var app = require('../../app');

var sidemenu_percent = void 0;

module.exports = function () {
  $('#navigation').click(function () {
    var $sidemenu = $('.sidemenu');
    var $workspace = $('.workspace');

    $sidemenu.toggleClass('active');
    $('.nav-dropdown').toggleClass('fa-caret-down fa-caret-up');

    if ($sidemenu.hasClass('active')) {
      $sidemenu.css('right', 100 - sidemenu_percent + '%');
      $workspace.css('left', sidemenu_percent + '%');
    } else {
      sidemenu_percent = $workspace.position().left / $('body').width() * 100;
      $sidemenu.css('right', 0);
      $workspace.css('left', 0);
    }

    app.getTracerManager().resize();
  });
};

},{"../../app":3}],18:[function(require,module,exports){
'use strict';

var app = require('../../app');
var Server = require('../../server');
var Toast = require('../toast');
var TopMenu = require('../top_menu');

module.exports = function () {

  // shared
  $('#shared').mouseup(function () {
    $(this).select();
  });

  $('#btn_share').click(function () {

    var $icon = $(this).find('.fa-share');
    $icon.addClass('fa-spin fa-spin-faster');

    Server.shareScratchPaper().then(function (url) {
      $icon.removeClass('fa-spin fa-spin-faster');
      $('#shared').removeClass('collapse');
      $('#shared').val(url);
      Toast.showInfoToast('Shareable link is created.');
    });
  });

  // control

  var $btnRun = $('#btn_run');
  var $btnTrace = $('#btn_trace');
  var $btnPause = $('#btn_pause');
  var $btnPrev = $('#btn_prev');
  var $btnNext = $('#btn_next');

  // initially, control buttons are disabled
  TopMenu.disableFlowControl();

  $btnRun.click(function () {
    $btnTrace.click();
    $btnPause.removeClass('active');
    $btnRun.addClass('active');
    TopMenu.enableFlowControl();
    var err = app.getEditor().execute();
    if (err) {
      console.error(err);
      Toast.showErrorToast(err);
    }
  });

  $btnPause.click(function () {
    $btnRun.toggleClass('active');
    $btnPause.toggleClass('active');
    if (app.getTracerManager().isPause()) {
      app.getTracerManager().resumeStep();
    } else {
      app.getTracerManager().pauseStep();
    }
  });

  $btnPrev.click(function () {
    $btnRun.removeClass('active');
    $btnPause.addClass('active');
    app.getTracerManager().pauseStep();
    app.getTracerManager().prevStep();
  });

  $btnNext.click(function () {
    $btnRun.removeClass('active');
    $btnPause.addClass('active');
    app.getTracerManager().pauseStep();
    app.getTracerManager().nextStep();
  });

  // description & trace

  $('.tab_bar > button').click(function () {
    $('.tab_bar > button').removeClass('active');
    $('.tab_container > .tab').removeClass('active');
    $(this).addClass('active');
    $($(this).attr('data-target')).addClass('active');
  });
};

},{"../../app":3,"../../server":56,"../toast":25,"../top_menu":26}],19:[function(require,module,exports){
'use strict';

var app = require('../../app');

module.exports = function () {
  $(window).resize(function () {
    app.getTracerManager().resize();
  });
};

},{"../../app":3}],20:[function(require,module,exports){
'use strict';

var app = require('../app');

var _require = require('../utils');

var isScratchPaper = _require.isScratchPaper;


var showDescription = require('./show_description');
var addFiles = require('./add_files');

module.exports = function (category, algorithm, data, requestedFile) {
  var $menu = void 0;
  var category_name = void 0;
  var algorithm_name = void 0;

  if (isScratchPaper(category)) {
    $menu = $('#scratch-paper');
    category_name = 'Scratch Paper';
    algorithm_name = algorithm ? 'Shared' : 'Temporary';
  } else {
    $menu = $('[data-category="' + category + '"][data-algorithm="' + algorithm + '"]');
    var categoryObj = app.getCategory(category);
    category_name = categoryObj.name;
    algorithm_name = categoryObj.list[algorithm];
  }

  $('.sidemenu button').removeClass('active');
  $menu.addClass('active');

  $('#category').html(category_name);
  $('#algorithm').html(algorithm_name);
  $('#tab_desc > .wrapper').empty();
  $('.files_bar > .wrapper').empty();
  $('#explanation').html('');

  app.setLastFileUsed(null);
  app.getEditor().clearContent();

  var files = data.files;


  delete data.files;

  showDescription(data);
  addFiles(category, algorithm, files, requestedFile);
};

},{"../app":3,"../utils":70,"./add_files":5,"./show_description":21}],21:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var isArray = Array.isArray;
var _$ = $;
var each = _$.each;


module.exports = function (data) {
  var $container = $('#tab_desc > .wrapper');
  $container.empty();

  each(data, function (key, value) {

    if (key) {
      $container.append($('<h3>').html(key));
    }

    if (typeof value === 'string') {
      $container.append($('<p>').html(value));
    } else if (isArray(value)) {
      (function () {

        var $ul = $('<ul class="applications">');
        $container.append($ul);

        value.forEach(function (li) {
          $ul.append($('<li>').html(li));
        });
      })();
    } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
      (function () {

        var $ul = $('<ul class="complexities">');
        $container.append($ul);

        each(value, function (prop) {
          var $wrapper = $('<div class="complexity">');
          var $type = $('<span class="complexity-type">').html(prop + ': ');
          var $value = $('<span class="complexity-value">').html('' + value[prop]);

          $wrapper.append($type).append($value);

          $ul.append($('<li>').append($wrapper));
        });
      })();
    }
  });
};

},{}],22:[function(require,module,exports){
'use strict';

// click the first algorithm in the first category

module.exports = function () {
  $('#list button.category').first().click();
  $('#list button.category + .indent').first().click();
};

},{}],23:[function(require,module,exports){
'use strict';

var Server = require('../server');
var showAlgorithm = require('./show_algorithm');

module.exports = function (category, algorithm, file) {
  $('.category[data-category="' + category + '"]').click();
  Server.loadAlgorithm(category, algorithm).then(function (data) {
    showAlgorithm(category, algorithm, data, file);
  });
};

},{"../server":56,"./show_algorithm":20}],24:[function(require,module,exports){
'use strict';

var Server = require('../server');
var converter = new showdown.Converter({ tables: true });

module.exports = function (wiki) {
  Server.loadWiki(wiki).then(function (data) {
    console.log(data);
    $('#tab_doc > .wrapper').html(converter.makeHtml(data));
  });
};

},{"../server":56}],25:[function(require,module,exports){
'use strict';

var showToast = function showToast(data, type) {
  var $toast = $('<div class="toast ' + type + '">').append(data);

  $('.toast_container').append($toast);
  setTimeout(function () {
    $toast.fadeOut(function () {
      $toast.remove();
    });
  }, 3000);
};

var showErrorToast = function showErrorToast(err) {
  showToast(err, 'error');
};

var showInfoToast = function showInfoToast(err) {
  showToast(err, 'info');
};

module.exports = {
  showErrorToast: showErrorToast,
  showInfoToast: showInfoToast
};

},{}],26:[function(require,module,exports){
'use strict';

var flowControlBtns = [$('#btn_pause'), $('#btn_prev'), $('#btn_next')];
var setFlowControlState = function setFlowControlState(isDisabled) {
  flowControlBtns.forEach(function ($btn) {
    return $btn.attr('disabled', isDisabled);
  });
};

var enableFlowControl = function enableFlowControl() {
  setFlowControlState(false);
};

var disableFlowControl = function disableFlowControl() {
  setFlowControlState(true);
};

var resetTopMenuButtons = function resetTopMenuButtons() {
  $('.top-menu-buttons button').removeClass('active');
  disableFlowControl();
};

var setInterval = function setInterval(val) {
  $('#interval').val(interval);
};

var activateBtnPause = function activateBtnPause() {
  $('#btn_pause').addClass('active');
};

var deactivateBtnPause = function deactivateBtnPause() {
  $('#btn_pause').removeClass('active');
};

module.exports = {
  enableFlowControl: enableFlowControl,
  disableFlowControl: disableFlowControl,
  resetTopMenuButtons: resetTopMenuButtons,
  setInterval: setInterval,
  activateBtnPause: activateBtnPause,
  deactivateBtnPause: deactivateBtnPause
};

},{}],27:[function(require,module,exports){
'use strict';

module.exports = function (id) {
  var editor = ace.edit(id);

  editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  });

  editor.setTheme('ace/theme/tomorrow_night_eighties');
  editor.session.setMode('ace/mode/javascript');
  editor.$blockScrolling = Infinity;

  return editor;
};

},{}],28:[function(require,module,exports){
'use strict';

var execute = function execute(tracerManager, code) {
  // all modules available to eval are obtained from window
  try {
    tracerManager.deallocateAll();
    eval(code);
    tracerManager.visualize();
  } catch (err) {
    return err;
  } finally {
    tracerManager.removeUnallocated();
  }
};

var executeData = function executeData(tracerManager, algoData) {
  return execute(tracerManager, algoData);
};

var executeDataAndCode = function executeDataAndCode(tracerManager, algoData, algoCode) {
  return execute(tracerManager, algoData + ';' + algoCode);
};

module.exports = {
  executeData: executeData,
  executeDataAndCode: executeDataAndCode
};

},{}],29:[function(require,module,exports){
'use strict';

var app = require('../app');
var createEditor = require('./create');
var Executor = require('./executor');

function Editor(tracerManager) {
  var _this = this;

  if (!tracerManager) {
    throw 'Cannot create Editor. Missing the tracerManager';
  }

  ace.require('ace/ext/language_tools');

  this.dataEditor = createEditor('data');
  this.codeEditor = createEditor('code');

  // Setting data

  this.setData = function (data) {
    _this.dataEditor.setValue(data, -1);
  };

  this.setCode = function (code) {
    _this.codeEditor.setValue(code, -1);
  };

  this.setContent = function (_ref) {
    var data = _ref.data;
    var code = _ref.code;

    _this.setData(data);
    _this.setCode(code);
  };

  // Clearing data

  this.clearData = function () {
    _this.dataEditor.setValue('');
  };

  this.clearCode = function () {
    _this.codeEditor.setValue('');
  };

  this.clearContent = function () {
    _this.clearData();
    _this.clearCode();
  };

  this.execute = function () {
    var data = _this.dataEditor.getValue();
    var code = _this.codeEditor.getValue();
    return Executor.executeDataAndCode(tracerManager, data, code);
  };

  // listeners

  this.dataEditor.on('change', function () {
    var data = _this.dataEditor.getValue();
    var lastFileUsed = app.getLastFileUsed();
    if (lastFileUsed) {
      app.updateCachedFile(lastFileUsed, {
        data: data
      });
    }
    Executor.executeData(tracerManager, data);
  });

  this.codeEditor.on('change', function () {
    var code = _this.codeEditor.getValue();
    var lastFileUsed = app.getLastFileUsed();
    if (lastFileUsed) {
      app.updateCachedFile(lastFileUsed, {
        code: code
      });
    }
  });
};

module.exports = Editor;

},{"../app":3,"./create":27,"./executor":28}],30:[function(require,module,exports){
'use strict';

var RSVP = require('rsvp');
var app = require('./app');
var AppConstructor = require('./app/constructor');
var DOM = require('./dom');
var Server = require('./server');

var modules = require('./module');

var _$ = $;
var extend = _$.extend;


$.ajaxSetup({
  cache: false,
  dataType: 'text'
});

var _require = require('./utils');

var isScratchPaper = _require.isScratchPaper;

var _require2 = require('./server/helpers');

var getPath = _require2.getPath;

// set global promise error handler

RSVP.on('error', function (reason) {
  console.assert(false, reason);
});

$(function () {

  // initialize the application and attach in to the instance module
  var appConstructor = new AppConstructor();
  extend(true, app, appConstructor);

  // load modules to the global scope so they can be evaled
  extend(true, window, modules);

  Server.loadCategories().then(function (data) {
    app.setCategories(data);
    DOM.addCategories();

    // determine if the app is loading a pre-existing scratch-pad
    // or the home page

    var _getPath = getPath();

    var category = _getPath.category;
    var algorithm = _getPath.algorithm;
    var file = _getPath.file;

    if (isScratchPaper(category)) {
      if (algorithm) {
        Server.loadScratchPaper(algorithm).then(function (_ref) {
          var category = _ref.category;
          var algorithm = _ref.algorithm;
          var data = _ref.data;

          DOM.showAlgorithm(category, algorithm, data);
        });
      } else {
        Server.loadAlgorithm(category).then(function (data) {
          DOM.showAlgorithm(category, null, data);
        });
      }
    } else if (category && algorithm) {
      DOM.showRequestedAlgorithm(category, algorithm, file);
    } else {
      DOM.showFirstAlgorithm();
    }
  });

  Server.loadWikiList().then(function (data) {
    DOM.showWiki('Home');
  });
});

},{"./app":3,"./app/constructor":2,"./dom":6,"./module":39,"./server":56,"./server/helpers":55,"./utils":70,"rsvp":72}],31:[function(require,module,exports){
'use strict';

var Array2D = require('./array2d');

var random = function random(N, min, max) {
  return Array2D.random(1, N, min, max)[0];
};

var randomSorted = function randomSorted(N, min, max) {
  return Array2D.randomSorted(1, N, min, max)[0];
};

module.exports = {
  random: random,
  randomSorted: randomSorted
};

},{"./array2d":32}],32:[function(require,module,exports){
'use strict';

var random = function random(N, M, min, max) {
  if (!N) N = 10;
  if (!M) M = 10;
  if (min === undefined) min = 1;
  if (max === undefined) max = 9;
  var D = [];
  for (var i = 0; i < N; i++) {
    D.push([]);
    for (var j = 0; j < M; j++) {
      D[i].push((Math.random() * (max - min + 1) | 0) + min);
    }
  }
  return D;
};

var randomSorted = function randomSorted(N, M, min, max) {
  return random(N, M, min, max).map(function (arr) {
    return arr.sort(function (a, b) {
      return a - b;
    });
  });
};

module.exports = {
  random: random,
  randomSorted: randomSorted
};

},{}],33:[function(require,module,exports){
'use strict';

var random = function random(N, min, max) {
  if (!N) N = 7;
  if (!min) min = 1;
  if (!max) max = 10;
  var C = new Array(N);
  for (var i = 0; i < N; i++) {
    C[i] = new Array(2);
  }for (var i = 0; i < N; i++) {
    for (var j = 0; j < C[i].length; j++) {
      C[i][j] = (Math.random() * (max - min + 1) | 0) + min;
    }
  }return C;
};

module.exports = {
  random: random
};

},{}],34:[function(require,module,exports){
'use strict';

var random = function random(N, ratio) {
  if (!N) N = 5;
  if (!ratio) ratio = .3;
  var G = new Array(N);
  for (var i = 0; i < N; i++) {
    G[i] = new Array(N);
    for (var j = 0; j < N; j++) {
      if (i != j) {
        G[i][j] = (Math.random() * (1 / ratio) | 0) == 0 ? 1 : 0;
      }
    }
  }
  return G;
};

module.exports = {
  random: random
};

},{}],35:[function(require,module,exports){
'use strict';

var Array1D = require('./array1d');
var Array2D = require('./array2d');
var CoordinateSystem = require('./coordinate_system');
var DirectedGraph = require('./directed_graph');
var UndirectedGraph = require('./undirected_graph');
var WeightedDirectedGraph = require('./weighted_directed_graph');
var WeightedUndirectedGraph = require('./weighted_undirected_graph');

module.exports = {
  Array1D: Array1D,
  Array2D: Array2D,
  CoordinateSystem: CoordinateSystem,
  DirectedGraph: DirectedGraph,
  UndirectedGraph: UndirectedGraph,
  WeightedDirectedGraph: WeightedDirectedGraph,
  WeightedUndirectedGraph: WeightedUndirectedGraph
};

},{"./array1d":31,"./array2d":32,"./coordinate_system":33,"./directed_graph":34,"./undirected_graph":36,"./weighted_directed_graph":37,"./weighted_undirected_graph":38}],36:[function(require,module,exports){
'use strict';

var random = function random(N, ratio) {
  if (!N) N = 5;
  if (!ratio) ratio = .3;
  var G = new Array(N);
  for (var i = 0; i < N; i++) {
    G[i] = new Array(N);
  }for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      if (i > j) {
        G[i][j] = G[j][i] = (Math.random() * (1 / ratio) | 0) == 0 ? 1 : 0;
      }
    }
  }
  return G;
};

module.exports = {
  random: random
};

},{}],37:[function(require,module,exports){
'use strict';

var random = function random(N, ratio, min, max) {
  if (!N) N = 5;
  if (!ratio) ratio = .3;
  if (!min) min = 1;
  if (!max) max = 5;
  var G = new Array(N);
  for (var i = 0; i < N; i++) {
    G[i] = new Array(N);
    for (var j = 0; j < N; j++) {
      if (i != j && (Math.random() * (1 / ratio) | 0) == 0) {
        G[i][j] = (Math.random() * (max - min + 1) | 0) + min;
      }
    }
  }
  return G;
};

module.exports = {
  random: random
};

},{}],38:[function(require,module,exports){
'use strict';

var random = function random(N, ratio, min, max) {
  if (!N) N = 5;
  if (!ratio) ratio = .3;
  if (!min) min = 1;
  if (!max) max = 5;
  var G = new Array(N);
  for (var i = 0; i < N; i++) {
    G[i] = new Array(N);
  }for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      if (i > j && (Math.random() * (1 / ratio) | 0) == 0) {
        G[i][j] = G[j][i] = (Math.random() * (max - min + 1) | 0) + min;
      }
    }
  }
  return G;
};

module.exports = {
  random: random
};

},{}],39:[function(require,module,exports){
'use strict';

var tracers = require('./tracer');
var datas = require('./data');

var _$ = $;
var extend = _$.extend;


module.exports = extend(true, {}, tracers, datas);

},{"./data":35,"./tracer":45}],40:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Array2DTracer = require('./array2d');

var Array1DTracer = function (_Array2DTracer) {
  _inherits(Array1DTracer, _Array2DTracer);

  _createClass(Array1DTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'Array1DTracer';
    }
  }]);

  function Array1DTracer(name) {
    _classCallCheck(this, Array1DTracer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Array1DTracer).call(this, name));
  }

  _createClass(Array1DTracer, [{
    key: '_notify',
    value: function _notify(idx, v) {
      _get(Object.getPrototypeOf(Array1DTracer.prototype), '_notify', this).call(this, 0, idx, v);
      return this;
    }
  }, {
    key: '_denotify',
    value: function _denotify(idx) {
      _get(Object.getPrototypeOf(Array1DTracer.prototype), '_denotify', this).call(this, 0, idx);
      return this;
    }
  }, {
    key: '_select',
    value: function _select(s, e) {
      if (e === undefined) {
        _get(Object.getPrototypeOf(Array1DTracer.prototype), '_select', this).call(this, 0, s);
      } else {
        _get(Object.getPrototypeOf(Array1DTracer.prototype), '_selectRow', this).call(this, 0, s, e);
      }
      return this;
    }
  }, {
    key: '_deselect',
    value: function _deselect(s, e) {
      if (e === undefined) {
        _get(Object.getPrototypeOf(Array1DTracer.prototype), '_deselect', this).call(this, 0, s);
      } else {
        _get(Object.getPrototypeOf(Array1DTracer.prototype), '_deselectRow', this).call(this, 0, s, e);
      }
      return this;
    }
  }, {
    key: 'setData',
    value: function setData(D) {
      return _get(Object.getPrototypeOf(Array1DTracer.prototype), 'setData', this).call(this, [D]);
    }
  }]);

  return Array1DTracer;
}(Array2DTracer);

module.exports = Array1DTracer;

},{"./array2d":41}],41:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tracer = require('./tracer');

var _require = require('../../tracer_manager/util/index');

var refineByType = _require.refineByType;

var Array2DTracer = function (_Tracer) {
  _inherits(Array2DTracer, _Tracer);

  _createClass(Array2DTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'Array2DTracer';
    }
  }]);

  function Array2DTracer(name) {
    _classCallCheck(this, Array2DTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Array2DTracer).call(this, name));

    _this.colorClass = {
      selected: 'selected',
      notified: 'notified'
    };

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(Array2DTracer, [{
    key: '_notify',
    value: function _notify(x, y, v) {
      this.manager.pushStep(this.capsule, {
        type: 'notify',
        x: x,
        y: y,
        v: v
      });
      return this;
    }
  }, {
    key: '_denotify',
    value: function _denotify(x, y) {
      this.manager.pushStep(this.capsule, {
        type: 'denotify',
        x: x,
        y: y
      });
      return this;
    }
  }, {
    key: '_select',
    value: function _select(sx, sy, ex, ey) {
      this.pushSelectingStep('select', null, arguments);
      return this;
    }
  }, {
    key: '_selectRow',
    value: function _selectRow(x, sy, ey) {
      this.pushSelectingStep('select', 'row', arguments);
      return this;
    }
  }, {
    key: '_selectCol',
    value: function _selectCol(y, sx, ex) {
      this.pushSelectingStep('select', 'col', arguments);
      return this;
    }
  }, {
    key: '_deselect',
    value: function _deselect(sx, sy, ex, ey) {
      this.pushSelectingStep('deselect', null, arguments);
      return this;
    }
  }, {
    key: '_deselectRow',
    value: function _deselectRow(x, sy, ey) {
      this.pushSelectingStep('deselect', 'row', arguments);
      return this;
    }
  }, {
    key: '_deselectCol',
    value: function _deselectCol(y, sx, ex) {
      this.pushSelectingStep('deselect', 'col', arguments);
      return this;
    }
  }, {
    key: '_separate',
    value: function _separate(x, y) {
      this.manager.pushStep(this.capsule, {
        type: 'separate',
        x: x,
        y: y
      });
      return this;
    }
  }, {
    key: '_separateRow',
    value: function _separateRow(x) {
      this._separate(x, -1);
      return this;
    }
  }, {
    key: '_separateCol',
    value: function _separateCol(y) {
      this._separate(-1, y);
      return this;
    }
  }, {
    key: '_deseparate',
    value: function _deseparate(x, y) {
      this.manager.pushStep(this.capsule, {
        type: 'deseparate',
        x: x,
        y: y
      });
      return this;
    }
  }, {
    key: '_deseparateRow',
    value: function _deseparateRow(x) {
      this._deseparate(x, -1);
      return this;
    }
  }, {
    key: '_deseparateCol',
    value: function _deseparateCol(y) {
      this._deseparate(-1, y);
      return this;
    }
  }, {
    key: 'pushSelectingStep',
    value: function pushSelectingStep() {
      var args = Array.prototype.slice.call(arguments);
      var type = args.shift();
      var mode = args.shift();
      args = Array.prototype.slice.call(args.shift());
      var coord;
      switch (mode) {
        case 'row':
          coord = {
            x: args[0],
            sy: args[1],
            ey: args[2]
          };
          break;
        case 'col':
          coord = {
            y: args[0],
            sx: args[1],
            ex: args[2]
          };
          break;
        default:
          if (args[2] === undefined && args[3] === undefined) {
            coord = {
              x: args[0],
              y: args[1]
            };
          } else {
            coord = {
              sx: args[0],
              sy: args[1],
              ex: args[2],
              ey: args[3]
            };
          }
      }
      var step = {
        type: type
      };
      $.extend(step, coord);
      this.manager.pushStep(this.capsule, step);
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'notify':
          if (step.v !== undefined) {
            var $row = this.$table.find('.mtbl-row').eq(step.x);
            var $col = $row.find('.mtbl-col').eq(step.y);
            $col.text(refineByType(step.v));
          }
        case 'denotify':
        case 'select':
        case 'deselect':
          var colorClass = step.type == 'select' || step.type == 'deselect' ? this.colorClass.selected : this.colorClass.notified;
          var addClass = step.type == 'select' || step.type == 'notify';
          var sx = step.sx;
          var sy = step.sy;
          var ex = step.ex;
          var ey = step.ey;
          if (sx === undefined) sx = step.x;
          if (sy === undefined) sy = step.y;
          if (ex === undefined) ex = step.x;
          if (ey === undefined) ey = step.y;
          this.paintColor(sx, sy, ex, ey, colorClass, addClass);
          break;
        case 'separate':
          this.deseparate(step.x, step.y);
          this.separate(step.x, step.y);
          break;
        case 'deseparate':
          this.deseparate(step.x, step.y);
          break;
        default:
          _get(Object.getPrototypeOf(Array2DTracer.prototype), 'processStep', this).call(this, step, options);
      }
    }
  }, {
    key: 'setData',
    value: function setData(D) {
      this.viewX = this.viewY = 0;
      this.paddingH = 6;
      this.paddingV = 3;
      this.fontSize = 16;

      if (_get(Object.getPrototypeOf(Array2DTracer.prototype), 'setData', this).apply(this, arguments)) {
        this.$table.find('.mtbl-row').each(function (i) {
          $(this).find('.mtbl-col').each(function (j) {
            $(this).text(refineByType(D[i][j]));
          });
        });
        return true;
      }

      this.$table.empty();
      for (var i = 0; i < D.length; i++) {
        var $row = $('<div class="mtbl-row">');
        this.$table.append($row);
        for (var j = 0; j < D[i].length; j++) {
          var $col = $('<div class="mtbl-col">').css(this.getCellCss()).text(refineByType(D[i][j]));
          $row.append($col);
        }
      }
      this.resize();

      return false;
    }
  }, {
    key: 'resize',
    value: function resize() {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'resize', this).call(this);

      this.refresh();
    }
  }, {
    key: 'clear',
    value: function clear() {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'clear', this).call(this);

      this.clearColor();
      this.deseparateAll();
    }
  }, {
    key: 'getCellCss',
    value: function getCellCss() {
      return {
        padding: this.paddingV.toFixed(1) + 'px ' + this.paddingH.toFixed(1) + 'px',
        'font-size': this.fontSize.toFixed(1) + 'px'
      };
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'refresh', this).call(this);

      var $parent = this.$table.parent();
      var top = $parent.height() / 2 - this.$table.height() / 2 + this.viewY;
      var left = $parent.width() / 2 - this.$table.width() / 2 + this.viewX;
      this.$table.css('margin-top', top);
      this.$table.css('margin-left', left);
    }
  }, {
    key: 'mousedown',
    value: function mousedown(e) {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'mousedown', this).call(this, e);

      this.dragX = e.pageX;
      this.dragY = e.pageY;
      this.dragging = true;
    }
  }, {
    key: 'mousemove',
    value: function mousemove(e) {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'mousemove', this).call(this, e);

      if (this.dragging) {
        this.viewX += e.pageX - this.dragX;
        this.viewY += e.pageY - this.dragY;
        this.dragX = e.pageX;
        this.dragY = e.pageY;
        this.refresh();
      }
    }
  }, {
    key: 'mouseup',
    value: function mouseup(e) {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'mouseup', this).call(this, e);

      this.dragging = false;
    }
  }, {
    key: 'mousewheel',
    value: function mousewheel(e) {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'mousewheel', this).call(this, e);

      e.preventDefault();
      e = e.originalEvent;
      var delta = e.wheelDelta !== undefined && e.wheelDelta || e.detail !== undefined && -e.detail;
      var weight = 1.01;
      var ratio = delta > 0 ? 1 / weight : weight;
      if (this.fontSize < 4 && ratio < 1) return;
      if (this.fontSize > 40 && ratio > 1) return;
      this.paddingV *= ratio;
      this.paddingH *= ratio;
      this.fontSize *= ratio;
      this.$table.find('.mtbl-col').css(this.getCellCss());
      this.refresh();
    }
  }, {
    key: 'paintColor',
    value: function paintColor(sx, sy, ex, ey, colorClass, addClass) {
      for (var i = sx; i <= ex; i++) {
        var $row = this.$table.find('.mtbl-row').eq(i);
        for (var j = sy; j <= ey; j++) {
          var $col = $row.find('.mtbl-col').eq(j);
          if (addClass) $col.addClass(colorClass);else $col.removeClass(colorClass);
        }
      }
    }
  }, {
    key: 'clearColor',
    value: function clearColor() {
      this.$table.find('.mtbl-col').removeClass(Object.keys(this.colorClass).join(' '));
    }
  }, {
    key: 'separate',
    value: function separate(x, y) {
      this.$table.find('.mtbl-row').each(function (i) {
        var $row = $(this);
        if (i == x) {
          $row.after($('<div class="mtbl-empty-row">').attr('data-row', i));
        }
        $row.find('.mtbl-col').each(function (j) {
          var $col = $(this);
          if (j == y) {
            $col.after($('<div class="mtbl-empty-col">').attr('data-col', j));
          }
        });
      });
    }
  }, {
    key: 'deseparate',
    value: function deseparate(x, y) {
      this.$table.find('[data-row=' + x + ']').remove();
      this.$table.find('[data-col=' + y + ']').remove();
    }
  }, {
    key: 'deseparateAll',
    value: function deseparateAll() {
      this.$table.find('.mtbl-empty-row, .mtbl-empty-col').remove();
    }
  }]);

  return Array2DTracer;
}(Tracer);

var initView = function initView(tracer) {
  tracer.$table = tracer.capsule.$table = $('<div class="mtbl-table">');
  tracer.$container.append(tracer.$table);
};

module.exports = Array2DTracer;

},{"../../tracer_manager/util/index":67,"./tracer":47}],42:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tracer = require('./tracer');

var ChartTracer = function (_Tracer) {
  _inherits(ChartTracer, _Tracer);

  _createClass(ChartTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'ChartTracer';
    }
  }]);

  function ChartTracer(name) {
    _classCallCheck(this, ChartTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ChartTracer).call(this, name));

    _this.color = {
      selected: 'rgba(255, 0, 0, 1)',
      notified: 'rgba(0, 0, 255, 1)',
      default: 'rgba(136, 136, 136, 1)'
    };

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(ChartTracer, [{
    key: 'setData',
    value: function setData(C) {
      if (_get(Object.getPrototypeOf(ChartTracer.prototype), 'setData', this).apply(this, arguments)) return true;

      var color = [];
      for (var i = 0; i < C.length; i++) {
        color.push(this.color.default);
      }this.chart.config.data = {
        labels: C.map(String),
        datasets: [{
          backgroundColor: color,
          data: C
        }]
      };
      this.chart.update();
    }
  }, {
    key: '_notify',
    value: function _notify(s, v) {
      this.manager.pushStep(this.capsule, {
        type: 'notify',
        s: s,
        v: v
      });
      return this;
    }
  }, {
    key: '_denotify',
    value: function _denotify(s) {
      this.manager.pushStep(this.capsule, {
        type: 'denotify',
        s: s
      });
      return this;
    }
  }, {
    key: '_select',
    value: function _select(s, e) {
      this.manager.pushStep(this.capsule, {
        type: 'select',
        s: s,
        e: e
      });
      return this;
    }
  }, {
    key: '_deselect',
    value: function _deselect(s, e) {
      this.manager.pushStep(this.capsule, {
        type: 'deselect',
        s: s,
        e: e
      });
      return this;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'notify':
          if (step.v !== undefined) {
            this.chart.config.data.datasets[0].data[step.s] = step.v;
            this.chart.config.data.labels[step.s] = step.v.toString();
          }
        case 'denotify':
        case 'deselect':
        case 'select':
          var color = step.type == 'notify' ? this.color.notified : step.type == 'select' ? this.color.selected : this.color.default;
          if (step.e !== undefined) for (var i = step.s; i <= step.e; i++) {
            this.chart.config.data.datasets[0].backgroundColor[i] = color;
          } else this.chart.config.data.datasets[0].backgroundColor[step.s] = color;
          this.chart.update();
          break;
        default:
          _get(Object.getPrototypeOf(ChartTracer.prototype), 'processStep', this).call(this, step, options);
      }
    }
  }, {
    key: 'resize',
    value: function resize() {
      _get(Object.getPrototypeOf(ChartTracer.prototype), 'resize', this).call(this);

      this.chart.resize();
    }
  }, {
    key: 'clear',
    value: function clear() {
      _get(Object.getPrototypeOf(ChartTracer.prototype), 'clear', this).call(this);

      var data = this.chart.config.data;
      if (data.datasets.length) {
        var backgroundColor = data.datasets[0].backgroundColor;
        for (var i = 0; i < backgroundColor.length; i++) {
          backgroundColor[i] = this.color.default;
        }
        this.chart.update();
      }
    }
  }]);

  return ChartTracer;
}(Tracer);

var initView = function initView(tracer) {
  tracer.$wrapper = tracer.capsule.$wrapper = $('<canvas class="mchrt-chart">');
  tracer.$container.append(tracer.$wrapper);
  tracer.chart = tracer.capsule.chart = new Chart(tracer.$wrapper, {
    type: 'bar',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      },
      animation: false,
      legend: false,
      responsive: true,
      maintainAspectRatio: false
    }
  });
};

module.exports = ChartTracer;

},{"./tracer":47}],43:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DirectedGraphTracer = require('./directed_graph');

var CoordinateSystemTracer = function (_DirectedGraphTracer) {
  _inherits(CoordinateSystemTracer, _DirectedGraphTracer);

  _createClass(CoordinateSystemTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'CoordinateSystemTracer';
    }
  }]);

  function CoordinateSystemTracer(name) {
    _classCallCheck(this, CoordinateSystemTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CoordinateSystemTracer).call(this, name));

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(CoordinateSystemTracer, [{
    key: 'setData',
    value: function setData(C) {
      if (Tracer.prototype.setData.apply(this, arguments)) return true;

      this.graph.clear();
      var nodes = [];
      var edges = [];
      for (var i = 0; i < C.length; i++) {
        nodes.push({
          id: this.n(i),
          x: C[i][0],
          y: C[i][1],
          label: '' + i,
          size: 1,
          color: this.color.default
        });
      }this.graph.read({
        nodes: nodes,
        edges: edges
      });
      this.s.camera.goTo({
        x: 0,
        y: 0,
        angle: 0,
        ratio: 1
      });
      this.refresh();

      return false;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'visit':
        case 'leave':
          var visit = step.type == 'visit';
          var targetNode = this.graph.nodes(this.n(step.target));
          var color = visit ? this.color.visited : this.color.left;
          targetNode.color = color;
          if (step.source !== undefined) {
            var edgeId = this.e(step.source, step.target);
            if (this.graph.edges(edgeId)) {
              var edge = this.graph.edges(edgeId);
              edge.color = color;
              this.graph.dropEdge(edgeId).addEdge(edge);
            } else {
              this.graph.addEdge({
                id: this.e(step.target, step.source),
                source: this.n(step.source),
                target: this.n(step.target),
                color: color,
                size: 1
              });
            }
          }
          if (this.logTracer) {
            var source = step.source;
            if (source === undefined) source = '';
            this.logTracer.print(visit ? source + ' -> ' + step.target : source + ' <- ' + step.target);
          }
          break;
        default:
          _get(Object.getPrototypeOf(CoordinateSystemTracer.prototype), 'processStep', this).call(this, step, options);
      }
    }
  }, {
    key: 'e',
    value: function e(v1, v2) {
      if (v1 > v2) {
        var temp = v1;
        v1 = v2;
        v2 = temp;
      }
      return 'e' + v1 + '_' + v2;
    }
  }, {
    key: 'drawOnHover',
    value: function drawOnHover(node, context, settings, next) {
      var tracer = this;

      context.setLineDash([5, 5]);
      var nodeIdx = node.id.substring(1);
      this.graph.edges().forEach(function (edge) {
        var ends = edge.id.substring(1).split("_");
        if (ends[0] == nodeIdx) {
          var color = '#0ff';
          var source = node;
          var target = tracer.graph.nodes('n' + ends[1]);
          tracer.drawEdge(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        } else if (ends[1] == nodeIdx) {
          var color = '#0ff';
          var source = tracer.graph.nodes('n' + ends[0]);
          var target = node;
          tracer.drawEdge(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        }
      });
    }
  }, {
    key: 'drawEdge',
    value: function drawEdge(edge, source, target, color, context, settings) {
      var prefix = settings('prefix') || '',
          size = edge[prefix + 'size'] || 1;

      context.strokeStyle = color;
      context.lineWidth = size;
      context.beginPath();
      context.moveTo(source[prefix + 'x'], source[prefix + 'y']);
      context.lineTo(target[prefix + 'x'], target[prefix + 'y']);
      context.stroke();
    }
  }]);

  return CoordinateSystemTracer;
}(DirectedGraphTracer);

var initView = function initView(tracer) {
  tracer.s.settings({
    defaultEdgeType: 'def',
    funcEdgesDef: function funcEdgesDef(edge, source, target, context, settings) {
      var color = tracer.getColor(edge, source, target, settings);
      tracer.drawEdge(edge, source, target, color, context, settings);
    }
  });
};

module.exports = CoordinateSystemTracer;

},{"./directed_graph":44}],44:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tracer = require('./tracer');

var _require = require('../../tracer_manager/util/index');

var refineByType = _require.refineByType;

var DirectedGraphTracer = function (_Tracer) {
  _inherits(DirectedGraphTracer, _Tracer);

  _createClass(DirectedGraphTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'DirectedGraphTracer';
    }
  }]);

  function DirectedGraphTracer(name) {
    _classCallCheck(this, DirectedGraphTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DirectedGraphTracer).call(this, name));

    _this.color = {
      selected: '#0f0',
      visited: '#f00',
      left: '#000',
      default: '#888'
    };

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(DirectedGraphTracer, [{
    key: '_setTreeData',
    value: function _setTreeData(G, root) {
      this.manager.pushStep(this.capsule, {
        type: 'setTreeData',
        arguments: arguments
      });
      return this;
    }
  }, {
    key: '_visit',
    value: function _visit(target, source) {
      this.manager.pushStep(this.capsule, {
        type: 'visit',
        target: target,
        source: source
      });
      return this;
    }
  }, {
    key: '_leave',
    value: function _leave(target, source) {
      this.manager.pushStep(this.capsule, {
        type: 'leave',
        target: target,
        source: source
      });
      return this;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'setTreeData':
          this.setTreeData.apply(this, step.arguments);
          break;
        case 'visit':
        case 'leave':
          var visit = step.type == 'visit';
          var targetNode = this.graph.nodes(this.n(step.target));
          var color = visit ? this.color.visited : this.color.left;
          targetNode.color = color;
          if (step.source !== undefined) {
            var edgeId = this.e(step.source, step.target);
            var edge = this.graph.edges(edgeId);
            edge.color = color;
            this.graph.dropEdge(edgeId).addEdge(edge);
          }
          if (this.logTracer) {
            var source = step.source;
            if (source === undefined) source = '';
            this.logTracer.print(visit ? source + ' -> ' + step.target : source + ' <- ' + step.target);
          }
          break;
        default:
          _get(Object.getPrototypeOf(DirectedGraphTracer.prototype), 'processStep', this).call(this, step, options);
      }
    }
  }, {
    key: 'setTreeData',
    value: function setTreeData(G, root, undirected) {
      var tracer = this;

      root = root || 0;
      var maxDepth = -1;

      var chk = new Array(G.length);
      var getDepth = function getDepth(node, depth) {
        if (chk[node]) throw "the given graph is not a tree because it forms a circuit";
        chk[node] = true;
        if (maxDepth < depth) maxDepth = depth;
        for (var i = 0; i < G[node].length; i++) {
          if (G[node][i]) getDepth(i, depth + 1);
        }
      };
      getDepth(root, 1);

      if (this.setData(G, undirected)) return true;

      var place = function place(node, x, y) {
        var temp = tracer.graph.nodes(tracer.n(node));
        temp.x = x;
        temp.y = y;
      };

      var wgap = 1 / (maxDepth - 1);
      var dfs = function dfs(node, depth, top, bottom) {
        place(node, top + bottom, depth * wgap);
        var children = 0;
        for (var i = 0; i < G[node].length; i++) {
          if (G[node][i]) children++;
        }
        var vgap = (bottom - top) / children;
        var cnt = 0;
        for (var i = 0; i < G[node].length; i++) {
          if (G[node][i]) dfs(i, depth + 1, top + vgap * cnt, top + vgap * ++cnt);
        }
      };
      dfs(root, 0, 0, 1);

      this.refresh();
    }
  }, {
    key: 'setData',
    value: function setData(G, undirected) {
      if (_get(Object.getPrototypeOf(DirectedGraphTracer.prototype), 'setData', this).apply(this, arguments)) return true;

      this.graph.clear();
      var nodes = [];
      var edges = [];
      var unitAngle = 2 * Math.PI / G.length;
      var currentAngle = 0;
      for (var i = 0; i < G.length; i++) {
        currentAngle += unitAngle;
        nodes.push({
          id: this.n(i),
          label: '' + i,
          x: .5 + Math.sin(currentAngle) / 2,
          y: .5 + Math.cos(currentAngle) / 2,
          size: 1,
          color: this.color.default,
          weight: 0
        });

        if (undirected) {
          for (var j = 0; j <= i; j++) {
            var value = G[i][j] || G[j][i];
            if (value) {
              edges.push({
                id: this.e(i, j),
                source: this.n(i),
                target: this.n(j),
                color: this.color.default,
                size: 1,
                weight: refineByType(value)
              });
            }
          }
        } else {
          for (var _j = 0; _j < G[i].length; _j++) {
            if (G[i][_j]) {
              edges.push({
                id: this.e(i, _j),
                source: this.n(i),
                target: this.n(_j),
                color: this.color.default,
                size: 1,
                weight: refineByType(G[i][_j])
              });
            }
          }
        }
      }

      this.graph.read({
        nodes: nodes,
        edges: edges
      });
      this.s.camera.goTo({
        x: 0,
        y: 0,
        angle: 0,
        ratio: 1
      });
      this.refresh();

      return false;
    }
  }, {
    key: 'resize',
    value: function resize() {
      _get(Object.getPrototypeOf(DirectedGraphTracer.prototype), 'resize', this).call(this);

      this.s.renderers[0].resize();
      this.refresh();
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      _get(Object.getPrototypeOf(DirectedGraphTracer.prototype), 'refresh', this).call(this);

      this.s.refresh();
    }
  }, {
    key: 'clear',
    value: function clear() {
      _get(Object.getPrototypeOf(DirectedGraphTracer.prototype), 'clear', this).call(this);

      this.clearGraphColor();
    }
  }, {
    key: 'clearGraphColor',
    value: function clearGraphColor() {
      var tracer = this;

      this.graph.nodes().forEach(function (node) {
        node.color = tracer.color.default;
      });
      this.graph.edges().forEach(function (edge) {
        edge.color = tracer.color.default;
      });
    }
  }, {
    key: 'n',
    value: function n(v) {
      return 'n' + v;
    }
  }, {
    key: 'e',
    value: function e(v1, v2) {
      return 'e' + v1 + '_' + v2;
    }
  }, {
    key: 'getColor',
    value: function getColor(edge, source, target, settings) {
      var color = edge.color,
          edgeColor = settings('edgeColor'),
          defaultNodeColor = settings('defaultNodeColor'),
          defaultEdgeColor = settings('defaultEdgeColor');
      if (!color) switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

      return color;
    }
  }, {
    key: 'drawLabel',
    value: function drawLabel(node, context, settings) {
      var fontSize,
          prefix = settings('prefix') || '',
          size = node[prefix + 'size'];

      if (size < settings('labelThreshold')) return;

      if (!node.label || typeof node.label !== 'string') return;

      fontSize = settings('labelSize') === 'fixed' ? settings('defaultLabelSize') : settings('labelSizeRatio') * size;

      context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') + fontSize + 'px ' + settings('font');
      context.fillStyle = settings('labelColor') === 'node' ? node.color || settings('defaultNodeColor') : settings('defaultLabelColor');

      context.textAlign = 'center';
      context.fillText(node.label, Math.round(node[prefix + 'x']), Math.round(node[prefix + 'y'] + fontSize / 3));
    }
  }, {
    key: 'drawArrow',
    value: function drawArrow(edge, source, target, color, context, settings) {
      var prefix = settings('prefix') || '',
          size = edge[prefix + 'size'] || 1,
          tSize = target[prefix + 'size'],
          sX = source[prefix + 'x'],
          sY = source[prefix + 'y'],
          tX = target[prefix + 'x'],
          tY = target[prefix + 'y'],
          angle = Math.atan2(tY - sY, tX - sX),
          dist = 3;
      sX += Math.sin(angle) * dist;
      tX += Math.sin(angle) * dist;
      sY += -Math.cos(angle) * dist;
      tY += -Math.cos(angle) * dist;
      var aSize = Math.max(size * 2.5, settings('minArrowSize')),
          d = Math.sqrt(Math.pow(tX - sX, 2) + Math.pow(tY - sY, 2)),
          aX = sX + (tX - sX) * (d - aSize - tSize) / d,
          aY = sY + (tY - sY) * (d - aSize - tSize) / d,
          vX = (tX - sX) * aSize / d,
          vY = (tY - sY) * aSize / d;

      context.strokeStyle = color;
      context.lineWidth = size;
      context.beginPath();
      context.moveTo(sX, sY);
      context.lineTo(aX, aY);
      context.stroke();

      context.fillStyle = color;
      context.beginPath();
      context.moveTo(aX + vX, aY + vY);
      context.lineTo(aX + vY * 0.6, aY - vX * 0.6);
      context.lineTo(aX - vY * 0.6, aY + vX * 0.6);
      context.lineTo(aX + vX, aY + vY);
      context.closePath();
      context.fill();
    }
  }, {
    key: 'drawOnHover',
    value: function drawOnHover(node, context, settings, next) {
      var tracer = this;

      context.setLineDash([5, 5]);
      var nodeIdx = node.id.substring(1);
      this.graph.edges().forEach(function (edge) {
        var ends = edge.id.substring(1).split("_");
        if (ends[0] == nodeIdx) {
          var color = '#0ff';
          var source = node;
          var target = tracer.graph.nodes('n' + ends[1]);
          tracer.drawArrow(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        } else if (ends[1] == nodeIdx) {
          var color = '#ff0';
          var source = tracer.graph.nodes('n' + ends[0]);
          var target = node;
          tracer.drawArrow(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        }
      });
    }
  }]);

  return DirectedGraphTracer;
}(Tracer);

var initView = function initView(tracer) {
  tracer.s = tracer.capsule.s = new sigma({
    renderer: {
      container: tracer.$container[0],
      type: 'canvas'
    },
    settings: {
      minArrowSize: 8,
      defaultEdgeType: 'arrow',
      maxEdgeSize: 2.5,
      labelThreshold: 4,
      font: 'Roboto',
      defaultLabelColor: '#fff',
      zoomMin: 0.6,
      zoomMax: 1.2,
      skipErrors: true,
      minNodeSize: .5,
      maxNodeSize: 12,
      labelSize: 'proportional',
      labelSizeRatio: 1.3,
      funcLabelsDef: function funcLabelsDef(node, context, settings) {
        tracer.drawLabel(node, context, settings);
      },
      funcHoversDef: function funcHoversDef(node, context, settings, next) {
        tracer.drawOnHover(node, context, settings, next);
      },
      funcEdgesArrow: function funcEdgesArrow(edge, source, target, context, settings) {
        var color = tracer.getColor(edge, source, target, settings);
        tracer.drawArrow(edge, source, target, color, context, settings);
      }
    }
  });
  sigma.plugins.dragNodes(tracer.s, tracer.s.renderers[0]);
  tracer.graph = tracer.capsule.graph = tracer.s.graph;
};

sigma.canvas.labels.def = function (node, context, settings) {
  var func = settings('funcLabelsDef');
  if (func) {
    func(node, context, settings);
  }
};
sigma.canvas.hovers.def = function (node, context, settings) {
  var func = settings('funcHoversDef');
  if (func) {
    func(node, context, settings);
  }
};
sigma.canvas.edges.def = function (edge, source, target, context, settings) {
  var func = settings('funcEdgesDef');
  if (func) {
    func(edge, source, target, context, settings);
  }
};
sigma.canvas.edges.arrow = function (edge, source, target, context, settings) {
  var func = settings('funcEdgesArrow');
  if (func) {
    func(edge, source, target, context, settings);
  }
};

module.exports = DirectedGraphTracer;

},{"../../tracer_manager/util/index":67,"./tracer":47}],45:[function(require,module,exports){
'use strict';

var Tracer = require('./tracer');
var LogTracer = require('./log');
var Array1DTracer = require('./array1d');
var Array2DTracer = require('./array2d');
var ChartTracer = require('./chart');
var CoordinateSystemTracer = require('./coordinate_system');
var DirectedGraphTracer = require('./directed_graph');
var UndirectedGraphTracer = require('./undirected_graph');
var WeightedDirectedGraphTracer = require('./weighted_directed_graph');
var WeightedUndirectedGraphTracer = require('./weighted_undirected_graph');

module.exports = {
  Tracer: Tracer,
  LogTracer: LogTracer,
  Array1DTracer: Array1DTracer,
  Array2DTracer: Array2DTracer,
  ChartTracer: ChartTracer,
  CoordinateSystemTracer: CoordinateSystemTracer,
  DirectedGraphTracer: DirectedGraphTracer,
  UndirectedGraphTracer: UndirectedGraphTracer,
  WeightedDirectedGraphTracer: WeightedDirectedGraphTracer,
  WeightedUndirectedGraphTracer: WeightedUndirectedGraphTracer
};

},{"./array1d":40,"./array2d":41,"./chart":42,"./coordinate_system":43,"./directed_graph":44,"./log":46,"./tracer":47,"./undirected_graph":48,"./weighted_directed_graph":49,"./weighted_undirected_graph":50}],46:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tracer = require('./tracer');

var LogTracer = function (_Tracer) {
  _inherits(LogTracer, _Tracer);

  _createClass(LogTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'LogTracer';
    }
  }]);

  function LogTracer(name) {
    _classCallCheck(this, LogTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LogTracer).call(this, name));

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(LogTracer, [{
    key: '_print',
    value: function _print(msg) {
      this.manager.pushStep(this.capsule, {
        type: 'print',
        msg: msg
      });
      return this;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'print':
          this.print(step.msg);
          break;
      }
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      this.scrollToEnd(Math.min(50, this.interval));
    }
  }, {
    key: 'clear',
    value: function clear() {
      _get(Object.getPrototypeOf(LogTracer.prototype), 'clear', this).call(this);

      this.$wrapper.empty();
    }
  }, {
    key: 'print',
    value: function print(message) {
      this.$wrapper.append($('<span>').append(message + '<br/>'));
    }
  }, {
    key: 'scrollToEnd',
    value: function scrollToEnd(duration) {
      this.$container.animate({
        scrollTop: this.$container[0].scrollHeight
      }, duration);
    }
  }]);

  return LogTracer;
}(Tracer);

var initView = function initView(tracer) {
  tracer.$wrapper = tracer.capsule.$wrapper = $('<div class="wrapper">');
  tracer.$container.append(tracer.$wrapper);
};

module.exports = LogTracer;

},{"./tracer":47}],47:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var app = require('../../app');

var _require = require('../../tracer_manager/util/index');

var toJSON = _require.toJSON;
var fromJSON = _require.fromJSON;

var Tracer = function () {
  _createClass(Tracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'Tracer';
    }
  }]);

  function Tracer(name) {
    _classCallCheck(this, Tracer);

    this.module = this.constructor;

    this.manager = app.getTracerManager();
    this.capsule = this.manager.allocate(this);
    $.extend(this, this.capsule);

    this.setName(name);
  }

  _createClass(Tracer, [{
    key: '_setData',
    value: function _setData() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.manager.pushStep(this.capsule, {
        type: 'setData',
        args: toJSON(args)
      });
      return this;
    }
  }, {
    key: '_clear',
    value: function _clear() {
      this.manager.pushStep(this.capsule, {
        type: 'clear'
      });
      return this;
    }
  }, {
    key: '_wait',
    value: function _wait() {
      this.manager.newStep();
      return this;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      var type = step.type;
      var args = step.args;


      switch (type) {
        case 'setData':
          this.setData.apply(this, _toConsumableArray(fromJSON(args)));
          break;
        case 'clear':
          this.clear();
          break;
      }
    }
  }, {
    key: 'setName',
    value: function setName(name) {
      var $name = void 0;
      if (this.isNew) {
        $name = $('<span class="name">');
        this.$container.append($name);
      } else {
        $name = this.$container.find('span.name');
      }
      $name.text(name || this.defaultName);
    }
  }, {
    key: 'setData',
    value: function setData() {
      var data = toJSON(arguments);
      if (!this.isNew && this.lastData === data) {
        return true;
      }
      this.lastData = this.capsule.lastData = data;
      return false;
    }
  }, {
    key: 'resize',
    value: function resize() {}
  }, {
    key: 'refresh',
    value: function refresh() {}
  }, {
    key: 'clear',
    value: function clear() {}
  }, {
    key: 'attach',
    value: function attach(tracer) {
      if (tracer.module === LogTracer) {
        this.logTracer = tracer;
      }
      return this;
    }
  }, {
    key: 'mousedown',
    value: function mousedown(e) {}
  }, {
    key: 'mousemove',
    value: function mousemove(e) {}
  }, {
    key: 'mouseup',
    value: function mouseup(e) {}
  }, {
    key: 'mousewheel',
    value: function mousewheel(e) {}
  }]);

  return Tracer;
}();

module.exports = Tracer;

},{"../../app":3,"../../tracer_manager/util/index":67}],48:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DirectedGraphTracer = require('./directed_graph');

var UndirectedGraphTracer = function (_DirectedGraphTracer) {
  _inherits(UndirectedGraphTracer, _DirectedGraphTracer);

  _createClass(UndirectedGraphTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'UndirectedGraphTracer';
    }
  }]);

  function UndirectedGraphTracer(name) {
    _classCallCheck(this, UndirectedGraphTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UndirectedGraphTracer).call(this, name));

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(UndirectedGraphTracer, [{
    key: 'setTreeData',
    value: function setTreeData(G, root) {
      return _get(Object.getPrototypeOf(UndirectedGraphTracer.prototype), 'setTreeData', this).call(this, G, root, true);
    }
  }, {
    key: 'setData',
    value: function setData(G) {
      return _get(Object.getPrototypeOf(UndirectedGraphTracer.prototype), 'setData', this).call(this, G, true);
    }
  }, {
    key: 'e',
    value: function e(v1, v2) {
      if (v1 > v2) {
        var temp = v1;
        v1 = v2;
        v2 = temp;
      }
      return 'e' + v1 + '_' + v2;
    }
  }, {
    key: 'drawOnHover',
    value: function drawOnHover(node, context, settings, next) {
      var tracer = this;

      context.setLineDash([5, 5]);
      var nodeIdx = node.id.substring(1);
      this.graph.edges().forEach(function (edge) {
        var ends = edge.id.substring(1).split("_");
        if (ends[0] == nodeIdx) {
          var color = '#0ff';
          var source = node;
          var target = tracer.graph.nodes('n' + ends[1]);
          tracer.drawEdge(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        } else if (ends[1] == nodeIdx) {
          var color = '#0ff';
          var source = tracer.graph.nodes('n' + ends[0]);
          var target = node;
          tracer.drawEdge(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        }
      });
    }
  }, {
    key: 'drawEdge',
    value: function drawEdge(edge, source, target, color, context, settings) {
      var prefix = settings('prefix') || '',
          size = edge[prefix + 'size'] || 1;

      context.strokeStyle = color;
      context.lineWidth = size;
      context.beginPath();
      context.moveTo(source[prefix + 'x'], source[prefix + 'y']);
      context.lineTo(target[prefix + 'x'], target[prefix + 'y']);
      context.stroke();
    }
  }]);

  return UndirectedGraphTracer;
}(DirectedGraphTracer);

var initView = function initView(tracer) {
  tracer.s.settings({
    defaultEdgeType: 'def',
    funcEdgesDef: function funcEdgesDef(edge, source, target, context, settings) {
      var color = tracer.getColor(edge, source, target, settings);
      tracer.drawEdge(edge, source, target, color, context, settings);
    }
  });
};

module.exports = UndirectedGraphTracer;

},{"./directed_graph":44}],49:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DirectedGraphTracer = require('./directed_graph');

var _require = require('../../tracer_manager/util/index');

var refineByType = _require.refineByType;

var WeightedDirectedGraphTracer = function (_DirectedGraphTracer) {
  _inherits(WeightedDirectedGraphTracer, _DirectedGraphTracer);

  _createClass(WeightedDirectedGraphTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'WeightedDirectedGraphTracer';
    }
  }]);

  function WeightedDirectedGraphTracer(name) {
    _classCallCheck(this, WeightedDirectedGraphTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeightedDirectedGraphTracer).call(this, name));

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(WeightedDirectedGraphTracer, [{
    key: '_weight',
    value: function _weight(target, weight) {
      this.manager.pushStep(this.capsule, {
        type: 'weight',
        target: target,
        weight: weight
      });
      return this;
    }
  }, {
    key: '_visit',
    value: function _visit(target, source, weight) {
      this.manager.pushStep(this.capsule, {
        type: 'visit',
        target: target,
        source: source,
        weight: weight
      });
      return this;
    }
  }, {
    key: '_leave',
    value: function _leave(target, source, weight) {
      this.manager.pushStep(this.capsule, {
        type: 'leave',
        target: target,
        source: source,
        weight: weight
      });
      return this;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'weight':
          var targetNode = this.graph.nodes(this.n(step.target));
          if (step.weight !== undefined) targetNode.weight = refineByType(step.weight);
          break;
        case 'visit':
        case 'leave':
          var visit = step.type == 'visit';
          var targetNode = this.graph.nodes(this.n(step.target));
          var color = visit ? step.weight === undefined ? this.color.selected : this.color.visited : this.color.left;
          targetNode.color = color;
          if (step.weight !== undefined) targetNode.weight = refineByType(step.weight);
          if (step.source !== undefined) {
            var edgeId = this.e(step.source, step.target);
            var edge = this.graph.edges(edgeId);
            edge.color = color;
            this.graph.dropEdge(edgeId).addEdge(edge);
          }
          if (this.logTracer) {
            var source = step.source;
            if (source === undefined) source = '';
            this.logTracer.print(visit ? source + ' -> ' + step.target : source + ' <- ' + step.target);
          }
          break;
        default:
          _get(Object.getPrototypeOf(WeightedDirectedGraphTracer.prototype), 'processStep', this).call(this, step, options);
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      _get(Object.getPrototypeOf(WeightedDirectedGraphTracer.prototype), 'clear', this).call(this);

      this.clearWeights();
    }
  }, {
    key: 'clearWeights',
    value: function clearWeights() {
      this.graph.nodes().forEach(function (node) {
        node.weight = 0;
      });
    }
  }, {
    key: 'drawEdgeWeight',
    value: function drawEdgeWeight(edge, source, target, color, context, settings) {
      if (source == target) return;

      var prefix = settings('prefix') || '',
          size = edge[prefix + 'size'] || 1;

      if (size < settings('edgeLabelThreshold')) return;

      if (0 === settings('edgeLabelSizePowRatio')) throw '"edgeLabelSizePowRatio" must not be 0.';

      var fontSize,
          x = (source[prefix + 'x'] + target[prefix + 'x']) / 2,
          y = (source[prefix + 'y'] + target[prefix + 'y']) / 2,
          dX = target[prefix + 'x'] - source[prefix + 'x'],
          dY = target[prefix + 'y'] - source[prefix + 'y'],
          angle = Math.atan2(dY, dX);

      fontSize = settings('edgeLabelSize') === 'fixed' ? settings('defaultEdgeLabelSize') : settings('defaultEdgeLabelSize') * size * Math.pow(size, -1 / settings('edgeLabelSizePowRatio'));

      context.save();

      if (edge.active) {
        context.font = [settings('activeFontStyle'), fontSize + 'px', settings('activeFont') || settings('font')].join(' ');

        context.fillStyle = color;
      } else {
        context.font = [settings('fontStyle'), fontSize + 'px', settings('font')].join(' ');

        context.fillStyle = color;
      }

      context.textAlign = 'center';
      context.textBaseline = 'alphabetic';

      context.translate(x, y);
      context.rotate(angle);
      context.fillText(edge.weight, 0, -size / 2 - 3);

      context.restore();
    }
  }, {
    key: 'drawNodeWeight',
    value: function drawNodeWeight(node, context, settings) {
      var fontSize,
          prefix = settings('prefix') || '',
          size = node[prefix + 'size'];

      if (size < settings('labelThreshold')) return;

      fontSize = settings('labelSize') === 'fixed' ? settings('defaultLabelSize') : settings('labelSizeRatio') * size;

      context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') + fontSize + 'px ' + settings('font');
      context.fillStyle = settings('labelColor') === 'node' ? node.color || settings('defaultNodeColor') : settings('defaultLabelColor');

      context.textAlign = 'left';
      context.fillText(node.weight, Math.round(node[prefix + 'x'] + size * 1.5), Math.round(node[prefix + 'y'] + fontSize / 3));
    }
  }]);

  return WeightedDirectedGraphTracer;
}(DirectedGraphTracer);

var initView = function initView(tracer) {
  tracer.s.settings({
    edgeLabelSize: 'proportional',
    defaultEdgeLabelSize: 20,
    edgeLabelSizePowRatio: 0.8,
    funcLabelsDef: function funcLabelsDef(node, context, settings) {
      tracer.drawNodeWeight(node, context, settings);
      tracer.drawLabel(node, context, settings);
    },
    funcHoversDef: function funcHoversDef(node, context, settings) {
      tracer.drawOnHover(node, context, settings, tracer.drawEdgeWeight);
    },
    funcEdgesArrow: function funcEdgesArrow(edge, source, target, context, settings) {
      var color = tracer.getColor(edge, source, target, settings);
      tracer.drawArrow(edge, source, target, color, context, settings);
      tracer.drawEdgeWeight(edge, source, target, color, context, settings);
    }
  });
};

module.exports = WeightedDirectedGraphTracer;

},{"../../tracer_manager/util/index":67,"./directed_graph":44}],50:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WeightedDirectedGraphTracer = require('./weighted_directed_graph');
var UndirectedGraphTracer = require('./undirected_graph');

var WeightedUndirectedGraphTracer = function (_WeightedDirectedGrap) {
  _inherits(WeightedUndirectedGraphTracer, _WeightedDirectedGrap);

  _createClass(WeightedUndirectedGraphTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'WeightedUndirectedGraphTracer';
    }
  }]);

  function WeightedUndirectedGraphTracer(name) {
    _classCallCheck(this, WeightedUndirectedGraphTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeightedUndirectedGraphTracer).call(this, name));

    _this.e = UndirectedGraphTracer.prototype.e;
    _this.drawOnHover = UndirectedGraphTracer.prototype.drawOnHover;
    _this.drawEdge = UndirectedGraphTracer.prototype.drawEdge;

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(WeightedUndirectedGraphTracer, [{
    key: 'setTreeData',
    value: function setTreeData(G, root) {
      return _get(Object.getPrototypeOf(WeightedUndirectedGraphTracer.prototype), 'setTreeData', this).call(this, G, root, true);
    }
  }, {
    key: 'setData',
    value: function setData(G) {
      return _get(Object.getPrototypeOf(WeightedUndirectedGraphTracer.prototype), 'setData', this).call(this, G, true);
    }
  }, {
    key: 'drawEdgeWeight',
    value: function drawEdgeWeight(edge, source, target, color, context, settings) {
      var prefix = settings('prefix') || '';
      if (source[prefix + 'x'] > target[prefix + 'x']) {
        var temp = source;
        source = target;
        target = temp;
      }
      WeightedDirectedGraphTracer.prototype.drawEdgeWeight.call(this, edge, source, target, color, context, settings);
    }
  }]);

  return WeightedUndirectedGraphTracer;
}(WeightedDirectedGraphTracer);

var initView = function initView(tracer) {
  tracer.s.settings({
    defaultEdgeType: 'def',
    funcEdgesDef: function funcEdgesDef(edge, source, target, context, settings) {
      var color = tracer.getColor(edge, source, target, settings);
      tracer.drawEdge(edge, source, target, color, context, settings);
      tracer.drawEdgeWeight(edge, source, target, color, context, settings);
    }
  });
};

module.exports = WeightedUndirectedGraphTracer;

},{"./undirected_graph":48,"./weighted_directed_graph":49}],51:[function(require,module,exports){
'use strict';

var request = require('./request');

module.exports = function (url) {
  return request(url, {
    type: 'GET'
  });
};

},{"./request":54}],52:[function(require,module,exports){
'use strict';

var request = require('./request');

module.exports = function (url) {
  return request(url, {
    dataType: 'json',
    type: 'GET'
  });
};

},{"./request":54}],53:[function(require,module,exports){
'use strict';

var request = require('./request');

module.exports = function (url, data) {
  return request(url, {
    dataType: 'json',
    type: 'POST',
    data: JSON.stringify(data)
  });
};

},{"./request":54}],54:[function(require,module,exports){
'use strict';

var RSVP = require('rsvp');
var app = require('../../app');

var _$ = $;
var ajax = _$.ajax;
var extend = _$.extend;


var defaults = {};

module.exports = function (url) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  app.setIsLoading(true);

  return new RSVP.Promise(function (resolve, reject) {
    var callbacks = {
      success: function success(response) {
        app.setIsLoading(false);
        resolve(response);
      },
      error: function error(reason) {
        app.setIsLoading(false);
        reject(reason);
      }
    };

    var opts = extend({}, defaults, options, callbacks, {
      url: url
    });

    ajax(opts);
  });
};

},{"../../app":3,"rsvp":72}],55:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var app = require('../app');
var Toast = require('../dom/toast');

var checkLoading = function checkLoading() {
  if (app.getIsLoading()) {
    Toast.showErrorToast('Wait until it completes loading of previous file.');
    return true;
  }
  return false;
};

var getParameterByName = function getParameterByName(name) {
  var url = window.location.href;
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');

  var results = regex.exec(url);

  if (!results || results.length !== 3) {
    return null;
  }

  var _results = _slicedToArray(results, 3);

  var id = _results[2];


  return id;
};

var getHashValue = function getHashValue(key) {
  if (!key) return null;
  var hash = window.location.hash.substr(1);
  var params = hash ? hash.split('&') : [];
  for (var i = 0; i < params.length; i++) {
    var pair = params[i].split('=');
    if (pair[0] === key) {
      return pair[1];
    }
  }
  return null;
};

var setHashValue = function setHashValue(key, value) {
  if (!key || !value) return;
  var hash = window.location.hash.substr(1);
  var params = hash ? hash.split('&') : [];

  var found = false;
  for (var i = 0; i < params.length && !found; i++) {
    var pair = params[i].split('=');
    if (pair[0] === key) {
      pair[1] = value;
      params[i] = pair.join('=');
      found = true;
    }
  }
  if (!found) {
    params.push([key, value].join('='));
  }

  var newHash = params.join('&');
  window.location.hash = '#' + newHash;
};

var removeHashValue = function removeHashValue(key) {
  if (!key) return;
  var hash = window.location.hash.substr(1);
  var params = hash ? hash.split('&') : [];

  for (var i = 0; i < params.length; i++) {
    var pair = params[i].split('=');
    if (pair[0] === key) {
      params.splice(i, 1);
      break;
    }
  }

  var newHash = params.join('&');
  window.location.hash = '#' + newHash;
};

var setPath = function setPath(category, algorithm, file) {
  var path = category ? category + (algorithm ? '/' + algorithm + (file ? '/' + file : '') : '') : '';
  setHashValue('path', path);
};

var getPath = function getPath() {
  var hash = getHashValue('path');
  if (hash) {
    var _hash$split = hash.split('/');

    var _hash$split2 = _slicedToArray(_hash$split, 3);

    var category = _hash$split2[0];
    var algorithm = _hash$split2[1];
    var file = _hash$split2[2];

    return { category: category, algorithm: algorithm, file: file };
  } else {
    return false;
  }
};

module.exports = {
  checkLoading: checkLoading,
  getParameterByName: getParameterByName,
  getHashValue: getHashValue,
  setHashValue: setHashValue,
  removeHashValue: removeHashValue,
  setPath: setPath,
  getPath: getPath
};

},{"../app":3,"../dom/toast":25}],56:[function(require,module,exports){
'use strict';

var loadAlgorithm = require('./load_algorithm');
var loadCategories = require('./load_categories');
var loadFile = require('./load_file');
var loadScratchPaper = require('./load_scratch_paper');
var shareScratchPaper = require('./share_scratch_paper');
var loadWikiList = require('./load_wiki_list');
var loadWiki = require('./load_wiki');

module.exports = {
  loadAlgorithm: loadAlgorithm,
  loadCategories: loadCategories,
  loadFile: loadFile,
  loadScratchPaper: loadScratchPaper,
  shareScratchPaper: shareScratchPaper,
  loadWikiList: loadWikiList,
  loadWiki: loadWiki
};

},{"./load_algorithm":57,"./load_categories":58,"./load_file":59,"./load_scratch_paper":60,"./load_wiki":61,"./load_wiki_list":62,"./share_scratch_paper":63}],57:[function(require,module,exports){
'use strict';

var getJSON = require('./ajax/get_json');

var _require = require('../utils');

var getAlgorithmDir = _require.getAlgorithmDir;


module.exports = function (category, algorithm) {
  var dir = getAlgorithmDir(category, algorithm);
  return getJSON(dir + 'desc.json');
};

},{"../utils":70,"./ajax/get_json":52}],58:[function(require,module,exports){
'use strict';

var getJSON = require('./ajax/get_json');

module.exports = function () {
  return getJSON('./algorithm/category.json');
};

},{"./ajax/get_json":52}],59:[function(require,module,exports){
'use strict';

var RSVP = require('rsvp');

var app = require('../app');

var _require = require('../utils');

var getFileDir = _require.getFileDir;
var isScratchPaper = _require.isScratchPaper;

var _require2 = require('./helpers');

var checkLoading = _require2.checkLoading;
var setPath = _require2.setPath;


var get = require('./ajax/get');

var loadDataAndCode = function loadDataAndCode(dir) {
  return RSVP.hash({
    data: get(dir + 'data.js'),
    code: get(dir + 'code.js')
  });
};

var loadFileAndUpdateContent = function loadFileAndUpdateContent(dir) {
  app.getEditor().clearContent();

  return loadDataAndCode(dir).then(function (content) {
    app.updateCachedFile(dir, content);
    app.getEditor().setContent(content);
  });
};

var cachedContentExists = function cachedContentExists(cachedFile) {
  return cachedFile && cachedFile.data !== undefined && cachedFile.code !== undefined;
};

module.exports = function (category, algorithm, file, explanation) {
  return new RSVP.Promise(function (resolve, reject) {
    if (checkLoading()) {
      reject();
    } else {
      if (isScratchPaper(category)) {
        setPath(category, app.getLoadedScratch());
      } else {
        setPath(category, algorithm, file);
      }
      $('#explanation').html(explanation);

      var dir = getFileDir(category, algorithm, file);
      app.setLastFileUsed(dir);
      var cachedFile = app.getCachedFile(dir);

      if (cachedContentExists(cachedFile)) {
        app.getEditor().setContent(cachedFile);
        resolve();
      } else {
        loadFileAndUpdateContent(dir).then(resolve, reject);
      }
    }
  });
};

},{"../app":3,"../utils":70,"./ajax/get":51,"./helpers":55,"rsvp":72}],60:[function(require,module,exports){
'use strict';

var RSVP = require('rsvp');
var app = require('../app');

var _require = require('../utils');

var getFileDir = _require.getFileDir;


var getJSON = require('./ajax/get_json');
var loadAlgorithm = require('./load_algorithm');

var extractGistCode = function extractGistCode(files, name) {
  return files[name + '.js'].content;
};

module.exports = function (gistID) {
  return new RSVP.Promise(function (resolve, reject) {
    app.setLoadedScratch(gistID);

    getJSON('https://api.github.com/gists/' + gistID).then(function (_ref) {
      var files = _ref.files;


      var category = 'scratch';
      var algorithm = gistID;

      loadAlgorithm(category, algorithm).then(function (data) {

        var algoData = extractGistCode(files, 'data');
        var algoCode = extractGistCode(files, 'code');

        // update scratch paper algo code with the loaded gist code
        var dir = getFileDir(category, algorithm, 'scratch_paper');
        app.updateCachedFile(dir, {
          data: algoData,
          code: algoCode,
          'CREDIT.md': 'Shared by an anonymous user from http://parkjs814.github.io/AlgorithmVisualizer'
        });

        resolve({
          category: category,
          algorithm: algorithm,
          data: data
        });
      });
    });
  });
};

},{"../app":3,"../utils":70,"./ajax/get_json":52,"./load_algorithm":57,"rsvp":72}],61:[function(require,module,exports){
'use strict';

var get = require('./ajax/get');

module.exports = function (wiki) {
  return get('./AlgorithmVisualizer.wiki/' + wiki + '.md');
};

},{"./ajax/get":51}],62:[function(require,module,exports){
'use strict';

var getJSON = require('./ajax/get_json');

module.exports = function () {
  return getJSON('./wiki.json');
};

},{"./ajax/get_json":52}],63:[function(require,module,exports){
'use strict';

var RSVP = require('rsvp');
var app = require('../app');

var postJSON = require('./ajax/post_json');

var _require = require('./helpers');

var setPath = _require.setPath;


module.exports = function () {
  return new RSVP.Promise(function (resolve, reject) {
    var _app$getEditor = app.getEditor();

    var dataEditor = _app$getEditor.dataEditor;
    var codeEditor = _app$getEditor.codeEditor;


    var gist = {
      'description': 'temp',
      'public': true,
      'files': {
        'data.js': {
          'content': dataEditor.getValue()
        },
        'code.js': {
          'content': codeEditor.getValue()
        }
      }
    };

    postJSON('https://api.github.com/gists', gist).then(function (_ref) {
      var id = _ref.id;

      app.setLoadedScratch(id);
      setPath('scratch', id);
      var _location = location;
      var href = _location.href;

      $('#algorithm').html('Shared');
      resolve(href);
    });
  });
};

},{"../app":3,"./ajax/post_json":53,"./helpers":55,"rsvp":72}],64:[function(require,module,exports){
'use strict';

var TracerManager = require('./manager');
var Tracer = require('../module/tracer/tracer');

module.exports = {
  init: function init() {
    var tm = new TracerManager();
    Tracer.prototype.manager = tm;
    return tm;
  }
};

},{"../module/tracer/tracer":47,"./manager":65}],65:[function(require,module,exports){
'use strict';

var ModuleContainer = require('../dom/module_container');
var TopMenu = require('../dom/top_menu');

var _$ = $;
var each = _$.each;
var extend = _$.extend;
var grep = _$.grep;


var stepLimit = 1e6;

var TracerManager = function TracerManager() {
  this.timer = null;
  this.pause = false;
  this.capsules = [];
  this.interval = 500;
};

TracerManager.prototype = {
  add: function add(tracer) {

    var $container = ModuleContainer.create();

    var capsule = {
      module: tracer.module,
      tracer: tracer,
      allocated: true,
      defaultName: null,
      $container: $container,
      isNew: true
    };

    this.capsules.push(capsule);
    return capsule;
  },
  allocate: function allocate(newTracer) {
    var selectedCapsule = null;
    var count = 0;

    each(this.capsules, function (i, capsule) {
      if (capsule.module === newTracer.module) {
        count++;
        if (!capsule.allocated) {
          capsule.tracer = newTracer;
          capsule.allocated = true;
          capsule.isNew = false;
          selectedCapsule = capsule;
          return false;
        }
      }
    });

    if (selectedCapsule === null) {
      count++;
      selectedCapsule = this.add(newTracer);
    }

    var className = newTracer.module.getClassName();
    selectedCapsule.defaultName = className + ' ' + count;
    selectedCapsule.order = this.order++;
    return selectedCapsule;
  },
  deallocateAll: function deallocateAll() {
    this.order = 0;
    this.reset();
    each(this.capsules, function (i, capsule) {
      capsule.allocated = false;
    });
  },
  removeUnallocated: function removeUnallocated() {
    var changed = false;

    this.capsules = grep(this.capsules, function (capsule) {
      var removed = !capsule.allocated;

      if (capsule.isNew || removed) {
        changed = true;
      }
      if (removed) {
        capsule.$container.remove();
      }

      return !removed;
    });

    if (changed) {
      this.place();
    }
  },
  place: function place() {
    var capsules = this.capsules;


    each(capsules, function (i, capsule) {
      var width = 100;
      var height = 100 / capsules.length;
      var top = height * capsule.order;

      capsule.$container.css({
        top: top + '%',
        width: width + '%',
        height: height + '%'
      });

      capsule.tracer.resize();
    });
  },
  resize: function resize() {
    this.command('resize');
  },
  isPause: function isPause() {
    return this.pause;
  },
  setInterval: function setInterval(interval) {
    TopMenu.setInterval(interval);
  },
  reset: function reset() {
    this.traces = [];
    this.traceIndex = -1;
    this.stepCnt = 0;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.command('clear');
  },
  pushStep: function pushStep(capsule, step) {
    if (this.stepCnt++ > stepLimit) throw "Tracer's stack overflow";
    var len = this.traces.length;
    var last = [];
    if (len === 0) {
      this.traces.push(last);
    } else {
      last = this.traces[len - 1];
    }
    last.push(extend(step, {
      capsule: capsule
    }));
  },
  newStep: function newStep() {
    this.traces.push([]);
  },
  pauseStep: function pauseStep() {
    if (this.traceIndex < 0) return;
    this.pause = true;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    TopMenu.activateBtnPause();
  },
  resumeStep: function resumeStep() {
    this.pause = false;
    this.step(this.traceIndex + 1);
    TopMenu.deactivateBtnPause();
  },
  step: function step(i) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var tracer = this;

    if (isNaN(i) || i >= this.traces.length || i < 0) return;

    this.traceIndex = i;
    var trace = this.traces[i];
    trace.forEach(function (step) {
      step.capsule.tracer.processStep(step, options);
    });

    if (!options.virtual) {
      this.command('refresh');
    }

    if (this.pause) return;

    this.timer = setTimeout(function () {
      if (!tracer.nextStep(options)) {
        TopMenu.resetTopMenuButtons();
      }
    }, this.interval);
  },
  prevStep: function prevStep() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    this.command('clear');

    var finalIndex = this.traceIndex - 1;
    if (finalIndex < 0) {
      this.traceIndex = -1;
      this.command('refresh');
      return false;
    }

    for (var i = 0; i < finalIndex; i++) {
      this.step(i, extend(options, {
        virtual: true
      }));
    }

    this.step(finalIndex);
    return true;
  },
  nextStep: function nextStep() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var finalIndex = this.traceIndex + 1;
    if (finalIndex >= this.traces.length) {
      this.traceIndex = this.traces.length - 1;
      return false;
    }

    this.step(finalIndex, options);
    return true;
  },
  visualize: function visualize() {
    this.traceIndex = -1;
    this.resumeStep();
  },
  command: function command() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var functionName = args.shift();
    each(this.capsules, function (i, capsule) {
      if (capsule.allocated) {
        capsule.tracer.module.prototype[functionName].apply(capsule.tracer, args);
      }
    });
  },
  findOwner: function findOwner(container) {
    var selectedCapsule = null;
    each(this.capsules, function (i, capsule) {
      if (capsule.$container[0] === container) {
        selectedCapsule = capsule;
        return false;
      }
    });
    return selectedCapsule.tracer;
  }
};

module.exports = TracerManager;

},{"../dom/module_container":8,"../dom/top_menu":26}],66:[function(require,module,exports){
'use strict';

var parse = JSON.parse;


var fromJSON = function fromJSON(obj) {
  return parse(obj, function (key, value) {
    return value === 'Infinity' ? Infinity : value;
  });
};

module.exports = fromJSON;

},{}],67:[function(require,module,exports){
'use strict';

var toJSON = require('./to_json');
var fromJSON = require('./from_json');
var refineByType = require('./refine_by_type');

module.exports = {
  toJSON: toJSON,
  fromJSON: fromJSON,
  refineByType: refineByType
};

},{"./from_json":66,"./refine_by_type":68,"./to_json":69}],68:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var refineByType = function refineByType(item) {
  switch (typeof item === 'undefined' ? 'undefined' : _typeof(item)) {
    case 'number':
      return refineNumber(item);
    case 'boolean':
      return refineBoolean(item);
    default:
      return refineString(item);
  }
};

var refineString = function refineString(str) {
  return str === '' ? ' ' : str;
};

var refineNumber = function refineNumber(num) {
  return num === Infinity ? '∞' : num;
};

var refineBoolean = function refineBoolean(bool) {
  return bool ? 'T' : 'F';
};

module.exports = refineByType;

},{}],69:[function(require,module,exports){
'use strict';

var stringify = JSON.stringify;


var toJSON = function toJSON(obj) {
  return stringify(obj, function (key, value) {
    return value === Infinity ? 'Infinity' : value;
  });
};

module.exports = toJSON;

},{}],70:[function(require,module,exports){
'use strict';

var isScratchPaper = function isScratchPaper(category, algorithm) {
  return category == 'scratch';
};

var getAlgorithmDir = function getAlgorithmDir(category, algorithm) {
  if (isScratchPaper(category)) return './algorithm/scratch_paper/';
  return './algorithm/' + category + '/' + algorithm + '/';
};

var getFileDir = function getFileDir(category, algorithm, file) {
  if (isScratchPaper(category)) return './algorithm/scratch_paper/';
  return './algorithm/' + category + '/' + algorithm + '/' + file + '/';
};

module.exports = {
  isScratchPaper: isScratchPaper,
  getAlgorithmDir: getAlgorithmDir,
  getFileDir: getFileDir
};

},{}],71:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],72:[function(require,module,exports){
(function (process,global){
/*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.2.1
 */

(function() {
    "use strict";
    function lib$rsvp$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$rsvp$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$rsvp$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$rsvp$utils$$_isArray;
    if (!Array.isArray) {
      lib$rsvp$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$rsvp$utils$$_isArray = Array.isArray;
    }

    var lib$rsvp$utils$$isArray = lib$rsvp$utils$$_isArray;

    var lib$rsvp$utils$$now = Date.now || function() { return new Date().getTime(); };

    function lib$rsvp$utils$$F() { }

    var lib$rsvp$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      lib$rsvp$utils$$F.prototype = o;
      return new lib$rsvp$utils$$F();
    });
    function lib$rsvp$events$$indexOf(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i] === callback) { return i; }
      }

      return -1;
    }

    function lib$rsvp$events$$callbacksFor(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    }

    var lib$rsvp$events$$default = {

      /**
        `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
        Example:

        ```javascript
        var object = {};

        RSVP.EventTarget.mixin(object);

        object.on('finished', function(event) {
          // handle event
        });

        object.trigger('finished', { detail: value });
        ```

        `EventTarget.mixin` also works with prototypes:

        ```javascript
        var Person = function() {};
        RSVP.EventTarget.mixin(Person.prototype);

        var yehuda = new Person();
        var tom = new Person();

        yehuda.on('poke', function(event) {
          console.log('Yehuda says OW');
        });

        tom.on('poke', function(event) {
          console.log('Tom says OW');
        });

        yehuda.trigger('poke');
        tom.trigger('poke');
        ```

        @method mixin
        @for RSVP.EventTarget
        @private
        @param {Object} object object to extend with EventTarget methods
      */
      'mixin': function(object) {
        object['on']      = this['on'];
        object['off']     = this['off'];
        object['trigger'] = this['trigger'];
        object._promiseCallbacks = undefined;
        return object;
      },

      /**
        Registers a callback to be executed when `eventName` is triggered

        ```javascript
        object.on('event', function(eventInfo){
          // handle the event
        });

        object.trigger('event');
        ```

        @method on
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to listen for
        @param {Function} callback function to be called when the event is triggered.
      */
      'on': function(eventName, callback) {
        if (typeof callback !== 'function') {
          throw new TypeError('Callback must be a function');
        }

        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks;

        callbacks = allCallbacks[eventName];

        if (!callbacks) {
          callbacks = allCallbacks[eventName] = [];
        }

        if (lib$rsvp$events$$indexOf(callbacks, callback) === -1) {
          callbacks.push(callback);
        }
      },

      /**
        You can use `off` to stop firing a particular callback for an event:

        ```javascript
        function doStuff() { // do stuff! }
        object.on('stuff', doStuff);

        object.trigger('stuff'); // doStuff will be called

        // Unregister ONLY the doStuff callback
        object.off('stuff', doStuff);
        object.trigger('stuff'); // doStuff will NOT be called
        ```

        If you don't pass a `callback` argument to `off`, ALL callbacks for the
        event will not be executed when the event fires. For example:

        ```javascript
        var callback1 = function(){};
        var callback2 = function(){};

        object.on('stuff', callback1);
        object.on('stuff', callback2);

        object.trigger('stuff'); // callback1 and callback2 will be executed.

        object.off('stuff');
        object.trigger('stuff'); // callback1 and callback2 will not be executed!
        ```

        @method off
        @for RSVP.EventTarget
        @private
        @param {String} eventName event to stop listening to
        @param {Function} callback optional argument. If given, only the function
        given will be removed from the event's callback queue. If no `callback`
        argument is given, all callbacks will be removed from the event's callback
        queue.
      */
      'off': function(eventName, callback) {
        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks, index;

        if (!callback) {
          allCallbacks[eventName] = [];
          return;
        }

        callbacks = allCallbacks[eventName];

        index = lib$rsvp$events$$indexOf(callbacks, callback);

        if (index !== -1) { callbacks.splice(index, 1); }
      },

      /**
        Use `trigger` to fire custom events. For example:

        ```javascript
        object.on('foo', function(){
          console.log('foo event happened!');
        });
        object.trigger('foo');
        // 'foo event happened!' logged to the console
        ```

        You can also pass a value as a second argument to `trigger` that will be
        passed as an argument to all event listeners for the event:

        ```javascript
        object.on('foo', function(value){
          console.log(value.name);
        });

        object.trigger('foo', { name: 'bar' });
        // 'bar' logged to the console
        ```

        @method trigger
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to be triggered
        @param {*} options optional value to be passed to any event handlers for
        the given `eventName`
      */
      'trigger': function(eventName, options, label) {
        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks, callback;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callback = callbacks[i];

            callback(options, label);
          }
        }
      }
    };

    var lib$rsvp$config$$config = {
      instrument: false
    };

    lib$rsvp$events$$default['mixin'](lib$rsvp$config$$config);

    function lib$rsvp$config$$configure(name, value) {
      if (name === 'onerror') {
        // handle for legacy users that expect the actual
        // error to be passed to their function added via
        // `RSVP.configure('onerror', someFunctionHere);`
        lib$rsvp$config$$config['on']('error', value);
        return;
      }

      if (arguments.length === 2) {
        lib$rsvp$config$$config[name] = value;
      } else {
        return lib$rsvp$config$$config[name];
      }
    }

    var lib$rsvp$instrument$$queue = [];

    function lib$rsvp$instrument$$scheduleFlush() {
      setTimeout(function() {
        var entry;
        for (var i = 0; i < lib$rsvp$instrument$$queue.length; i++) {
          entry = lib$rsvp$instrument$$queue[i];

          var payload = entry.payload;

          payload.guid = payload.key + payload.id;
          payload.childGuid = payload.key + payload.childId;
          if (payload.error) {
            payload.stack = payload.error.stack;
          }

          lib$rsvp$config$$config['trigger'](entry.name, entry.payload);
        }
        lib$rsvp$instrument$$queue.length = 0;
      }, 50);
    }

    function lib$rsvp$instrument$$instrument(eventName, promise, child) {
      if (1 === lib$rsvp$instrument$$queue.push({
        name: eventName,
        payload: {
          key: promise._guidKey,
          id:  promise._id,
          eventName: eventName,
          detail: promise._result,
          childId: child && child._id,
          label: promise._label,
          timeStamp: lib$rsvp$utils$$now(),
          error: lib$rsvp$config$$config["instrument-with-stack"] ? new Error(promise._label) : null
        }})) {
          lib$rsvp$instrument$$scheduleFlush();
        }
      }
    var lib$rsvp$instrument$$default = lib$rsvp$instrument$$instrument;
    function lib$rsvp$then$$then(onFulfillment, onRejection, label) {
      var parent = this;
      var state = parent._state;

      if (state === lib$rsvp$$internal$$FULFILLED && !onFulfillment || state === lib$rsvp$$internal$$REJECTED && !onRejection) {
        lib$rsvp$config$$config.instrument && lib$rsvp$instrument$$default('chained', parent, parent);
        return parent;
      }

      parent._onError = null;

      var child = new parent.constructor(lib$rsvp$$internal$$noop, label);
      var result = parent._result;

      lib$rsvp$config$$config.instrument && lib$rsvp$instrument$$default('chained', parent, child);

      if (state) {
        var callback = arguments[state - 1];
        lib$rsvp$config$$config.async(function(){
          lib$rsvp$$internal$$invokeCallback(state, child, callback, result);
        });
      } else {
        lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }
    var lib$rsvp$then$$default = lib$rsvp$then$$then;
    function lib$rsvp$promise$resolve$$resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$rsvp$$internal$$noop, label);
      lib$rsvp$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$rsvp$promise$resolve$$default = lib$rsvp$promise$resolve$$resolve;
    function lib$rsvp$enumerator$$makeSettledResult(state, position, value) {
      if (state === lib$rsvp$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
         return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function lib$rsvp$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor(lib$rsvp$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          lib$rsvp$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            lib$rsvp$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        lib$rsvp$$internal$$reject(this.promise, this._validationError());
      }
    }

    var lib$rsvp$enumerator$$default = lib$rsvp$enumerator$$Enumerator;

    lib$rsvp$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$rsvp$utils$$isArray(input);
    };

    lib$rsvp$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$rsvp$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    lib$rsvp$enumerator$$Enumerator.prototype._enumerate = function() {
      var length     = this.length;
      var promise    = this.promise;
      var input      = this._input;

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._settleMaybeThenable = function(entry, i) {
      var c = this._instanceConstructor;
      var resolve = c.resolve;

      if (resolve === lib$rsvp$promise$resolve$$default) {
        var then = lib$rsvp$$internal$$getThen(entry);

        if (then === lib$rsvp$then$$default &&
            entry._state !== lib$rsvp$$internal$$PENDING) {
          entry._onError = null;
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof then !== 'function') {
          this._remaining--;
          this._result[i] = this._makeResult(lib$rsvp$$internal$$FULFILLED, i, entry);
        } else if (c === lib$rsvp$promise$$default) {
          var promise = new c(lib$rsvp$$internal$$noop);
          lib$rsvp$$internal$$handleMaybeThenable(promise, entry, then);
          this._willSettleAt(promise, i);
        } else {
          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
        }
      } else {
        this._willSettleAt(resolve(entry), i);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      if (lib$rsvp$utils$$isMaybeThenable(entry)) {
        this._settleMaybeThenable(entry, i);
      } else {
        this._remaining--;
        this._result[i] = this._makeResult(lib$rsvp$$internal$$FULFILLED, i, entry);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === lib$rsvp$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === lib$rsvp$$internal$$REJECTED) {
          lib$rsvp$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        lib$rsvp$$internal$$fulfill(promise, this._result);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    lib$rsvp$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$rsvp$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$rsvp$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$rsvp$$internal$$REJECTED, i, reason);
      });
    };
    function lib$rsvp$promise$all$$all(entries, label) {
      return new lib$rsvp$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    }
    var lib$rsvp$promise$all$$default = lib$rsvp$promise$all$$all;
    function lib$rsvp$promise$race$$race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$rsvp$$internal$$noop, label);

      if (!lib$rsvp$utils$$isArray(entries)) {
        lib$rsvp$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$rsvp$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$rsvp$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        lib$rsvp$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$rsvp$promise$race$$default = lib$rsvp$promise$race$$race;
    function lib$rsvp$promise$reject$$reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$rsvp$$internal$$noop, label);
      lib$rsvp$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$rsvp$promise$reject$$default = lib$rsvp$promise$reject$$reject;

    var lib$rsvp$promise$$guidKey = 'rsvp_' + lib$rsvp$utils$$now() + '-';
    var lib$rsvp$promise$$counter = 0;

    function lib$rsvp$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$rsvp$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    function lib$rsvp$promise$$Promise(resolver, label) {
      this._id = lib$rsvp$promise$$counter++;
      this._label = label;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      lib$rsvp$config$$config.instrument && lib$rsvp$instrument$$default('created', this);

      if (lib$rsvp$$internal$$noop !== resolver) {
        typeof resolver !== 'function' && lib$rsvp$promise$$needsResolver();
        this instanceof lib$rsvp$promise$$Promise ? lib$rsvp$$internal$$initializePromise(this, resolver) : lib$rsvp$promise$$needsNew();
      }
    }

    var lib$rsvp$promise$$default = lib$rsvp$promise$$Promise;

    // deprecated
    lib$rsvp$promise$$Promise.cast = lib$rsvp$promise$resolve$$default;
    lib$rsvp$promise$$Promise.all = lib$rsvp$promise$all$$default;
    lib$rsvp$promise$$Promise.race = lib$rsvp$promise$race$$default;
    lib$rsvp$promise$$Promise.resolve = lib$rsvp$promise$resolve$$default;
    lib$rsvp$promise$$Promise.reject = lib$rsvp$promise$reject$$default;

    lib$rsvp$promise$$Promise.prototype = {
      constructor: lib$rsvp$promise$$Promise,

      _guidKey: lib$rsvp$promise$$guidKey,

      _onError: function (reason) {
        var promise = this;
        lib$rsvp$config$$config.after(function() {
          if (promise._onError) {
            lib$rsvp$config$$config['trigger']('error', reason, promise._label);
          }
        });
      },

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfillment
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      then: lib$rsvp$then$$default,

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection, label) {
        return this.then(undefined, onRejection, label);
      },

    /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves

      Synchronous example:

      ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }

      try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuther();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```

      Asynchronous example:

      ```js
      findAuthor().catch(function(reason){
        return findOtherAuther();
      }).finally(function(){
        // author was either found, or not
      });
      ```

      @method finally
      @param {Function} callback
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'finally': function(callback, label) {
        var promise = this;
        var constructor = promise.constructor;

        return promise.then(function(value) {
          return constructor.resolve(callback()).then(function() {
            return value;
          });
        }, function(reason) {
          return constructor.resolve(callback()).then(function() {
            return constructor.reject(reason);
          });
        }, label);
      }
    };
    function  lib$rsvp$$internal$$withOwnPromise() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$rsvp$$internal$$noop() {}

    var lib$rsvp$$internal$$PENDING   = void 0;
    var lib$rsvp$$internal$$FULFILLED = 1;
    var lib$rsvp$$internal$$REJECTED  = 2;

    var lib$rsvp$$internal$$GET_THEN_ERROR = new lib$rsvp$$internal$$ErrorObject();

    function lib$rsvp$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$rsvp$$internal$$GET_THEN_ERROR.error = error;
        return lib$rsvp$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$rsvp$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$rsvp$$internal$$handleForeignThenable(promise, thenable, then) {
      lib$rsvp$config$$config.async(function(promise) {
        var sealed = false;
        var error = lib$rsvp$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$rsvp$$internal$$resolve(promise, value, undefined);
          } else {
            lib$rsvp$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$rsvp$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$rsvp$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$rsvp$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$rsvp$$internal$$FULFILLED) {
        lib$rsvp$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$rsvp$$internal$$REJECTED) {
        thenable._onError = null;
        lib$rsvp$$internal$$reject(promise, thenable._result);
      } else {
        lib$rsvp$$internal$$subscribe(thenable, undefined, function(value) {
          if (thenable !== value) {
            lib$rsvp$$internal$$resolve(promise, value, undefined);
          } else {
            lib$rsvp$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          lib$rsvp$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$rsvp$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
      if (maybeThenable.constructor === promise.constructor &&
          then === lib$rsvp$then$$default &&
          constructor.resolve === lib$rsvp$promise$resolve$$default) {
        lib$rsvp$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        if (then === lib$rsvp$$internal$$GET_THEN_ERROR) {
          lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$rsvp$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$rsvp$utils$$isFunction(then)) {
          lib$rsvp$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$rsvp$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$rsvp$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$rsvp$$internal$$fulfill(promise, value);
      } else if (lib$rsvp$utils$$objectOrFunction(value)) {
        lib$rsvp$$internal$$handleMaybeThenable(promise, value, lib$rsvp$$internal$$getThen(value));
      } else {
        lib$rsvp$$internal$$fulfill(promise, value);
      }
    }

    function lib$rsvp$$internal$$publishRejection(promise) {
      if (promise._onError) {
        promise._onError(promise._result);
      }

      lib$rsvp$$internal$$publish(promise);
    }

    function lib$rsvp$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$rsvp$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$rsvp$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
        if (lib$rsvp$config$$config.instrument) {
          lib$rsvp$instrument$$default('fulfilled', promise);
        }
      } else {
        lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, promise);
      }
    }

    function lib$rsvp$$internal$$reject(promise, reason) {
      if (promise._state !== lib$rsvp$$internal$$PENDING) { return; }
      promise._state = lib$rsvp$$internal$$REJECTED;
      promise._result = reason;
      lib$rsvp$config$$config.async(lib$rsvp$$internal$$publishRejection, promise);
    }

    function lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onError = null;

      subscribers[length] = child;
      subscribers[length + lib$rsvp$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$rsvp$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, parent);
      }
    }

    function lib$rsvp$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (lib$rsvp$config$$config.instrument) {
        lib$rsvp$instrument$$default(settled === lib$rsvp$$internal$$FULFILLED ? 'fulfilled' : 'rejected', promise);
      }

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$rsvp$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$rsvp$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$rsvp$$internal$$TRY_CATCH_ERROR = new lib$rsvp$$internal$$ErrorObject();

    function lib$rsvp$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$rsvp$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$rsvp$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$rsvp$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$rsvp$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$rsvp$$internal$$tryCatch(callback, detail);

        if (value === lib$rsvp$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$withOwnPromise());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$rsvp$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$rsvp$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$rsvp$$internal$$reject(promise, error);
      } else if (settled === lib$rsvp$$internal$$FULFILLED) {
        lib$rsvp$$internal$$fulfill(promise, value);
      } else if (settled === lib$rsvp$$internal$$REJECTED) {
        lib$rsvp$$internal$$reject(promise, value);
      }
    }

    function lib$rsvp$$internal$$initializePromise(promise, resolver) {
      var resolved = false;
      try {
        resolver(function resolvePromise(value){
          if (resolved) { return; }
          resolved = true;
          lib$rsvp$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          if (resolved) { return; }
          resolved = true;
          lib$rsvp$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$rsvp$$internal$$reject(promise, e);
      }
    }

    function lib$rsvp$all$settled$$AllSettled(Constructor, entries, label) {
      this._superConstructor(Constructor, entries, false /* don't abort on reject */, label);
    }

    lib$rsvp$all$settled$$AllSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);
    lib$rsvp$all$settled$$AllSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$all$settled$$AllSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;
    lib$rsvp$all$settled$$AllSettled.prototype._validationError = function() {
      return new Error('allSettled must be called with an array');
    };

    function lib$rsvp$all$settled$$allSettled(entries, label) {
      return new lib$rsvp$all$settled$$AllSettled(lib$rsvp$promise$$default, entries, label).promise;
    }
    var lib$rsvp$all$settled$$default = lib$rsvp$all$settled$$allSettled;
    function lib$rsvp$all$$all(array, label) {
      return lib$rsvp$promise$$default.all(array, label);
    }
    var lib$rsvp$all$$default = lib$rsvp$all$$all;
    var lib$rsvp$asap$$len = 0;
    var lib$rsvp$asap$$toString = {}.toString;
    var lib$rsvp$asap$$vertxNext;
    function lib$rsvp$asap$$asap(callback, arg) {
      lib$rsvp$asap$$queue[lib$rsvp$asap$$len] = callback;
      lib$rsvp$asap$$queue[lib$rsvp$asap$$len + 1] = arg;
      lib$rsvp$asap$$len += 2;
      if (lib$rsvp$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        lib$rsvp$asap$$scheduleFlush();
      }
    }

    var lib$rsvp$asap$$default = lib$rsvp$asap$$asap;

    var lib$rsvp$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$rsvp$asap$$browserGlobal = lib$rsvp$asap$$browserWindow || {};
    var lib$rsvp$asap$$BrowserMutationObserver = lib$rsvp$asap$$browserGlobal.MutationObserver || lib$rsvp$asap$$browserGlobal.WebKitMutationObserver;
    var lib$rsvp$asap$$isNode = typeof self === 'undefined' &&
      typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$rsvp$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$rsvp$asap$$useNextTick() {
      var nextTick = process.nextTick;
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // setImmediate should be used instead instead
      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
        nextTick = setImmediate;
      }
      return function() {
        nextTick(lib$rsvp$asap$$flush);
      };
    }

    // vertx
    function lib$rsvp$asap$$useVertxTimer() {
      return function() {
        lib$rsvp$asap$$vertxNext(lib$rsvp$asap$$flush);
      };
    }

    function lib$rsvp$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$rsvp$asap$$BrowserMutationObserver(lib$rsvp$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$rsvp$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$rsvp$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$rsvp$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$rsvp$asap$$flush, 1);
      };
    }

    var lib$rsvp$asap$$queue = new Array(1000);
    function lib$rsvp$asap$$flush() {
      for (var i = 0; i < lib$rsvp$asap$$len; i+=2) {
        var callback = lib$rsvp$asap$$queue[i];
        var arg = lib$rsvp$asap$$queue[i+1];

        callback(arg);

        lib$rsvp$asap$$queue[i] = undefined;
        lib$rsvp$asap$$queue[i+1] = undefined;
      }

      lib$rsvp$asap$$len = 0;
    }

    function lib$rsvp$asap$$attemptVertex() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$rsvp$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$rsvp$asap$$useVertxTimer();
      } catch(e) {
        return lib$rsvp$asap$$useSetTimeout();
      }
    }

    var lib$rsvp$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$rsvp$asap$$isNode) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useNextTick();
    } else if (lib$rsvp$asap$$BrowserMutationObserver) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMutationObserver();
    } else if (lib$rsvp$asap$$isWorker) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMessageChannel();
    } else if (lib$rsvp$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$attemptVertex();
    } else {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useSetTimeout();
    }
    function lib$rsvp$defer$$defer(label) {
      var deferred = {};

      deferred['promise'] = new lib$rsvp$promise$$default(function(resolve, reject) {
        deferred['resolve'] = resolve;
        deferred['reject'] = reject;
      }, label);

      return deferred;
    }
    var lib$rsvp$defer$$default = lib$rsvp$defer$$defer;
    function lib$rsvp$filter$$filter(promises, filterFn, label) {
      return lib$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!lib$rsvp$utils$$isFunction(filterFn)) {
          throw new TypeError("You must pass a function as filter's second argument.");
        }

        var length = values.length;
        var filtered = new Array(length);

        for (var i = 0; i < length; i++) {
          filtered[i] = filterFn(values[i]);
        }

        return lib$rsvp$promise$$default.all(filtered, label).then(function(filtered) {
          var results = new Array(length);
          var newLength = 0;

          for (var i = 0; i < length; i++) {
            if (filtered[i]) {
              results[newLength] = values[i];
              newLength++;
            }
          }

          results.length = newLength;

          return results;
        });
      });
    }
    var lib$rsvp$filter$$default = lib$rsvp$filter$$filter;

    function lib$rsvp$promise$hash$$PromiseHash(Constructor, object, label) {
      this._superConstructor(Constructor, object, true, label);
    }

    var lib$rsvp$promise$hash$$default = lib$rsvp$promise$hash$$PromiseHash;

    lib$rsvp$promise$hash$$PromiseHash.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);
    lib$rsvp$promise$hash$$PromiseHash.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$promise$hash$$PromiseHash.prototype._init = function() {
      this._result = {};
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._validateInput = function(input) {
      return input && typeof input === 'object';
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._validationError = function() {
      return new Error('Promise.hash must be called with an object');
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._enumerate = function() {
      var enumerator = this;
      var promise    = enumerator.promise;
      var input      = enumerator._input;
      var results    = [];

      for (var key in input) {
        if (promise._state === lib$rsvp$$internal$$PENDING && Object.prototype.hasOwnProperty.call(input, key)) {
          results.push({
            position: key,
            entry: input[key]
          });
        }
      }

      var length = results.length;
      enumerator._remaining = length;
      var result;

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        result = results[i];
        enumerator._eachEntry(result.entry, result.position);
      }
    };

    function lib$rsvp$hash$settled$$HashSettled(Constructor, object, label) {
      this._superConstructor(Constructor, object, false, label);
    }

    lib$rsvp$hash$settled$$HashSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$promise$hash$$default.prototype);
    lib$rsvp$hash$settled$$HashSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$hash$settled$$HashSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;

    lib$rsvp$hash$settled$$HashSettled.prototype._validationError = function() {
      return new Error('hashSettled must be called with an object');
    };

    function lib$rsvp$hash$settled$$hashSettled(object, label) {
      return new lib$rsvp$hash$settled$$HashSettled(lib$rsvp$promise$$default, object, label).promise;
    }
    var lib$rsvp$hash$settled$$default = lib$rsvp$hash$settled$$hashSettled;
    function lib$rsvp$hash$$hash(object, label) {
      return new lib$rsvp$promise$hash$$default(lib$rsvp$promise$$default, object, label).promise;
    }
    var lib$rsvp$hash$$default = lib$rsvp$hash$$hash;
    function lib$rsvp$map$$map(promises, mapFn, label) {
      return lib$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!lib$rsvp$utils$$isFunction(mapFn)) {
          throw new TypeError("You must pass a function as map's second argument.");
        }

        var length = values.length;
        var results = new Array(length);

        for (var i = 0; i < length; i++) {
          results[i] = mapFn(values[i]);
        }

        return lib$rsvp$promise$$default.all(results, label);
      });
    }
    var lib$rsvp$map$$default = lib$rsvp$map$$map;

    function lib$rsvp$node$$Result() {
      this.value = undefined;
    }

    var lib$rsvp$node$$ERROR = new lib$rsvp$node$$Result();
    var lib$rsvp$node$$GET_THEN_ERROR = new lib$rsvp$node$$Result();

    function lib$rsvp$node$$getThen(obj) {
      try {
       return obj.then;
      } catch(error) {
        lib$rsvp$node$$ERROR.value= error;
        return lib$rsvp$node$$ERROR;
      }
    }


    function lib$rsvp$node$$tryApply(f, s, a) {
      try {
        f.apply(s, a);
      } catch(error) {
        lib$rsvp$node$$ERROR.value = error;
        return lib$rsvp$node$$ERROR;
      }
    }

    function lib$rsvp$node$$makeObject(_, argumentNames) {
      var obj = {};
      var name;
      var i;
      var length = _.length;
      var args = new Array(length);

      for (var x = 0; x < length; x++) {
        args[x] = _[x];
      }

      for (i = 0; i < argumentNames.length; i++) {
        name = argumentNames[i];
        obj[name] = args[i + 1];
      }

      return obj;
    }

    function lib$rsvp$node$$arrayResult(_) {
      var length = _.length;
      var args = new Array(length - 1);

      for (var i = 1; i < length; i++) {
        args[i - 1] = _[i];
      }

      return args;
    }

    function lib$rsvp$node$$wrapThenable(then, promise) {
      return {
        then: function(onFulFillment, onRejection) {
          return then.call(promise, onFulFillment, onRejection);
        }
      };
    }

    function lib$rsvp$node$$denodeify(nodeFunc, options) {
      var fn = function() {
        var self = this;
        var l = arguments.length;
        var args = new Array(l + 1);
        var arg;
        var promiseInput = false;

        for (var i = 0; i < l; ++i) {
          arg = arguments[i];

          if (!promiseInput) {
            // TODO: clean this up
            promiseInput = lib$rsvp$node$$needsPromiseInput(arg);
            if (promiseInput === lib$rsvp$node$$GET_THEN_ERROR) {
              var p = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);
              lib$rsvp$$internal$$reject(p, lib$rsvp$node$$GET_THEN_ERROR.value);
              return p;
            } else if (promiseInput && promiseInput !== true) {
              arg = lib$rsvp$node$$wrapThenable(promiseInput, arg);
            }
          }
          args[i] = arg;
        }

        var promise = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);

        args[l] = function(err, val) {
          if (err)
            lib$rsvp$$internal$$reject(promise, err);
          else if (options === undefined)
            lib$rsvp$$internal$$resolve(promise, val);
          else if (options === true)
            lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$arrayResult(arguments));
          else if (lib$rsvp$utils$$isArray(options))
            lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$makeObject(arguments, options));
          else
            lib$rsvp$$internal$$resolve(promise, val);
        };

        if (promiseInput) {
          return lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self);
        } else {
          return lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self);
        }
      };

      fn.__proto__ = nodeFunc;

      return fn;
    }

    var lib$rsvp$node$$default = lib$rsvp$node$$denodeify;

    function lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self) {
      var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);
      if (result === lib$rsvp$node$$ERROR) {
        lib$rsvp$$internal$$reject(promise, result.value);
      }
      return promise;
    }

    function lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self){
      return lib$rsvp$promise$$default.all(args).then(function(args){
        var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);
        if (result === lib$rsvp$node$$ERROR) {
          lib$rsvp$$internal$$reject(promise, result.value);
        }
        return promise;
      });
    }

    function lib$rsvp$node$$needsPromiseInput(arg) {
      if (arg && typeof arg === 'object') {
        if (arg.constructor === lib$rsvp$promise$$default) {
          return true;
        } else {
          return lib$rsvp$node$$getThen(arg);
        }
      } else {
        return false;
      }
    }
    var lib$rsvp$platform$$platform;

    /* global self */
    if (typeof self === 'object') {
      lib$rsvp$platform$$platform = self;

    /* global global */
    } else if (typeof global === 'object') {
      lib$rsvp$platform$$platform = global;
    } else {
      throw new Error('no global: `self` or `global` found');
    }

    var lib$rsvp$platform$$default = lib$rsvp$platform$$platform;
    function lib$rsvp$race$$race(array, label) {
      return lib$rsvp$promise$$default.race(array, label);
    }
    var lib$rsvp$race$$default = lib$rsvp$race$$race;
    function lib$rsvp$reject$$reject(reason, label) {
      return lib$rsvp$promise$$default.reject(reason, label);
    }
    var lib$rsvp$reject$$default = lib$rsvp$reject$$reject;
    function lib$rsvp$resolve$$resolve(value, label) {
      return lib$rsvp$promise$$default.resolve(value, label);
    }
    var lib$rsvp$resolve$$default = lib$rsvp$resolve$$resolve;
    function lib$rsvp$rethrow$$rethrow(reason) {
      setTimeout(function() {
        throw reason;
      });
      throw reason;
    }
    var lib$rsvp$rethrow$$default = lib$rsvp$rethrow$$rethrow;

    // defaults
    lib$rsvp$config$$config.async = lib$rsvp$asap$$default;
    lib$rsvp$config$$config.after = function(cb) {
      setTimeout(cb, 0);
    };
    var lib$rsvp$$cast = lib$rsvp$resolve$$default;
    function lib$rsvp$$async(callback, arg) {
      lib$rsvp$config$$config.async(callback, arg);
    }

    function lib$rsvp$$on() {
      lib$rsvp$config$$config['on'].apply(lib$rsvp$config$$config, arguments);
    }

    function lib$rsvp$$off() {
      lib$rsvp$config$$config['off'].apply(lib$rsvp$config$$config, arguments);
    }

    // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
    if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
      var lib$rsvp$$callbacks = window['__PROMISE_INSTRUMENTATION__'];
      lib$rsvp$config$$configure('instrument', true);
      for (var lib$rsvp$$eventName in lib$rsvp$$callbacks) {
        if (lib$rsvp$$callbacks.hasOwnProperty(lib$rsvp$$eventName)) {
          lib$rsvp$$on(lib$rsvp$$eventName, lib$rsvp$$callbacks[lib$rsvp$$eventName]);
        }
      }
    }

    var lib$rsvp$umd$$RSVP = {
      'race': lib$rsvp$race$$default,
      'Promise': lib$rsvp$promise$$default,
      'allSettled': lib$rsvp$all$settled$$default,
      'hash': lib$rsvp$hash$$default,
      'hashSettled': lib$rsvp$hash$settled$$default,
      'denodeify': lib$rsvp$node$$default,
      'on': lib$rsvp$$on,
      'off': lib$rsvp$$off,
      'map': lib$rsvp$map$$default,
      'filter': lib$rsvp$filter$$default,
      'resolve': lib$rsvp$resolve$$default,
      'reject': lib$rsvp$reject$$default,
      'all': lib$rsvp$all$$default,
      'rethrow': lib$rsvp$rethrow$$default,
      'defer': lib$rsvp$defer$$default,
      'EventTarget': lib$rsvp$events$$default,
      'configure': lib$rsvp$config$$configure,
      'async': lib$rsvp$$async
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$rsvp$umd$$RSVP; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$rsvp$umd$$RSVP;
    } else if (typeof lib$rsvp$platform$$default !== 'undefined') {
      lib$rsvp$platform$$default['RSVP'] = lib$rsvp$umd$$RSVP;
    }
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":71}]},{},[30])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcHAvY2FjaGUuanMiLCJqcy9hcHAvY29uc3RydWN0b3IuanMiLCJqcy9hcHAvaW5kZXguanMiLCJqcy9kb20vYWRkX2NhdGVnb3JpZXMuanMiLCJqcy9kb20vYWRkX2ZpbGVzLmpzIiwianMvZG9tL2luZGV4LmpzIiwianMvZG9tL2xvYWRpbmdfc2xpZGVyLmpzIiwianMvZG9tL21vZHVsZV9jb250YWluZXIuanMiLCJqcy9kb20vc2V0dXAvaW5kZXguanMiLCJqcy9kb20vc2V0dXAvc2V0dXBfZGl2aWRlcnMuanMiLCJqcy9kb20vc2V0dXAvc2V0dXBfZG9jdW1lbnQuanMiLCJqcy9kb20vc2V0dXAvc2V0dXBfZmlsZXNfYmFyLmpzIiwianMvZG9tL3NldHVwL3NldHVwX2ludGVydmFsLmpzIiwianMvZG9tL3NldHVwL3NldHVwX21vZHVsZV9jb250YWluZXIuanMiLCJqcy9kb20vc2V0dXAvc2V0dXBfcG93ZXJlZF9ieS5qcyIsImpzL2RvbS9zZXR1cC9zZXR1cF9zY3JhdGNoX3BhcGVyLmpzIiwianMvZG9tL3NldHVwL3NldHVwX3NpZGVfbWVudS5qcyIsImpzL2RvbS9zZXR1cC9zZXR1cF90b3BfbWVudS5qcyIsImpzL2RvbS9zZXR1cC9zZXR1cF93aW5kb3cuanMiLCJqcy9kb20vc2hvd19hbGdvcml0aG0uanMiLCJqcy9kb20vc2hvd19kZXNjcmlwdGlvbi5qcyIsImpzL2RvbS9zaG93X2ZpcnN0X2FsZ29yaXRobS5qcyIsImpzL2RvbS9zaG93X3JlcXVlc3RlZF9hbGdvcml0aG0uanMiLCJqcy9kb20vc2hvd193aWtpLmpzIiwianMvZG9tL3RvYXN0LmpzIiwianMvZG9tL3RvcF9tZW51LmpzIiwianMvZWRpdG9yL2NyZWF0ZS5qcyIsImpzL2VkaXRvci9leGVjdXRvci5qcyIsImpzL2VkaXRvci9pbmRleC5qcyIsImpzL2luZGV4LmpzIiwianMvbW9kdWxlL2RhdGEvYXJyYXkxZC5qcyIsImpzL21vZHVsZS9kYXRhL2FycmF5MmQuanMiLCJqcy9tb2R1bGUvZGF0YS9jb29yZGluYXRlX3N5c3RlbS5qcyIsImpzL21vZHVsZS9kYXRhL2RpcmVjdGVkX2dyYXBoLmpzIiwianMvbW9kdWxlL2RhdGEvaW5kZXguanMiLCJqcy9tb2R1bGUvZGF0YS91bmRpcmVjdGVkX2dyYXBoLmpzIiwianMvbW9kdWxlL2RhdGEvd2VpZ2h0ZWRfZGlyZWN0ZWRfZ3JhcGguanMiLCJqcy9tb2R1bGUvZGF0YS93ZWlnaHRlZF91bmRpcmVjdGVkX2dyYXBoLmpzIiwianMvbW9kdWxlL2luZGV4LmpzIiwianMvbW9kdWxlL3RyYWNlci9hcnJheTFkLmpzIiwianMvbW9kdWxlL3RyYWNlci9hcnJheTJkLmpzIiwianMvbW9kdWxlL3RyYWNlci9jaGFydC5qcyIsImpzL21vZHVsZS90cmFjZXIvY29vcmRpbmF0ZV9zeXN0ZW0uanMiLCJqcy9tb2R1bGUvdHJhY2VyL2RpcmVjdGVkX2dyYXBoLmpzIiwianMvbW9kdWxlL3RyYWNlci9pbmRleC5qcyIsImpzL21vZHVsZS90cmFjZXIvbG9nLmpzIiwianMvbW9kdWxlL3RyYWNlci90cmFjZXIuanMiLCJqcy9tb2R1bGUvdHJhY2VyL3VuZGlyZWN0ZWRfZ3JhcGguanMiLCJqcy9tb2R1bGUvdHJhY2VyL3dlaWdodGVkX2RpcmVjdGVkX2dyYXBoLmpzIiwianMvbW9kdWxlL3RyYWNlci93ZWlnaHRlZF91bmRpcmVjdGVkX2dyYXBoLmpzIiwianMvc2VydmVyL2FqYXgvZ2V0LmpzIiwianMvc2VydmVyL2FqYXgvZ2V0X2pzb24uanMiLCJqcy9zZXJ2ZXIvYWpheC9wb3N0X2pzb24uanMiLCJqcy9zZXJ2ZXIvYWpheC9yZXF1ZXN0LmpzIiwianMvc2VydmVyL2hlbHBlcnMuanMiLCJqcy9zZXJ2ZXIvaW5kZXguanMiLCJqcy9zZXJ2ZXIvbG9hZF9hbGdvcml0aG0uanMiLCJqcy9zZXJ2ZXIvbG9hZF9jYXRlZ29yaWVzLmpzIiwianMvc2VydmVyL2xvYWRfZmlsZS5qcyIsImpzL3NlcnZlci9sb2FkX3NjcmF0Y2hfcGFwZXIuanMiLCJqcy9zZXJ2ZXIvbG9hZF93aWtpLmpzIiwianMvc2VydmVyL2xvYWRfd2lraV9saXN0LmpzIiwianMvc2VydmVyL3NoYXJlX3NjcmF0Y2hfcGFwZXIuanMiLCJqcy90cmFjZXJfbWFuYWdlci9pbmRleC5qcyIsImpzL3RyYWNlcl9tYW5hZ2VyL21hbmFnZXIuanMiLCJqcy90cmFjZXJfbWFuYWdlci91dGlsL2Zyb21fanNvbi5qcyIsImpzL3RyYWNlcl9tYW5hZ2VyL3V0aWwvaW5kZXguanMiLCJqcy90cmFjZXJfbWFuYWdlci91dGlsL3JlZmluZV9ieV90eXBlLmpzIiwianMvdHJhY2VyX21hbmFnZXIvdXRpbC90b19qc29uLmpzIiwianMvdXRpbHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3JzdnAvZGlzdC9yc3ZwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O1NBSUksQztJQURGLE0sTUFBQSxNOzs7QUFHRixJQUFNLFFBQVE7QUFDWixnQkFBYyxFQURGO0FBRVosU0FBTztBQUZLLENBQWQ7O0FBS0EsSUFBTSxpQkFBaUIsU0FBakIsY0FBaUIsQ0FBQyxJQUFELEVBQVU7QUFDL0IsTUFBSSxDQUFDLElBQUwsRUFBVztBQUNULFVBQU0sbUJBQU47QUFDRDtBQUNGLENBSkQ7Ozs7O0FBVUEsT0FBTyxPQUFQLEdBQWlCO0FBRWYsZUFGZSx5QkFFRCxJQUZDLEVBRUs7QUFDbEIsbUJBQWUsSUFBZjtBQUNBLFdBQU8sTUFBTSxLQUFOLENBQVksSUFBWixDQUFQO0FBQ0QsR0FMYztBQU9mLGtCQVBlLDRCQU9FLElBUEYsRUFPUSxPQVBSLEVBT2lCO0FBQzlCLG1CQUFlLElBQWY7QUFDQSxRQUFJLENBQUMsTUFBTSxLQUFOLENBQVksSUFBWixDQUFMLEVBQXdCO0FBQ3RCLFlBQU0sS0FBTixDQUFZLElBQVosSUFBb0IsRUFBcEI7QUFDRDtB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QWxDLFNBQStDLElBQS9DO0FBQ0QsQ0FIRDs7QUFLQSxPQUFPLE9BQVAsR0FBaUI7QUFDZixnQ0FEZTtBQUVmLGtDQUZlO0FBR2Y7QUFIZSxDQUFqQjs7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuY29uc3Qge1xuICBleHRlbmRcbn0gPSAkO1xuXG5jb25zdCBjYWNoZSA9IHtcbiAgbGFzdEZpbGVVc2VkOiAnJyxcbiAgZmlsZXM6IHt9XG59O1xuXG5jb25zdCBhc3NlcnRGaWxlTmFtZSA9IChuYW1lKSA9PiB7XG4gIGlmICghbmFtZSkge1xuICAgIHRocm93ICdNaXNzaW5nIGZpbGUgbmFtZSc7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBHbG9iYWwgYXBwbGljYXRpb24gY2FjaGVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZ2V0Q2FjaGVkRmlsZShuYW1lKSB7XG4gICAgYXNzZXJ0RmlsZU5hbWUobmFtZSk7XG4gICAgcmV0dXJuIGNhY2hlLmZpbGVzW25hbWVdO1xuICB9LFxuXG4gIHVwZGF0ZUNhY2hlZEZpbGUobmFtZSwgdXBkYXRlcykge1xuICAgIGFzc2VydEZpbGVOYW1lKG5hbWUpO1xuICAgIGlmICghY2FjaGUuZmlsZXNbbmFtZV0pIHtcbiAgICAgIGNhY2hlLmZpbGVzW25hbWVdID0ge307XG4gICAgfVxuICAgIGV4dGVuZChjYWNoZS5maWxlc1tuYW1lXSwgdXBkYXRlcyk7XG4gIH0sXG5cbiAgZ2V0TGFzdEZpbGVVc2VkKCkge1xuICAgIHJldHVybiBjYWNoZS5sYXN0RmlsZVVzZWQ7XG4gIH0sXG5cbiAgc2V0TGFzdEZpbGVVc2VkKGZpbGUpIHtcbiAgICBjYWNoZS5sYXN0RmlsZVVzZWQgPSBmaWxlO1xuICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgRWRpdG9yID0gcmVxdWlyZSgnLi4vZWRpdG9yJyk7XG5jb25zdCBUcmFjZXJNYW5hZ2VyID0gcmVxdWlyZSgnLi4vdHJhY2VyX21hbmFnZXInKTtcbmNvbnN0IERPTSA9IHJlcXVpcmUoJy4uL2RvbS9zZXR1cCcpO1xuXG5jb25zdCB7XG4gIHNob3dMb2FkaW5nU2xpZGVyLFxuICBoaWRlTG9hZGluZ1NsaWRlclxufSA9IHJlcXVpcmUoJy4uL2RvbS9sb2FkaW5nX3NsaWRlcicpO1xuXG5jb25zdCBDYWNoZSA9IHJlcXVpcmUoJy4vY2FjaGUnKTtcblxuY29uc3Qgc3RhdGUgPSB7XG4gIGlzTG9hZGluZzogbnVsbCxcbiAgZWRpdG9yOiBudWxsLFxuICB0cmFjZXJNYW5hZ2VyOiBudWxsLFxuICBjYXRlZ29yaWVzOiBudWxsLFxuICBsb2FkZWRTY3JhdGNoOiBudWxsXG59O1xuXG5jb25zdCBpbml0U3RhdGUgPSAodHJhY2VyTWFuYWdlcikgPT4ge1xuICBzdGF0ZS5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgc3RhdGUuZWRpdG9yID0gbmV3IEVkaXRvcih0cmFjZXJNYW5hZ2VyKTtcbiAgc3RhdGUudHJhY2VyTWFuYWdlciA9IHRyYWNlck1hbmFnZXI7XG4gIHN0YXRlLmNhdGVnb3JpZXMgPSB7fTtcbiAgc3RhdGUubG9hZGVkU2NyYXRjaCA9IG51bGw7XG59O1xuXG4vKipcbiAqIEdsb2JhbCBhcHBsaWNhdGlvbiBzaW5nbGV0b24uXG4gKi9cbmNvbnN0IEFwcCA9IGZ1bmN0aW9uICgpIHtcblxuICB0aGlzLmdldElzTG9hZGluZyA9ICgpID0+IHtcbiAgICByZXR1cm4gc3RhdGUuaXNMb2FkaW5nO1xuICB9O1xuXG4gIHRoaXMuc2V0SXNMb2FkaW5nID0gKGxvYWRpbmcpID0+IHtcbiAgICBzdGF0ZS5pc0xvYWRpbmcgPSBsb2FkaW5nO1xuICAgIGlmIChsb2FkaW5nKSB7XG4gICAgICBzaG93TG9hZGluZ1NsaWRlcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBoaWRlTG9hZGluZ1NsaWRlcigpO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLmdldEVkaXRvciA9ICgpID0+IHtcbiAgICByZXR1cm4gc3RhdGUuZWRpdG9yO1xuICB9O1xuXG4gIHRoaXMuZ2V0Q2F0ZWdvcmllcyA9ICgpID0+IHtcbiAgICByZXR1cm4gc3RhdGUuY2F0ZWdvcmllcztcbiAgfTtcblxuICB0aGlzLmdldENhdGVnb3J5ID0gKG5hbWUpID0+IHtcbiAgICByZXR1cm4gc3RhdGUuY2F0ZWdvcmllc1tuYW1lXTtcbiAgfTtcblxuICB0aGlzLnNldENhdGVnb3JpZXMgPSAoY2F0ZWdvcmllcykgPT4ge1xuICAgIHN0YXRlLmNhdGVnb3JpZXMgPSBjYXRlZ29yaWVzO1xuICB9O1xuXG4gIHRoaXMudXBkYXRlQ2F0ZWdvcnkgPSAobmFtZSwgdXBkYXRlcykgPT4ge1xuICAgICQuZXh0ZW5kKHN0YXRlLmNhdGVnb3JpZXNbbmFtZV0sIHVwZGF0ZXMpO1xuICB9O1xuXG4gIHRoaXMuZ2V0VHJhY2VyTWFuYWdlciA9ICgpID0+IHtcbiAgICByZXR1cm4gc3RhdGUudHJhY2VyTWFuYWdlcjtcbiAgfTtcblxuICB0aGlzLmdldExvYWRlZFNjcmF0Y2ggPSAoKSA9PiB7XG4gICAgcmV0dXJuIHN0YXRlLmxvYWRlZFNjcmF0Y2g7XG4gIH07XG5cbiAgdGhpcy5zZXRMb2FkZWRTY3JhdGNoID0gKGxvYWRlZFNjcmF0Y2gpID0+IHtcbiAgICBzdGF0ZS5sb2FkZWRTY3JhdGNoID0gbG9hZGVkU2NyYXRjaDtcbiAgfTtcblxuICBjb25zdCB0cmFjZXJNYW5hZ2VyID0gVHJhY2VyTWFuYWdlci5pbml0KCk7XG5cbiAgaW5pdFN0YXRlKHRyYWNlck1hbmFnZXIpO1xuICBET00uc2V0dXAodHJhY2VyTWFuYWdlcik7XG5cbn07XG5cbkFwcC5wcm90b3R5cGUgPSBDYWNoZTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHA7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgbWFpbiBhcHBsaWNhdGlvbiBpbnN0YW5jZS5cbiAqIEdldHMgcG9wdWxhdGVkIG9uIHBhZ2UgbG9hZC4gXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge307IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBhcHAgPSByZXF1aXJlKCcuLi9hcHAnKTtcbmNvbnN0IFNlcnZlciA9IHJlcXVpcmUoJy4uL3NlcnZlcicpO1xuY29uc3Qgc2hvd0FsZ29yaXRobSA9IHJlcXVpcmUoJy4vc2hvd19hbGdvcml0aG0nKTtcblxuY29uc3Qge1xuICBlYWNoXG59ID0gJDtcblxuY29uc3QgYWRkQWxnb3JpdGhtVG9DYXRlZ29yeURPTSA9IChjYXRlZ29yeSwgc3ViTGlzdCwgYWxnb3JpdGhtKSA9PiB7XG4gIGNvbnN0ICRhbGdvcml0aG0gPSAkKCc8YnV0dG9uIGNsYXNzPVwiaW5kZW50IGNvbGxhcHNlXCI+JylcbiAgICAuYXBwZW5kKHN1Ykxpc3RbYWxnb3JpdGhtXSlcbiAgICAuYXR0cignZGF0YS1hbGdvcml0aG0nLCBhbGdvcml0aG0pXG4gICAgLmF0dHIoJ2RhdGEtY2F0ZWdvcnknLCBjYXRlZ29yeSlcbiAgICAuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgU2VydmVyLmxvYWRBbGdvcml0aG0oY2F0ZWdvcnksIGFsZ29yaXRobSkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBzaG93QWxnb3JpdGhtKGNhdGVnb3J5LCBhbGdvcml0aG0sIGRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgJCgnI2xpc3QnKS5hcHBlbmQoJGFsZ29yaXRobSk7XG59O1xuXG5jb25zdCBhZGRDYXRlZ29yeVRvRE9NID0gKGNhdGVnb3J5KSA9PiB7XG5cbiAgY29uc3Qge1xuICAgIG5hbWU6IGNhdGVnb3J5TmFtZSxcbiAgICBsaXN0OiBjYXRlZ29yeVN1Ykxpc3RcbiAgfSA9IGFwcC5nZXRDYXRlZ29yeShjYXRlZ29yeSk7XG5cbiAgY29uc3QgJGNhdGVnb3J5ID0gJCgnPGJ1dHRvbiBjbGFzcz1cImNhdGVnb3J5XCI+JylcbiAgICAuYXBwZW5kKCc8aSBjbGFzcz1cImZhIGZhLWZ3IGZhLWNhcmV0LXJpZ2h0XCI+JylcbiAgICAuYXBwZW5kKGNhdGVnb3J5TmFtZSlcbiAgICAuYXR0cignZGF0YS1jYXRlZ29yeScsIGNhdGVnb3J5KTtcblxuICAkY2F0ZWdvcnkuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICQoYC5pbmRlbnRbZGF0YS1jYXRlZ29yeT1cIiR7Y2F0ZWdvcnl9XCJdYCkudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlJyk7XG4gICAgJCh0aGlzKS5maW5kKCdpLmZhJykudG9nZ2xlQ2xhc3MoJ2ZhLWNhcmV0LXJpZ2h0IGZhLWNhcmV0LWRvd24nKTtcbiAgfSk7XG5cbiAgJCgnI2xpc3QnKS5hcHBlbmQoJGNhdGVnb3J5KTtcblxuICBlYWNoKGNhdGVnb3J5U3ViTGlzdCwgKGFsZ29yaXRobSkgPT4ge1xuICAgIGFkZEFsZ29yaXRobVRvQ2F0ZWdvcnlET00oY2F0ZWdvcnksIGNhdGVnb3J5U3ViTGlzdCwgYWxnb3JpdGhtKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgZWFjaChhcHAuZ2V0Q2F0ZWdvcmllcygpLCBhZGRDYXRlZ29yeVRvRE9NKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBTZXJ2ZXIgPSByZXF1aXJlKCcuLi9zZXJ2ZXInKTtcblxuY29uc3Qge1xuICBlYWNoXG59ID0gJDtcblxuY29uc3QgYWRkRmlsZVRvRE9NID0gKGNhdGVnb3J5LCBhbGdvcml0aG0sIGZpbGUsIGV4cGxhbmF0aW9uKSA9PiB7XG4gIHZhciAkZmlsZSA9ICQoJzxidXR0b24+JylcbiAgICAuYXBwZW5kKGZpbGUpXG4gICAgLmF0dHIoJ2RhdGEtZmlsZScsIGZpbGUpXG4gICAgLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgIFNlcnZlci5sb2FkRmlsZShjYXRlZ29yeSwgYWxnb3JpdGhtLCBmaWxlLCBleHBsYW5hdGlvbik7XG4gICAgICAkKCcuZmlsZXNfYmFyID4gLndyYXBwZXIgPiBidXR0b24nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICB9KTtcbiAgJCgnLmZpbGVzX2JhciA+IC53cmFwcGVyJykuYXBwZW5kKCRmaWxlKTtcbiAgcmV0dXJuICRmaWxlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSAoY2F0ZWdvcnksIGFsZ29yaXRobSwgZmlsZXMsIHJlcXVlc3RlZEZpbGUpID0+IHtcbiAgJCgnLmZpbGVzX2JhciA+IC53cmFwcGVyJykuZW1wdHkoKTtcblxuICBlYWNoKGZpbGVzLCAoZmlsZSwgZXhwbGFuYXRpb24pID0+IHtcbiAgICB2YXIgJGZpbGUgPSBhZGRGaWxlVG9ET00oY2F0ZWdvcnksIGFsZ29yaXRobSwgZmlsZSwgZXhwbGFuYXRpb24pO1xuICAgIGlmIChyZXF1ZXN0ZWRGaWxlICYmIHJlcXVlc3RlZEZpbGUgPT0gZmlsZSkgJGZpbGUuY2xpY2soKTtcbiAgfSk7XG5cbiAgaWYgKCFyZXF1ZXN0ZWRGaWxlKSAkKCcuZmlsZXNfYmFyID4gLndyYXBwZXIgPiBidXR0b24nKS5maXJzdCgpLmNsaWNrKCk7XG4gICQoJy5maWxlc19iYXIgPiAud3JhcHBlcicpLnNjcm9sbCgpO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHNob3dBbGdvcml0aG0gPSByZXF1aXJlKCcuL3Nob3dfYWxnb3JpdGhtJyk7XG5jb25zdCBhZGRDYXRlZ29yaWVzID0gcmVxdWlyZSgnLi9hZGRfY2F0ZWdvcmllcycpO1xuY29uc3Qgc2hvd0Rlc2NyaXB0aW9uID0gcmVxdWlyZSgnLi9zaG93X2Rlc2NyaXB0aW9uJyk7XG5jb25zdCBhZGRGaWxlcyA9IHJlcXVpcmUoJy4vYWRkX2ZpbGVzJyk7XG5jb25zdCBzaG93Rmlyc3RBbGdvcml0aG0gPSByZXF1aXJlKCcuL3Nob3dfZmlyc3RfYWxnb3JpdGhtJyk7XG5jb25zdCBzaG93UmVxdWVzdGVkQWxnb3JpdGhtID0gcmVxdWlyZSgnLi9zaG93X3JlcXVlc3RlZF9hbGdvcml0aG0nKTtcbmNvbnN0IHNob3dXaWtpID0gcmVxdWlyZSgnLi9zaG93X3dpa2knKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNob3dBbGdvcml0aG0sXG4gIGFkZENhdGVnb3JpZXMsXG4gIHNob3dEZXNjcmlwdGlvbixcbiAgYWRkRmlsZXMsXG4gIHNob3dGaXJzdEFsZ29yaXRobSxcbiAgc2hvd1JlcXVlc3RlZEFsZ29yaXRobSxcbiAgc2hvd1dpa2lcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBzaG93TG9hZGluZ1NsaWRlciA9ICgpID0+IHtcbiAgJCgnI2xvYWRpbmctc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ2xvYWRlZCcpO1xufTtcblxuY29uc3QgaGlkZUxvYWRpbmdTbGlkZXIgPSAoKSA9PiB7XG4gICQoJyNsb2FkaW5nLXNsaWRlcicpLmFkZENsYXNzKCdsb2FkZWQnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaG93TG9hZGluZ1NsaWRlcixcbiAgaGlkZUxvYWRpbmdTbGlkZXJcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGNyZWF0ZSA9ICgpID0+IHtcbiAgY29uc3QgJGNvbnRhaW5lciA9ICQoJzxzZWN0aW9uIGNsYXNzPVwibW9kdWxlX3dyYXBwZXJcIj4nKTtcbiAgJCgnLm1vZHVsZV9jb250YWluZXInKS5hcHBlbmQoJGNvbnRhaW5lcik7XG4gIHJldHVybiAkY29udGFpbmVyO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3Qgc2V0dXBEaXZpZGVycyA9IHJlcXVpcmUoJy4vc2V0dXBfZGl2aWRlcnMnKTtcbmNvbnN0IHNldHVwRG9jdW1lbnQgPSByZXF1aXJlKCcuL3NldHVwX2RvY3VtZW50Jyk7XG5jb25zdCBzZXR1cEZpbGVzQmFyID0gcmVxdWlyZSgnLi9zZXR1cF9maWxlc19iYXInKTtcbmNvbnN0IHNldHVwSW50ZXJ2YWwgPSByZXF1aXJlKCcuL3NldHVwX2ludGVydmFsJyk7XG5jb25zdCBzZXR1cE1vZHVsZUNvbnRhaW5lciA9IHJlcXVpcmUoJy4vc2V0dXBfbW9kdWxlX2NvbnRhaW5lcicpO1xuY29uc3Qgc2V0dXBQb3dlcmVkQnkgPSByZXF1aXJlKCcuL3NldHVwX3Bvd2VyZWRfYnknKTtcbmNvbnN0IHNldHVwU2NyYXRjaFBhcGVyID0gcmVxdWlyZSgnLi9zZXR1cF9zY3JhdGNoX3BhcGVyJyk7XG5jb25zdCBzZXR1cFNpZGVNZW51ID0gcmVxdWlyZSgnLi9zZXR1cF9zaWRlX21lbnUnKTtcbmNvbnN0IHNldHVwVG9wTWVudSA9IHJlcXVpcmUoJy4vc2V0dXBfdG9wX21lbnUnKTtcbmNvbnN0IHNldHVwV2luZG93ID0gcmVxdWlyZSgnLi9zZXR1cF93aW5kb3cnKTtcblxuLyoqXG4gKiBJbml0aWFsaXplcyBlbGVtZW50cyBvbmNlIHRoZSBhcHAgbG9hZHMgaW4gdGhlIERPTS5cbiAqL1xuY29uc3Qgc2V0dXAgPSAoKSA9PiB7XG5cbiAgJCgnLmJ0biBpbnB1dCcpLmNsaWNrKChlKSA9PiB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSk7XG5cbiAgLy8gZGl2aWRlcnNcbiAgc2V0dXBEaXZpZGVycygpO1xuXG4gIC8vIGRvY3VtZW50XG4gIHNldHVwRG9jdW1lbnQoKTtcblxuICAvLyBmaWxlcyBiYXJcbiAgc2V0dXBGaWxlc0JhcigpO1xuXG4gIC8vIGludGVydmFsXG4gIHNldHVwSW50ZXJ2YWwoKTtcblxuICAvLyBtb2R1bGUgY29udGFpbmVyXG4gIHNldHVwTW9kdWxlQ29udGFpbmVyKCk7XG5cbiAgLy8gcG93ZXJlZCBieVxuICBzZXR1cFBvd2VyZWRCeSgpO1xuXG4gIC8vIHNjcmF0Y2ggcGFwZXJcbiAgc2V0dXBTY3JhdGNoUGFwZXIoKTtcblxuICAvLyBzaWRlIG1lbnVcbiAgc2V0dXBTaWRlTWVudSgpO1xuXG4gIC8vIHRvcCBtZW51XG4gIHNldHVwVG9wTWVudSgpO1xuXG4gIC8vIHdpbmRvd1xuICBzZXR1cFdpbmRvdygpO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0dXBcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGFwcCA9IHJlcXVpcmUoJy4uLy4uL2FwcCcpO1xuXG5jb25zdCBhZGREaXZpZGVyVG9Eb20gPSAoZGl2aWRlcikgPT4ge1xuICBjb25zdCBbdmVydGljYWwsICRmaXJzdCwgJHNlY29uZF0gPSBkaXZpZGVyO1xuICBjb25zdCAkcGFyZW50ID0gJGZpcnN0LnBhcmVudCgpO1xuICBjb25zdCB0aGlja25lc3MgPSA1O1xuXG4gIGNvbnN0ICRkaXZpZGVyID0gJCgnPGRpdiBjbGFzcz1cImRpdmlkZXJcIj4nKTtcblxuICBsZXQgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgaWYgKHZlcnRpY2FsKSB7XG4gICAgJGRpdmlkZXIuYWRkQ2xhc3MoJ3ZlcnRpY2FsJyk7XG5cbiAgICBsZXQgX2xlZnQgPSAtdGhpY2tuZXNzIC8gMjtcbiAgICAkZGl2aWRlci5jc3Moe1xuICAgICAgdG9wOiAwLFxuICAgICAgYm90dG9tOiAwLFxuICAgICAgbGVmdDogX2xlZnQsXG4gICAgICB3aWR0aDogdGhpY2tuZXNzXG4gICAgfSk7XG5cbiAgICBsZXQgeDtcbiAgICAkZGl2aWRlci5tb3VzZWRvd24oKHtcbiAgICAgIHBhZ2VYXG4gICAgfSkgPT4ge1xuICAgICAgeCA9IHBhZ2VYO1xuICAgICAgZHJhZ2dpbmcgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgJChkb2N1bWVudCkubW91c2Vtb3ZlKCh7XG4gICAgICBwYWdlWFxuICAgIH0pID0+IHtcbiAgICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgICBjb25zdCBuZXdfbGVmdCA9ICRzZWNvbmQucG9zaXRpb24oKS5sZWZ0ICsgcGFnZVggLSB4O1xuICAgICAgICBsZXQgcGVyY2VudCA9IG5ld19sZWZ0IC8gJHBhcmVudC53aWR0aCgpICogMTAwO1xuICAgICAgICBwZXJjZW50ID0gTWF0aC5taW4oOTAsIE1hdGgubWF4KDEwLCBwZXJjZW50KSk7XG4gICAgICAgICRmaXJzdC5jc3MoJ3JpZ2h0JywgKDEwMCAtIHBlcmNlbnQpICsgJyUnKTtcbiAgICAgICAgJHNlY29uZC5jc3MoJ2xlZnQnLCBwZXJjZW50ICsgJyUnKTtcbiAgICAgICAgeCA9IHBhZ2VYO1xuICAgICAgICBhcHAuZ2V0VHJhY2VyTWFuYWdlcigpLnJlc2l6ZSgpO1xuICAgICAgICAkKCcuZmlsZXNfYmFyID4gLndyYXBwZXInKS5zY3JvbGwoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oZSkge1xuICAgICAgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB9KTtcblxuICB9IGVsc2Uge1xuXG4gICAgJGRpdmlkZXIuYWRkQ2xhc3MoJ2hvcml6b250YWwnKTtcbiAgICBjb25zdCBfdG9wID0gLXRoaWNrbmVzcyAvIDI7XG4gICAgJGRpdmlkZXIuY3NzKHtcbiAgICAgIHRvcDogX3RvcCxcbiAgICAgIGhlaWdodDogdGhpY2tuZXNzLFxuICAgICAgbGVmdDogMCxcbiAgICAgIHJpZ2h0OiAwXG4gICAgfSk7XG5cbiAgICBsZXQgeTtcbiAgICAkZGl2aWRlci5tb3VzZWRvd24oZnVuY3Rpb24oe1xuICAgICAgcGFnZVlcbiAgICB9KSB7XG4gICAgICB5ID0gcGFnZVk7XG4gICAgICBkcmFnZ2luZyA9IHRydWU7XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5tb3VzZW1vdmUoZnVuY3Rpb24oe1xuICAgICAgcGFnZVlcbiAgICB9KSB7XG4gICAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgICAgY29uc3QgbmV3X3RvcCA9ICRzZWNvbmQucG9zaXRpb24oKS50b3AgKyBwYWdlWSAtIHk7XG4gICAgICAgIGxldCBwZXJjZW50ID0gbmV3X3RvcCAvICRwYXJlbnQuaGVpZ2h0KCkgKiAxMDA7XG4gICAgICAgIHBlcmNlbnQgPSBNYXRoLm1pbig5MCwgTWF0aC5tYXgoMTAsIHBlcmNlbnQpKTtcbiAgICAgICAgJGZpcnN0LmNzcygnYm90dG9tJywgKDEwMCAtIHBlcmNlbnQpICsgJyUnKTtcbiAgICAgICAgJHNlY29uZC5jc3MoJ3RvcCcsIHBlcmNlbnQgKyAnJScpO1xuICAgICAgICB5ID0gcGFnZVk7XG4gICAgICAgIGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCkucmVzaXplKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKGUpIHtcbiAgICAgIGRyYWdnaW5nID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICAkc2Vjb25kLmFwcGVuZCgkZGl2aWRlcik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgY29uc3QgZGl2aWRlcnMgPSBbXG4gICAgWyd2JywgJCgnLnNpZGVtZW51JyksICQoJy53b3Jrc3BhY2UnKV0sXG4gICAgWyd2JywgJCgnLnZpZXdlcl9jb250YWluZXInKSwgJCgnLmVkaXRvcl9jb250YWluZXInKV0sXG4gICAgWydoJywgJCgnLmRhdGFfY29udGFpbmVyJyksICQoJy5jb2RlX2NvbnRhaW5lcicpXVxuICBdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgYWRkRGl2aWRlclRvRG9tKGRpdmlkZXJzW2ldKTtcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBhcHAgPSByZXF1aXJlKCcuLi8uLi9hcHAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdhJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKCF3aW5kb3cub3BlbigkKHRoaXMpLmF0dHIoJ2hyZWYnKSwgJ19ibGFuaycpKSB7XG4gICAgICBhbGVydCgnUGxlYXNlIGFsbG93IHBvcHVwcyBmb3IgdGhpcyBzaXRlJyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uIChlKSB7XG4gICAgYXBwLmdldFRyYWNlck1hbmFnZXIoKS5jb21tYW5kKCdtb3VzZXVwJywgZSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgZGVmaW5pdGVseUJpZ2dlciA9ICh4LCB5KSA9PiB4ID4gKHkgKyAyKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG5cbiAgJCgnLmZpbGVzX2JhciA+IC5idG4tbGVmdCcpLmNsaWNrKCgpID0+IHtcbiAgICBjb25zdCAkd3JhcHBlciA9ICQoJy5maWxlc19iYXIgPiAud3JhcHBlcicpO1xuICAgIGNvbnN0IGNsaXBXaWR0aCA9ICR3cmFwcGVyLndpZHRoKCk7XG4gICAgY29uc3Qgc2Nyb2xsTGVmdCA9ICR3cmFwcGVyLnNjcm9sbExlZnQoKTtcblxuICAgICQoJHdyYXBwZXIuY2hpbGRyZW4oJ2J1dHRvbicpLmdldCgpLnJldmVyc2UoKSkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGxlZnQgPSAkKHRoaXMpLnBvc2l0aW9uKCkubGVmdDtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gbGVmdCArICQodGhpcykub3V0ZXJXaWR0aCgpO1xuICAgICAgaWYgKDAgPiBsZWZ0KSB7XG4gICAgICAgICR3cmFwcGVyLnNjcm9sbExlZnQoc2Nyb2xsTGVmdCArIHJpZ2h0IC0gY2xpcFdpZHRoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICAkKCcuZmlsZXNfYmFyID4gLmJ0bi1yaWdodCcpLmNsaWNrKCgpID0+IHtcbiAgICBjb25zdCAkd3JhcHBlciA9ICQoJy5maWxlc19iYXIgPiAud3JhcHBlcicpO1xuICAgIGNvbnN0IGNsaXBXaWR0aCA9ICR3cmFwcGVyLndpZHRoKCk7XG4gICAgY29uc3Qgc2Nyb2xsTGVmdCA9ICR3cmFwcGVyLnNjcm9sbExlZnQoKTtcblxuICAgICR3cmFwcGVyLmNoaWxkcmVuKCdidXR0b24nKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbGVmdCA9ICQodGhpcykucG9zaXRpb24oKS5sZWZ0O1xuICAgICAgY29uc3QgcmlnaHQgPSBsZWZ0ICsgJCh0aGlzKS5vdXRlcldpZHRoKCk7XG4gICAgICBpZiAoY2xpcFdpZHRoIDwgcmlnaHQpIHtcbiAgICAgICAgJHdyYXBwZXIuc2Nyb2xsTGVmdChzY3JvbGxMZWZ0ICsgbGVmdCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgJCgnLmZpbGVzX2JhciA+IC53cmFwcGVyJykuc2Nyb2xsKGZ1bmN0aW9uKCkge1xuXG4gICAgY29uc3QgJHdyYXBwZXIgPSAkKCcuZmlsZXNfYmFyID4gLndyYXBwZXInKTtcbiAgICBjb25zdCBjbGlwV2lkdGggPSAkd3JhcHBlci53aWR0aCgpO1xuICAgIGNvbnN0ICRsZWZ0ID0gJHdyYXBwZXIuY2hpbGRyZW4oJ2J1dHRvbjpmaXJzdC1jaGlsZCcpO1xuICAgIGNvbnN0ICRyaWdodCA9ICR3cmFwcGVyLmNoaWxkcmVuKCdidXR0b246bGFzdC1jaGlsZCcpO1xuICAgIGNvbnN0IGxlZnQgPSAkbGVmdC5wb3NpdGlvbigpLmxlZnQ7XG4gICAgY29uc3QgcmlnaHQgPSAkcmlnaHQucG9zaXRpb24oKS5sZWZ0ICsgJHJpZ2h0Lm91dGVyV2lkdGgoKTtcblxuICAgIGlmIChkZWZpbml0ZWx5QmlnZ2VyKDAsIGxlZnQpICYmIGRlZmluaXRlbHlCaWdnZXIoY2xpcFdpZHRoLCByaWdodCkpIHtcbiAgICAgIGNvbnN0IHNjcm9sbExlZnQgPSAkd3JhcHBlci5zY3JvbGxMZWZ0KCk7XG4gICAgICAkd3JhcHBlci5zY3JvbGxMZWZ0KHNjcm9sbExlZnQgKyBjbGlwV2lkdGggLSByaWdodCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGVmdGVyID0gZGVmaW5pdGVseUJpZ2dlcigwLCBsZWZ0KTtcbiAgICBjb25zdCByaWdodGVyID0gZGVmaW5pdGVseUJpZ2dlcihyaWdodCwgY2xpcFdpZHRoKTtcbiAgICAkd3JhcHBlci50b2dnbGVDbGFzcygnc2hhZG93LWxlZnQnLCBsZWZ0ZXIpO1xuICAgICR3cmFwcGVyLnRvZ2dsZUNsYXNzKCdzaGFkb3ctcmlnaHQnLCByaWdodGVyKTtcbiAgICAkKCcuZmlsZXNfYmFyID4gLmJ0bi1sZWZ0JykuYXR0cignZGlzYWJsZWQnLCAhbGVmdGVyKTtcbiAgICAkKCcuZmlsZXNfYmFyID4gLmJ0bi1yaWdodCcpLmF0dHIoJ2Rpc2FibGVkJywgIXJpZ2h0ZXIpO1xuICB9KTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vLi4vYXBwJyk7XG5jb25zdCBUb2FzdCA9IHJlcXVpcmUoJy4uL3RvYXN0Jyk7XG5cbmNvbnN0IHtcbiAgcGFyc2VGbG9hdFxufSA9IE51bWJlcjtcblxuY29uc3QgbWluSW50ZXJ2YWwgPSAwLjE7XG5jb25zdCBtYXhJbnRlcnZhbCA9IDEwO1xuY29uc3Qgc3RhcnRJbnRlcnZhbCA9IDAuNTtcbmNvbnN0IHN0ZXBJbnRlcnZhbCA9IDAuMTtcblxuY29uc3Qgbm9ybWFsaXplID0gKHNlYykgPT4ge1xuXG5cbiAgbGV0IGludGVydmFsO1xuICBsZXQgbWVzc2FnZTtcbiAgaWYgKHNlYyA8IG1pbkludGVydmFsKSB7XG4gICAgaW50ZXJ2YWwgPSBtaW5JbnRlcnZhbDtcbiAgICBtZXNzYWdlID0gYEludGVydmFsIG9mICR7c2VjfSBzZWNvbmRzIGlzIHRvbyBsb3cuIFNldHRpbmcgdG8gbWluIGFsbG93ZWQgaW50ZXJ2YWwgb2YgJHttaW5JbnRlcnZhbH0gc2Vjb25kKHMpLmA7XG4gIH0gZWxzZSBpZiAoc2VjID4gbWF4SW50ZXJ2YWwpIHtcbiAgICBpbnRlcnZhbCA9IG1heEludGVydmFsO1xuICAgIG1lc3NhZ2UgPSBgSW50ZXJ2YWwgb2YgJHtzZWN9IHNlY29uZHMgaXMgdG9vIGhpZ2guIFNldHRpbmcgdG8gbWF4IGFsbG93ZWQgaW50ZXJ2YWwgb2YgJHttYXhJbnRlcnZhbH0gc2Vjb25kKHMpLmA7XG4gIH0gZWxzZSB7XG4gICAgaW50ZXJ2YWwgPSBzZWM7XG4gICAgbWVzc2FnZSA9IGBJbnRlcnZhbCBoYXMgYmVlbiBzZXQgdG8gJHtzZWN9IHNlY29uZChzKS5gXG4gIH1cblxuICByZXR1cm4gW2ludGVydmFsLCBtZXNzYWdlXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuXG4gIGNvbnN0ICRpbnRlcnZhbCA9ICQoJyNpbnRlcnZhbCcpO1xuICAkaW50ZXJ2YWwudmFsKHN0YXJ0SW50ZXJ2YWwpO1xuICAkaW50ZXJ2YWwuYXR0cih7XG4gICAgbWF4OiBtYXhJbnRlcnZhbCxcbiAgICBtaW46IG1pbkludGVydmFsLFxuICAgIHN0ZXA6IHN0ZXBJbnRlcnZhbFxuICB9KTtcblxuICAkKCcjaW50ZXJ2YWwnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgdHJhY2VyTWFuYWdlciA9IGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCk7XG4gICAgY29uc3QgW3NlY29uZHMsIG1lc3NhZ2VdID0gbm9ybWFsaXplKHBhcnNlRmxvYXQoJCh0aGlzKS52YWwoKSkpO1xuXG4gICAgJCh0aGlzKS52YWwoc2Vjb25kcyk7XG4gICAgdHJhY2VyTWFuYWdlci5pbnRlcnZhbCA9IHNlY29uZHMgKiAxMDAwO1xuICAgIFRvYXN0LnNob3dJbmZvVG9hc3QobWVzc2FnZSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vLi4vYXBwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuXG4gIGNvbnN0ICRtb2R1bGVfY29udGFpbmVyID0gJCgnLm1vZHVsZV9jb250YWluZXInKTtcblxuICAkbW9kdWxlX2NvbnRhaW5lci5vbignbW91c2Vkb3duJywgJy5tb2R1bGVfd3JhcHBlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICBhcHAuZ2V0VHJhY2VyTWFuYWdlcigpLmZpbmRPd25lcih0aGlzKS5tb3VzZWRvd24oZSk7XG4gIH0pO1xuXG4gICRtb2R1bGVfY29udGFpbmVyLm9uKCdtb3VzZW1vdmUnLCAnLm1vZHVsZV93cmFwcGVyJywgZnVuY3Rpb24oZSkge1xuICAgIGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCkuZmluZE93bmVyKHRoaXMpLm1vdXNlbW92ZShlKTtcbiAgfSk7XG5cbiAgJG1vZHVsZV9jb250YWluZXIub24oJ0RPTU1vdXNlU2Nyb2xsIG1vdXNld2hlZWwnLCAnLm1vZHVsZV93cmFwcGVyJywgZnVuY3Rpb24oZSkge1xuICAgIGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCkuZmluZE93bmVyKHRoaXMpLm1vdXNld2hlZWwoZSk7XG4gIH0pO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgJCgnI3Bvd2VyZWQtYnknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAkKCcjcG93ZXJlZC1ieS1saXN0IGJ1dHRvbicpLnRvZ2dsZUNsYXNzKCdjb2xsYXBzZScpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGFwcCA9IHJlcXVpcmUoJy4uLy4uL2FwcCcpO1xuY29uc3QgU2VydmVyID0gcmVxdWlyZSgnLi4vLi4vc2VydmVyJyk7XG5jb25zdCBzaG93QWxnb3JpdGhtID0gcmVxdWlyZSgnLi4vc2hvd19hbGdvcml0aG0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gICQoJyNzY3JhdGNoLXBhcGVyJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgY2F0ZWdvcnkgPSAnc2NyYXRjaCc7XG4gICAgY29uc3QgYWxnb3JpdGhtID0gYXBwLmdldExvYWRlZFNjcmF0Y2goKTtcbiAgICBTZXJ2ZXIubG9hZEFsZ29yaXRobShjYXRlZ29yeSwgYWxnb3JpdGhtKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICBzaG93QWxnb3JpdGhtKGNhdGVnb3J5LCBhbGdvcml0aG0sIGRhdGEpO1xuICAgIH0pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGFwcCA9IHJlcXVpcmUoJy4uLy4uL2FwcCcpO1xuXG5sZXQgc2lkZW1lbnVfcGVyY2VudDtcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gICQoJyNuYXZpZ2F0aW9uJykuY2xpY2soKCkgPT4ge1xuICAgIGNvbnN0ICRzaWRlbWVudSA9ICQoJy5zaWRlbWVudScpO1xuICAgIGNvbnN0ICR3b3Jrc3BhY2UgPSAkKCcud29ya3NwYWNlJyk7XG5cbiAgICAkc2lkZW1lbnUudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICQoJy5uYXYtZHJvcGRvd24nKS50b2dnbGVDbGFzcygnZmEtY2FyZXQtZG93biBmYS1jYXJldC11cCcpO1xuXG4gICAgaWYgKCRzaWRlbWVudS5oYXNDbGFzcygnYWN0aXZlJykpIHtcbiAgICAgICRzaWRlbWVudS5jc3MoJ3JpZ2h0JywgKDEwMCAtIHNpZGVtZW51X3BlcmNlbnQpICsgJyUnKTtcbiAgICAgICR3b3Jrc3BhY2UuY3NzKCdsZWZ0Jywgc2lkZW1lbnVfcGVyY2VudCArICclJyk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgc2lkZW1lbnVfcGVyY2VudCA9ICR3b3Jrc3BhY2UucG9zaXRpb24oKS5sZWZ0IC8gJCgnYm9keScpLndpZHRoKCkgKiAxMDA7XG4gICAgICAkc2lkZW1lbnUuY3NzKCdyaWdodCcsIDApO1xuICAgICAgJHdvcmtzcGFjZS5jc3MoJ2xlZnQnLCAwKTtcbiAgICB9XG5cbiAgICBhcHAuZ2V0VHJhY2VyTWFuYWdlcigpLnJlc2l6ZSgpO1xuICB9KTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vLi4vYXBwJyk7XG5jb25zdCBTZXJ2ZXIgPSByZXF1aXJlKCcuLi8uLi9zZXJ2ZXInKTtcbmNvbnN0IFRvYXN0ID0gcmVxdWlyZSgnLi4vdG9hc3QnKTtcbmNvbnN0IFRvcE1lbnUgPSByZXF1aXJlKCcuLi90b3BfbWVudScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcblxuICAvLyBzaGFyZWRcbiAgJCgnI3NoYXJlZCcpLm1vdXNldXAoZnVuY3Rpb24gKCkge1xuICAgICQodGhpcykuc2VsZWN0KCk7XG4gIH0pO1xuXG4gICQoJyNidG5fc2hhcmUnKS5jbGljayhmdW5jdGlvbiAoKSB7XG5cbiAgICBjb25zdCAkaWNvbiA9ICQodGhpcykuZmluZCgnLmZhLXNoYXJlJyk7XG4gICAgJGljb24uYWRkQ2xhc3MoJ2ZhLXNwaW4gZmEtc3Bpbi1mYXN0ZXInKTtcblxuICAgIFNlcnZlci5zaGFyZVNjcmF0Y2hQYXBlcigpLnRoZW4oKHVybCkgPT4ge1xuICAgICAgJGljb24ucmVtb3ZlQ2xhc3MoJ2ZhLXNwaW4gZmEtc3Bpbi1mYXN0ZXInKTtcbiAgICAgICQoJyNzaGFyZWQnKS5yZW1vdmVDbGFzcygnY29sbGFwc2UnKTtcbiAgICAgICQoJyNzaGFyZWQnKS52YWwodXJsKTtcbiAgICAgIFRvYXN0LnNob3dJbmZvVG9hc3QoJ1NoYXJlYWJsZSBsaW5rIGlzIGNyZWF0ZWQuJyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIGNvbnRyb2xcblxuICBjb25zdCAkYnRuUnVuID0gJCgnI2J0bl9ydW4nKTtcbiAgY29uc3QgJGJ0blRyYWNlID0gJCgnI2J0bl90cmFjZScpO1xuICBjb25zdCAkYnRuUGF1c2UgPSAkKCcjYnRuX3BhdXNlJyk7XG4gIGNvbnN0ICRidG5QcmV2ID0gJCgnI2J0bl9wcmV2Jyk7XG4gIGNvbnN0ICRidG5OZXh0ID0gJCgnI2J0bl9uZXh0Jyk7XG5cbiAgLy8gaW5pdGlhbGx5LCBjb250cm9sIGJ1dHRvbnMgYXJlIGRpc2FibGVkXG4gIFRvcE1lbnUuZGlzYWJsZUZsb3dDb250cm9sKCk7XG5cbiAgJGJ0blJ1bi5jbGljaygoKSA9PiB7XG4gICAgJGJ0blRyYWNlLmNsaWNrKCk7XG4gICAgJGJ0blBhdXNlLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAkYnRuUnVuLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICBUb3BNZW51LmVuYWJsZUZsb3dDb250cm9sKCk7XG4gICAgdmFyIGVyciA9IGFwcC5nZXRFZGl0b3IoKS5leGVjdXRlKCk7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgVG9hc3Quc2hvd0Vycm9yVG9hc3QoZXJyKTtcbiAgICB9XG4gIH0pO1xuXG4gICRidG5QYXVzZS5jbGljaygoKSA9PiB7XG4gICAgJGJ0blJ1bi50b2dnbGVDbGFzcygnYWN0aXZlJyk7XG4gICAgJGJ0blBhdXNlLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbiAgICBpZiAoYXBwLmdldFRyYWNlck1hbmFnZXIoKS5pc1BhdXNlKCkpIHtcbiAgICAgIGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCkucmVzdW1lU3RlcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcHAuZ2V0VHJhY2VyTWFuYWdlcigpLnBhdXNlU3RlcCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgJGJ0blByZXYuY2xpY2soKCkgPT4ge1xuICAgICRidG5SdW4ucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICRidG5QYXVzZS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgYXBwLmdldFRyYWNlck1hbmFnZXIoKS5wYXVzZVN0ZXAoKTtcbiAgICBhcHAuZ2V0VHJhY2VyTWFuYWdlcigpLnByZXZTdGVwKCk7XG4gIH0pO1xuXG4gICRidG5OZXh0LmNsaWNrKCgpID0+IHtcbiAgICAkYnRuUnVuLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAkYnRuUGF1c2UuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgIGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCkucGF1c2VTdGVwKCk7XG4gICAgYXBwLmdldFRyYWNlck1hbmFnZXIoKS5uZXh0U3RlcCgpO1xuICB9KTtcblxuICAvLyBkZXNjcmlwdGlvbiAmIHRyYWNlXG5cbiAgJCgnLnRhYl9iYXIgPiBidXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgJCgnLnRhYl9iYXIgPiBidXR0b24nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgJCgnLnRhYl9jb250YWluZXIgPiAudGFiJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICQoJCh0aGlzKS5hdHRyKCdkYXRhLXRhcmdldCcpKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gIH0pO1xuXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBhcHAgPSByZXF1aXJlKCcuLi8uLi9hcHAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICBhcHAuZ2V0VHJhY2VyTWFuYWdlcigpLnJlc2l6ZSgpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGFwcCA9IHJlcXVpcmUoJy4uL2FwcCcpO1xuXG5jb25zdCB7XG4gIGlzU2NyYXRjaFBhcGVyXG59ID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuY29uc3Qgc2hvd0Rlc2NyaXB0aW9uID0gcmVxdWlyZSgnLi9zaG93X2Rlc2NyaXB0aW9uJyk7XG5jb25zdCBhZGRGaWxlcyA9IHJlcXVpcmUoJy4vYWRkX2ZpbGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGNhdGVnb3J5LCBhbGdvcml0aG0sIGRhdGEsIHJlcXVlc3RlZEZpbGUpID0+IHtcbiAgbGV0ICRtZW51O1xuICBsZXQgY2F0ZWdvcnlfbmFtZTtcbiAgbGV0IGFsZ29yaXRobV9uYW1lO1xuXG4gIGlmIChpc1NjcmF0Y2hQYXBlcihjYXRlZ29yeSkpIHtcbiAgICAkbWVudSA9ICQoJyNzY3JhdGNoLXBhcGVyJyk7XG4gICAgY2F0ZWdvcnlfbmFtZSA9ICdTY3JhdGNoIFBhcGVyJztcbiAgICBhbGdvcml0aG1fbmFtZSA9IGFsZ29yaXRobSA/ICdTaGFyZWQnIDogJ1RlbXBvcmFyeSc7XG4gIH0gZWxzZSB7XG4gICAgJG1lbnUgPSAkKGBbZGF0YS1jYXRlZ29yeT1cIiR7Y2F0ZWdvcnl9XCJdW2RhdGEtYWxnb3JpdGhtPVwiJHthbGdvcml0aG19XCJdYCk7XG4gICAgY29uc3QgY2F0ZWdvcnlPYmogPSBhcHAuZ2V0Q2F0ZWdvcnkoY2F0ZWdvcnkpO1xuICAgIGNhdGVnb3J5X25hbWUgPSBjYXRlZ29yeU9iai5uYW1lO1xuICAgIGFsZ29yaXRobV9uYW1lID0gY2F0ZWdvcnlPYmoubGlzdFthbGdvcml0aG1dO1xuICB9XG5cbiAgJCgnLnNpZGVtZW51IGJ1dHRvbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgJG1lbnUuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICQoJyNjYXRlZ29yeScpLmh0bWwoY2F0ZWdvcnlfbmFtZSk7XG4gICQoJyNhbGdvcml0aG0nKS5odG1sKGFsZ29yaXRobV9uYW1lKTtcbiAgJCgnI3RhYl9kZXNjID4gLndyYXBwZXInKS5lbXB0eSgpO1xuICAkKCcuZmlsZXNfYmFyID4gLndyYXBwZXInKS5lbXB0eSgpO1xuICAkKCcjZXhwbGFuYXRpb24nKS5odG1sKCcnKTtcblxuICBhcHAuc2V0TGFzdEZpbGVVc2VkKG51bGwpO1xuICBhcHAuZ2V0RWRpdG9yKCkuY2xlYXJDb250ZW50KCk7XG5cbiAgY29uc3Qge1xuICAgIGZpbGVzXG4gIH0gPSBkYXRhO1xuXG4gIGRlbGV0ZSBkYXRhLmZpbGVzO1xuXG4gIHNob3dEZXNjcmlwdGlvbihkYXRhKTtcbiAgYWRkRmlsZXMoY2F0ZWdvcnksIGFsZ29yaXRobSwgZmlsZXMsIHJlcXVlc3RlZEZpbGUpO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHtcbiAgaXNBcnJheVxufSA9IEFycmF5O1xuXG5jb25zdCB7XG4gIGVhY2hcbn0gPSAkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChkYXRhKSA9PiB7XG4gIGNvbnN0ICRjb250YWluZXIgPSAkKCcjdGFiX2Rlc2MgPiAud3JhcHBlcicpO1xuICAkY29udGFpbmVyLmVtcHR5KCk7XG5cbiAgZWFjaChkYXRhLCAoa2V5LCB2YWx1ZSkgPT4ge1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgJGNvbnRhaW5lci5hcHBlbmQoJCgnPGgzPicpLmh0bWwoa2V5KSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICRjb250YWluZXIuYXBwZW5kKCQoJzxwPicpLmh0bWwodmFsdWUpKTtcblxuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcblxuICAgICAgY29uc3QgJHVsID0gJCgnPHVsIGNsYXNzPVwiYXBwbGljYXRpb25zXCI+Jyk7XG4gICAgICAkY29udGFpbmVyLmFwcGVuZCgkdWwpO1xuXG4gICAgICB2YWx1ZS5mb3JFYWNoKChsaSkgPT4ge1xuICAgICAgICAkdWwuYXBwZW5kKCQoJzxsaT4nKS5odG1sKGxpKSk7XG4gICAgICB9KTtcblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuXG4gICAgICBjb25zdCAkdWwgPSAkKCc8dWwgY2xhc3M9XCJjb21wbGV4aXRpZXNcIj4nKTtcbiAgICAgICRjb250YWluZXIuYXBwZW5kKCR1bCk7XG5cbiAgICAgIGVhY2godmFsdWUsIChwcm9wKSA9PiB7XG4gICAgICAgIGNvbnN0ICR3cmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cImNvbXBsZXhpdHlcIj4nKTtcbiAgICAgICAgY29uc3QgJHR5cGUgPSAkKCc8c3BhbiBjbGFzcz1cImNvbXBsZXhpdHktdHlwZVwiPicpLmh0bWwoYCR7cHJvcH06IGApO1xuICAgICAgICBjb25zdCAkdmFsdWUgPSAkKCc8c3BhbiBjbGFzcz1cImNvbXBsZXhpdHktdmFsdWVcIj4nKS5odG1sKGAke3ZhbHVlW3Byb3BdfWApO1xuXG4gICAgICAgICR3cmFwcGVyLmFwcGVuZCgkdHlwZSkuYXBwZW5kKCR2YWx1ZSk7XG5cbiAgICAgICAgJHVsLmFwcGVuZCgkKCc8bGk+JykuYXBwZW5kKCR3cmFwcGVyKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gY2xpY2sgdGhlIGZpcnN0IGFsZ29yaXRobSBpbiB0aGUgZmlyc3QgY2F0ZWdvcnlcbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICAkKCcjbGlzdCBidXR0b24uY2F0ZWdvcnknKS5maXJzdCgpLmNsaWNrKCk7XG4gICQoJyNsaXN0IGJ1dHRvbi5jYXRlZ29yeSArIC5pbmRlbnQnKS5maXJzdCgpLmNsaWNrKCk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgU2VydmVyID0gcmVxdWlyZSgnLi4vc2VydmVyJyk7XG5jb25zdCBzaG93QWxnb3JpdGhtID0gcmVxdWlyZSgnLi9zaG93X2FsZ29yaXRobScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChjYXRlZ29yeSwgYWxnb3JpdGhtLCBmaWxlKSA9PiB7XG4gICQoYC5jYXRlZ29yeVtkYXRhLWNhdGVnb3J5PVwiJHtjYXRlZ29yeX1cIl1gKS5jbGljaygpO1xuICBTZXJ2ZXIubG9hZEFsZ29yaXRobShjYXRlZ29yeSwgYWxnb3JpdGhtKS50aGVuKChkYXRhKSA9PiB7XG4gICAgc2hvd0FsZ29yaXRobShjYXRlZ29yeSwgYWxnb3JpdGhtLCBkYXRhLCBmaWxlKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBTZXJ2ZXIgPSByZXF1aXJlKCcuLi9zZXJ2ZXInKTtcbmNvbnN0IGNvbnZlcnRlciA9IG5ldyBzaG93ZG93bi5Db252ZXJ0ZXIoe3RhYmxlczogdHJ1ZX0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICh3aWtpKSA9PiB7XG4gIFNlcnZlci5sb2FkV2lraSh3aWtpKS50aGVuKChkYXRhKSA9PiB7XG4gICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgJCgnI3RhYl9kb2MgPiAud3JhcHBlcicpLmh0bWwoY29udmVydGVyLm1ha2VIdG1sKGRhdGEpKTtcbiAgfSk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3Qgc2hvd1RvYXN0ID0gKGRhdGEsIHR5cGUpID0+IHtcbiAgY29uc3QgJHRvYXN0ID0gJChgPGRpdiBjbGFzcz1cInRvYXN0ICR7dHlwZX1cIj5gKS5hcHBlbmQoZGF0YSk7XG5cbiAgJCgnLnRvYXN0X2NvbnRhaW5lcicpLmFwcGVuZCgkdG9hc3QpO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAkdG9hc3QuZmFkZU91dCgoKSA9PiB7XG4gICAgICAkdG9hc3QucmVtb3ZlKCk7XG4gICAgfSk7XG4gIH0sIDMwMDApO1xufTtcblxuY29uc3Qgc2hvd0Vycm9yVG9hc3QgPSAoZXJyKSA9PiB7XG4gIHNob3dUb2FzdChlcnIsICdlcnJvcicpO1xufTtcblxuY29uc3Qgc2hvd0luZm9Ub2FzdCA9IChlcnIpID0+IHtcbiAgc2hvd1RvYXN0KGVyciwgJ2luZm8nKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaG93RXJyb3JUb2FzdCxcbiAgc2hvd0luZm9Ub2FzdFxufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZsb3dDb250cm9sQnRucyA9IFsgJCgnI2J0bl9wYXVzZScpLCAkKCcjYnRuX3ByZXYnKSwgJCgnI2J0bl9uZXh0JykgXTtcbmNvbnN0IHNldEZsb3dDb250cm9sU3RhdGUgPSAoaXNEaXNhYmxlZCkgPT4ge1xuICBmbG93Q29udHJvbEJ0bnMuZm9yRWFjaCgkYnRuID0+ICRidG4uYXR0cignZGlzYWJsZWQnLCBpc0Rpc2FibGVkKSk7XG59O1xuXG5jb25zdCBlbmFibGVGbG93Q29udHJvbCA9ICgpID0+IHtcbiAgc2V0Rmxvd0NvbnRyb2xTdGF0ZShmYWxzZSk7XG59O1xuXG5jb25zdCBkaXNhYmxlRmxvd0NvbnRyb2wgPSAoKSA9PiB7XG4gIHNldEZsb3dDb250cm9sU3RhdGUodHJ1ZSk7XG59O1xuXG5jb25zdCByZXNldFRvcE1lbnVCdXR0b25zID0gKCkgPT4ge1xuICAkKCcudG9wLW1lbnUtYnV0dG9ucyBidXR0b24nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gIGRpc2FibGVGbG93Q29udHJvbCgpO1xufTtcblxuY29uc3Qgc2V0SW50ZXJ2YWwgPSAodmFsKSA9PiB7XG4gICQoJyNpbnRlcnZhbCcpLnZhbChpbnRlcnZhbCk7XG59O1xuXG5jb25zdCBhY3RpdmF0ZUJ0blBhdXNlID0gKCkgPT4ge1xuICAkKCcjYnRuX3BhdXNlJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xufTtcblxuY29uc3QgZGVhY3RpdmF0ZUJ0blBhdXNlID0gKCkgPT4ge1xuICAkKCcjYnRuX3BhdXNlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGVuYWJsZUZsb3dDb250cm9sLFxuICBkaXNhYmxlRmxvd0NvbnRyb2wsXG4gIHJlc2V0VG9wTWVudUJ1dHRvbnMsXG4gIHNldEludGVydmFsLFxuICBhY3RpdmF0ZUJ0blBhdXNlLFxuICBkZWFjdGl2YXRlQnRuUGF1c2Vcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaWQpIHtcbiAgY29uc3QgZWRpdG9yID0gYWNlLmVkaXQoaWQpO1xuXG4gIGVkaXRvci5zZXRPcHRpb25zKHtcbiAgICBlbmFibGVCYXNpY0F1dG9jb21wbGV0aW9uOiB0cnVlLFxuICAgIGVuYWJsZVNuaXBwZXRzOiB0cnVlLFxuICAgIGVuYWJsZUxpdmVBdXRvY29tcGxldGlvbjogdHJ1ZVxuICB9KTtcblxuICBlZGl0b3Iuc2V0VGhlbWUoJ2FjZS90aGVtZS90b21vcnJvd19uaWdodF9laWdodGllcycpO1xuICBlZGl0b3Iuc2Vzc2lvbi5zZXRNb2RlKCdhY2UvbW9kZS9qYXZhc2NyaXB0Jyk7XG4gIGVkaXRvci4kYmxvY2tTY3JvbGxpbmcgPSBJbmZpbml0eTtcblxuICByZXR1cm4gZWRpdG9yO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGV4ZWN1dGUgPSAodHJhY2VyTWFuYWdlciwgY29kZSkgPT4ge1xuICAvLyBhbGwgbW9kdWxlcyBhdmFpbGFibGUgdG8gZXZhbCBhcmUgb2J0YWluZWQgZnJvbSB3aW5kb3dcbiAgdHJ5IHtcbiAgICB0cmFjZXJNYW5hZ2VyLmRlYWxsb2NhdGVBbGwoKTtcbiAgICBldmFsKGNvZGUpO1xuICAgIHRyYWNlck1hbmFnZXIudmlzdWFsaXplKCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJhY2VyTWFuYWdlci5yZW1vdmVVbmFsbG9jYXRlZCgpO1xuICB9XG59O1xuXG5jb25zdCBleGVjdXRlRGF0YSA9ICh0cmFjZXJNYW5hZ2VyLCBhbGdvRGF0YSkgPT4ge1xuICByZXR1cm4gZXhlY3V0ZSh0cmFjZXJNYW5hZ2VyLCBhbGdvRGF0YSk7XG59O1xuXG5jb25zdCBleGVjdXRlRGF0YUFuZENvZGUgPSAodHJhY2VyTWFuYWdlciwgYWxnb0RhdGEsIGFsZ29Db2RlKSA9PiB7XG4gIHJldHVybiBleGVjdXRlKHRyYWNlck1hbmFnZXIsIGAke2FsZ29EYXRhfTske2FsZ29Db2RlfWApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGV4ZWN1dGVEYXRhLFxuICBleGVjdXRlRGF0YUFuZENvZGVcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBhcHAgPSByZXF1aXJlKCcuLi9hcHAnKTtcbmNvbnN0IGNyZWF0ZUVkaXRvciA9IHJlcXVpcmUoJy4vY3JlYXRlJyk7XG5jb25zdCBFeGVjdXRvciA9IHJlcXVpcmUoJy4vZXhlY3V0b3InKTtcblxuZnVuY3Rpb24gRWRpdG9yKHRyYWNlck1hbmFnZXIpIHtcbiAgaWYgKCF0cmFjZXJNYW5hZ2VyKSB7XG4gICAgdGhyb3cgJ0Nhbm5vdCBjcmVhdGUgRWRpdG9yLiBNaXNzaW5nIHRoZSB0cmFjZXJNYW5hZ2VyJztcbiAgfVxuXG4gIGFjZS5yZXF1aXJlKCdhY2UvZXh0L2xhbmd1YWdlX3Rvb2xzJyk7XG5cbiAgdGhpcy5kYXRhRWRpdG9yID0gY3JlYXRlRWRpdG9yKCdkYXRhJyk7XG4gIHRoaXMuY29kZUVkaXRvciA9IGNyZWF0ZUVkaXRvcignY29kZScpO1xuXG4gIC8vIFNldHRpbmcgZGF0YVxuXG4gIHRoaXMuc2V0RGF0YSA9IChkYXRhKSA9PiB7XG4gICAgdGhpcy5kYXRhRWRpdG9yLnNldFZhbHVlKGRhdGEsIC0xKTtcbiAgfTtcblxuICB0aGlzLnNldENvZGUgPSAoY29kZSkgPT4ge1xuICAgIHRoaXMuY29kZUVkaXRvci5zZXRWYWx1ZShjb2RlLCAtMSk7XG4gIH07XG5cbiAgdGhpcy5zZXRDb250ZW50ID0gKCh7XG4gICAgZGF0YSxcbiAgICBjb2RlXG4gIH0pID0+IHtcbiAgICB0aGlzLnNldERhdGEoZGF0YSk7XG4gICAgdGhpcy5zZXRDb2RlKGNvZGUpO1xuICB9KTtcblxuICAvLyBDbGVhcmluZyBkYXRhXG5cbiAgdGhpcy5jbGVhckRhdGEgPSAoKSA9PiB7XG4gICAgdGhpcy5kYXRhRWRpdG9yLnNldFZhbHVlKCcnKTtcbiAgfTtcblxuICB0aGlzLmNsZWFyQ29kZSA9ICgpID0+IHtcbiAgICB0aGlzLmNvZGVFZGl0b3Iuc2V0VmFsdWUoJycpO1xuICB9O1xuXG4gIHRoaXMuY2xlYXJDb250ZW50ID0gKCkgPT4ge1xuICAgIHRoaXMuY2xlYXJEYXRhKCk7XG4gICAgdGhpcy5jbGVhckNvZGUoKTtcbiAgfTtcblxuICB0aGlzLmV4ZWN1dGUgPSAoKSA9PiB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZGF0YUVkaXRvci5nZXRWYWx1ZSgpO1xuICAgIGNvbnN0IGNvZGUgPSB0aGlzLmNvZGVFZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICByZXR1cm4gRXhlY3V0b3IuZXhlY3V0ZURhdGFBbmRDb2RlKHRyYWNlck1hbmFnZXIsIGRhdGEsIGNvZGUpO1xuICB9O1xuXG4gIC8vIGxpc3RlbmVyc1xuXG4gIHRoaXMuZGF0YUVkaXRvci5vbignY2hhbmdlJywgKCkgPT4ge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLmRhdGFFZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICBjb25zdCBsYXN0RmlsZVVzZWQgPSBhcHAuZ2V0TGFzdEZpbGVVc2VkKCk7XG4gICAgaWYgKGxhc3RGaWxlVXNlZCkge1xuICAgICAgYXBwLnVwZGF0ZUNhY2hlZEZpbGUobGFzdEZpbGVVc2VkLCB7XG4gICAgICAgIGRhdGFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBFeGVjdXRvci5leGVjdXRlRGF0YSh0cmFjZXJNYW5hZ2VyLCBkYXRhKTtcbiAgfSk7XG5cbiAgdGhpcy5jb2RlRWRpdG9yLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgY29uc3QgY29kZSA9IHRoaXMuY29kZUVkaXRvci5nZXRWYWx1ZSgpO1xuICAgIGNvbnN0IGxhc3RGaWxlVXNlZCA9IGFwcC5nZXRMYXN0RmlsZVVzZWQoKTtcbiAgICBpZiAobGFzdEZpbGVVc2VkKSB7XG4gICAgICBhcHAudXBkYXRlQ2FjaGVkRmlsZShsYXN0RmlsZVVzZWQsIHtcbiAgICAgICAgY29kZVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yOyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUlNWUCA9IHJlcXVpcmUoJ3JzdnAnKTtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJy4vYXBwJyk7XG5jb25zdCBBcHBDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4vYXBwL2NvbnN0cnVjdG9yJyk7XG5jb25zdCBET00gPSByZXF1aXJlKCcuL2RvbScpO1xuY29uc3QgU2VydmVyID0gcmVxdWlyZSgnLi9zZXJ2ZXInKTtcblxuY29uc3QgbW9kdWxlcyA9IHJlcXVpcmUoJy4vbW9kdWxlJyk7XG5cbmNvbnN0IHtcbiAgZXh0ZW5kXG59ID0gJDtcblxuJC5hamF4U2V0dXAoe1xuICBjYWNoZTogZmFsc2UsXG4gIGRhdGFUeXBlOiAndGV4dCdcbn0pO1xuXG5jb25zdCB7XG4gIGlzU2NyYXRjaFBhcGVyXG59ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5jb25zdCB7XG4gIGdldFBhdGhcbn0gPSByZXF1aXJlKCcuL3NlcnZlci9oZWxwZXJzJyk7XG5cbi8vIHNldCBnbG9iYWwgcHJvbWlzZSBlcnJvciBoYW5kbGVyXG5SU1ZQLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgY29uc29sZS5hc3NlcnQoZmFsc2UsIHJlYXNvbik7XG59KTtcblxuJCgoKSA9PiB7XG5cbiAgLy8gaW5pdGlhbGl6ZSB0aGUgYXBwbGljYXRpb24gYW5kIGF0dGFjaCBpbiB0byB0aGUgaW5zdGFuY2UgbW9kdWxlXG4gIGNvbnN0IGFwcENvbnN0cnVjdG9yID0gbmV3IEFwcENvbnN0cnVjdG9yKCk7XG4gIGV4dGVuZCh0cnVlLCBhcHAsIGFwcENvbnN0cnVjdG9yKTtcblxuICAvLyBsb2FkIG1vZHVsZXMgdG8gdGhlIGdsb2JhbCBzY29wZSBzbyB0aGV5IGNhbiBiZSBldmFsZWRcbiAgZXh0ZW5kKHRydWUsIHdpbmRvdywgbW9kdWxlcyk7XG5cbiAgU2VydmVyLmxvYWRDYXRlZ29yaWVzKCkudGhlbigoZGF0YSkgPT4ge1xuICAgIGFwcC5zZXRDYXRlZ29yaWVzKGRhdGEpO1xuICAgIERPTS5hZGRDYXRlZ29yaWVzKCk7XG5cbiAgICAvLyBkZXRlcm1pbmUgaWYgdGhlIGFwcCBpcyBsb2FkaW5nIGEgcHJlLWV4aXN0aW5nIHNjcmF0Y2gtcGFkXG4gICAgLy8gb3IgdGhlIGhvbWUgcGFnZVxuICAgIGNvbnN0IHtcbiAgICAgIGNhdGVnb3J5LFxuICAgICAgYWxnb3JpdGhtLFxuICAgICAgZmlsZVxuICAgIH0gPSBnZXRQYXRoKCk7XG4gICAgaWYgKGlzU2NyYXRjaFBhcGVyKGNhdGVnb3J5KSkge1xuICAgICAgaWYgKGFsZ29yaXRobSkge1xuICAgICAgICBTZXJ2ZXIubG9hZFNjcmF0Y2hQYXBlcihhbGdvcml0aG0pLnRoZW4oKHtjYXRlZ29yeSwgYWxnb3JpdGhtLCBkYXRhfSkgPT4ge1xuICAgICAgICAgIERPTS5zaG93QWxnb3JpdGhtKGNhdGVnb3J5LCBhbGdvcml0aG0sIGRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFNlcnZlci5sb2FkQWxnb3JpdGhtKGNhdGVnb3J5KS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgRE9NLnNob3dBbGdvcml0aG0oY2F0ZWdvcnksIG51bGwsIGRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNhdGVnb3J5ICYmIGFsZ29yaXRobSkge1xuICAgICAgRE9NLnNob3dSZXF1ZXN0ZWRBbGdvcml0aG0oY2F0ZWdvcnksIGFsZ29yaXRobSwgZmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIERPTS5zaG93Rmlyc3RBbGdvcml0aG0oKTtcbiAgICB9XG4gIH0pO1xuXG4gIFNlcnZlci5sb2FkV2lraUxpc3QoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgRE9NLnNob3dXaWtpKCdIb21lJyk7XG4gIH0pXG59KTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IEFycmF5MkQgPSByZXF1aXJlKCcuL2FycmF5MmQnKTtcblxuY29uc3QgcmFuZG9tID0gKE4sIG1pbiwgbWF4KSA9PiB7XG4gIHJldHVybiBBcnJheTJELnJhbmRvbSgxLCBOLCBtaW4sIG1heClbMF07XG59O1xuXG5jb25zdCByYW5kb21Tb3J0ZWQgPSAoTiwgbWluLCBtYXgpPT4ge1xuICByZXR1cm4gQXJyYXkyRC5yYW5kb21Tb3J0ZWQoMSwgTiwgbWluLCBtYXgpWzBdO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJhbmRvbSxcbiAgcmFuZG9tU29ydGVkXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCByYW5kb20gPSAoTiwgTSwgbWluLCBtYXgpID0+IHtcbiAgaWYgKCFOKSBOID0gMTA7XG4gIGlmICghTSkgTSA9IDEwO1xuICBpZiAobWluID09PSB1bmRlZmluZWQpIG1pbiA9IDE7XG4gIGlmIChtYXggPT09IHVuZGVmaW5lZCkgbWF4ID0gOTtcbiAgdmFyIEQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBOOyBpKyspIHtcbiAgICBELnB1c2goW10pO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgTTsgaisrKSB7XG4gICAgICBEW2ldLnB1c2goKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgfCAwKSArIG1pbik7XG4gICAgfVxuICB9XG4gIHJldHVybiBEO1xufTtcblxuY29uc3QgcmFuZG9tU29ydGVkID0gKE4sIE0sIG1pbiwgbWF4KSA9PiB7XG4gIHJldHVybiByYW5kb20oTiwgTSwgbWluLCBtYXgpLm1hcChmdW5jdGlvbiAoYXJyKSB7XG4gICAgcmV0dXJuIGFyci5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYSAtIGI7XG4gICAgfSk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJhbmRvbSxcbiAgcmFuZG9tU29ydGVkXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCByYW5kb20gPSAoTiwgbWluLCBtYXgpID0+IHtcbiAgaWYgKCFOKSBOID0gNztcbiAgaWYgKCFtaW4pIG1pbiA9IDE7XG4gIGlmICghbWF4KSBtYXggPSAxMDtcbiAgdmFyIEMgPSBuZXcgQXJyYXkoTik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgTjsgaSsrKSBDW2ldID0gbmV3IEFycmF5KDIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKylcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IENbaV0ubGVuZ3RoOyBqKyspXG4gICAgICBDW2ldW2pdID0gKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgfCAwKSArIG1pbjtcbiAgcmV0dXJuIEM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmFuZG9tXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCByYW5kb20gPSAoTiwgcmF0aW8pID0+IHtcbiAgaWYgKCFOKSBOID0gNTtcbiAgaWYgKCFyYXRpbykgcmF0aW8gPSAuMztcbiAgdmFyIEcgPSBuZXcgQXJyYXkoTik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgTjsgaSsrKSB7XG4gICAgR1tpXSA9IG5ldyBBcnJheShOKTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IE47IGorKykge1xuICAgICAgaWYgKGkgIT0gaikge1xuICAgICAgICBHW2ldW2pdID0gKE1hdGgucmFuZG9tKCkgKiAoMSAvIHJhdGlvKSB8IDApID09IDAgPyAxIDogMDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIEc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmFuZG9tXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBBcnJheTFEID0gcmVxdWlyZSgnLi9hcnJheTFkJyk7XG5jb25zdCBBcnJheTJEID0gcmVxdWlyZSgnLi9hcnJheTJkJyk7XG5jb25zdCBDb29yZGluYXRlU3lzdGVtID0gcmVxdWlyZSgnLi9jb29yZGluYXRlX3N5c3RlbScpO1xuY29uc3QgRGlyZWN0ZWRHcmFwaCA9IHJlcXVpcmUoJy4vZGlyZWN0ZWRfZ3JhcGgnKTtcbmNvbnN0IFVuZGlyZWN0ZWRHcmFwaCA9IHJlcXVpcmUoJy4vdW5kaXJlY3RlZF9ncmFwaCcpO1xuY29uc3QgV2VpZ2h0ZWREaXJlY3RlZEdyYXBoID0gcmVxdWlyZSgnLi93ZWlnaHRlZF9kaXJlY3RlZF9ncmFwaCcpO1xuY29uc3QgV2VpZ2h0ZWRVbmRpcmVjdGVkR3JhcGggPSByZXF1aXJlKCcuL3dlaWdodGVkX3VuZGlyZWN0ZWRfZ3JhcGgnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEFycmF5MUQsXG4gIEFycmF5MkQsXG4gIENvb3JkaW5hdGVTeXN0ZW0sXG4gIERpcmVjdGVkR3JhcGgsXG4gIFVuZGlyZWN0ZWRHcmFwaCxcbiAgV2VpZ2h0ZWREaXJlY3RlZEdyYXBoLFxuICBXZWlnaHRlZFVuZGlyZWN0ZWRHcmFwaFxufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHJhbmRvbSA9IChOLCByYXRpbykgPT4ge1xuICBpZiAoIU4pIE4gPSA1O1xuICBpZiAoIXJhdGlvKSByYXRpbyA9IC4zO1xuICB2YXIgRyA9IG5ldyBBcnJheShOKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBOOyBpKyspIEdbaV0gPSBuZXcgQXJyYXkoTik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgTjsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBOOyBqKyspIHtcbiAgICAgIGlmIChpID4gaikge1xuICAgICAgICBHW2ldW2pdID0gR1tqXVtpXSA9IChNYXRoLnJhbmRvbSgpICogKDEgLyByYXRpbykgfCAwKSA9PSAwID8gMSA6IDA7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBHO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJhbmRvbVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcmFuZG9tID0gKE4sIHJhdGlvLCBtaW4sIG1heCkgPT4ge1xuICBpZiAoIU4pIE4gPSA1O1xuICBpZiAoIXJhdGlvKSByYXRpbyA9IC4zO1xuICBpZiAoIW1pbikgbWluID0gMTtcbiAgaWYgKCFtYXgpIG1heCA9IDU7XG4gIHZhciBHID0gbmV3IEFycmF5KE4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKykge1xuICAgIEdbaV0gPSBuZXcgQXJyYXkoTik7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBOOyBqKyspIHtcbiAgICAgIGlmIChpICE9IGogJiYgKE1hdGgucmFuZG9tKCkgKiAoMSAvIHJhdGlvKSB8IDApID09IDApIHtcbiAgICAgICAgR1tpXVtqXSA9IChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpIHwgMCkgKyBtaW47XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBHO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJhbmRvbVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcmFuZG9tID0gKE4sIHJhdGlvLCBtaW4sIG1heCkgPT4ge1xuICBpZiAoIU4pIE4gPSA1O1xuICBpZiAoIXJhdGlvKSByYXRpbyA9IC4zO1xuICBpZiAoIW1pbikgbWluID0gMTtcbiAgaWYgKCFtYXgpIG1heCA9IDU7XG4gIHZhciBHID0gbmV3IEFycmF5KE4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKykgR1tpXSA9IG5ldyBBcnJheShOKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBOOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IE47IGorKykge1xuICAgICAgaWYgKGkgPiBqICYmIChNYXRoLnJhbmRvbSgpICogKDEgLyByYXRpbykgfCAwKSA9PSAwKSB7XG4gICAgICAgIEdbaV1bal0gPSBHW2pdW2ldID0gKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgfCAwKSArIG1pbjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIEc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmFuZG9tXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdHJhY2VycyA9IHJlcXVpcmUoJy4vdHJhY2VyJyk7XG52YXIgZGF0YXMgPSByZXF1aXJlKCcuL2RhdGEnKTtcblxuY29uc3Qge1xuICBleHRlbmRcbn0gPSAkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4dGVuZCh0cnVlLCB7fSwgdHJhY2VycywgZGF0YXMpOyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgQXJyYXkyRFRyYWNlciA9IHJlcXVpcmUoJy4vYXJyYXkyZCcpO1xuXG5jbGFzcyBBcnJheTFEVHJhY2VyIGV4dGVuZHMgQXJyYXkyRFRyYWNlciB7XG4gIHN0YXRpYyBnZXRDbGFzc05hbWUoKSB7XG4gICAgcmV0dXJuICdBcnJheTFEVHJhY2VyJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICBzdXBlcihuYW1lKTtcbiAgfVxuXG4gIF9ub3RpZnkoaWR4LCB2KSB7XG4gICAgc3VwZXIuX25vdGlmeSgwLCBpZHgsIHYpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlbm90aWZ5KGlkeCkge1xuICAgIHN1cGVyLl9kZW5vdGlmeSgwLCBpZHgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX3NlbGVjdChzLCBlKSB7XG4gICAgaWYgKGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgc3VwZXIuX3NlbGVjdCgwLCBzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIuX3NlbGVjdFJvdygwLCBzLCBlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzZWxlY3QocywgZSkge1xuICAgIGlmIChlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHN1cGVyLl9kZXNlbGVjdCgwLCBzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIuX2Rlc2VsZWN0Um93KDAsIHMsIGUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldERhdGEoRCkge1xuICAgIHJldHVybiBzdXBlci5zZXREYXRhKFtEXSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBcnJheTFEVHJhY2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBUcmFjZXIgPSByZXF1aXJlKCcuL3RyYWNlcicpO1xuXG5jb25zdCB7XG4gIHJlZmluZUJ5VHlwZVxufSA9IHJlcXVpcmUoJy4uLy4uL3RyYWNlcl9tYW5hZ2VyL3V0aWwvaW5kZXgnKTtcblxuY2xhc3MgQXJyYXkyRFRyYWNlciBleHRlbmRzIFRyYWNlciB7XG4gIHN0YXRpYyBnZXRDbGFzc05hbWUoKSB7XG4gICAgcmV0dXJuICdBcnJheTJEVHJhY2VyJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICBzdXBlcihuYW1lKTtcblxuICAgIHRoaXMuY29sb3JDbGFzcyA9IHtcbiAgICAgIHNlbGVjdGVkOiAnc2VsZWN0ZWQnLFxuICAgICAgbm90aWZpZWQ6ICdub3RpZmllZCdcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuaXNOZXcpIGluaXRWaWV3KHRoaXMpO1xuICB9XG5cbiAgX25vdGlmeSh4LCB5LCB2KSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ25vdGlmeScsXG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHY6IHZcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9kZW5vdGlmeSh4LCB5KSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ2Rlbm90aWZ5JyxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfc2VsZWN0KHN4LCBzeSwgZXgsIGV5KSB7XG4gICAgdGhpcy5wdXNoU2VsZWN0aW5nU3RlcCgnc2VsZWN0JywgbnVsbCwgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9zZWxlY3RSb3coeCwgc3ksIGV5KSB7XG4gICAgdGhpcy5wdXNoU2VsZWN0aW5nU3RlcCgnc2VsZWN0JywgJ3JvdycsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfc2VsZWN0Q29sKHksIHN4LCBleCkge1xuICAgIHRoaXMucHVzaFNlbGVjdGluZ1N0ZXAoJ3NlbGVjdCcsICdjb2wnLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlc2VsZWN0KHN4LCBzeSwgZXgsIGV5KSB7XG4gICAgdGhpcy5wdXNoU2VsZWN0aW5nU3RlcCgnZGVzZWxlY3QnLCBudWxsLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlc2VsZWN0Um93KHgsIHN5LCBleSkge1xuICAgIHRoaXMucHVzaFNlbGVjdGluZ1N0ZXAoJ2Rlc2VsZWN0JywgJ3JvdycsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzZWxlY3RDb2woeSwgc3gsIGV4KSB7XG4gICAgdGhpcy5wdXNoU2VsZWN0aW5nU3RlcCgnZGVzZWxlY3QnLCAnY29sJywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9zZXBhcmF0ZSh4LCB5KSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ3NlcGFyYXRlJyxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfc2VwYXJhdGVSb3coeCkge1xuICAgIHRoaXMuX3NlcGFyYXRlKHgsIC0xKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9zZXBhcmF0ZUNvbCh5KSB7XG4gICAgdGhpcy5fc2VwYXJhdGUoLTEsIHkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlc2VwYXJhdGUoeCwgeSkge1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHtcbiAgICAgIHR5cGU6ICdkZXNlcGFyYXRlJyxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzZXBhcmF0ZVJvdyh4KSB7XG4gICAgdGhpcy5fZGVzZXBhcmF0ZSh4LCAtMSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzZXBhcmF0ZUNvbCh5KSB7XG4gICAgdGhpcy5fZGVzZXBhcmF0ZSgtMSwgeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdXNoU2VsZWN0aW5nU3RlcCgpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgdmFyIHR5cGUgPSBhcmdzLnNoaWZ0KCk7XG4gICAgdmFyIG1vZGUgPSBhcmdzLnNoaWZ0KCk7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3Muc2hpZnQoKSk7XG4gICAgdmFyIGNvb3JkO1xuICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgY2FzZSAncm93JzpcbiAgICAgICAgY29vcmQgPSB7XG4gICAgICAgICAgeDogYXJnc1swXSxcbiAgICAgICAgICBzeTogYXJnc1sxXSxcbiAgICAgICAgICBleTogYXJnc1syXVxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbCc6XG4gICAgICAgIGNvb3JkID0ge1xuICAgICAgICAgIHk6IGFyZ3NbMF0sXG4gICAgICAgICAgc3g6IGFyZ3NbMV0sXG4gICAgICAgICAgZXg6IGFyZ3NbMl1cbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoYXJnc1syXSA9PT0gdW5kZWZpbmVkICYmIGFyZ3NbM10gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvb3JkID0ge1xuICAgICAgICAgICAgeDogYXJnc1swXSxcbiAgICAgICAgICAgIHk6IGFyZ3NbMV1cbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvb3JkID0ge1xuICAgICAgICAgICAgc3g6IGFyZ3NbMF0sXG4gICAgICAgICAgICBzeTogYXJnc1sxXSxcbiAgICAgICAgICAgIGV4OiBhcmdzWzJdLFxuICAgICAgICAgICAgZXk6IGFyZ3NbM11cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBzdGVwID0ge1xuICAgICAgdHlwZTogdHlwZVxuICAgIH07XG4gICAgJC5leHRlbmQoc3RlcCwgY29vcmQpO1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHN0ZXApO1xuICB9XG5cbiAgcHJvY2Vzc1N0ZXAoc3RlcCwgb3B0aW9ucykge1xuICAgIHN3aXRjaCAoc3RlcC50eXBlKSB7XG4gICAgICBjYXNlICdub3RpZnknOlxuICAgICAgICBpZiAoc3RlcC52ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB2YXIgJHJvdyA9IHRoaXMuJHRhYmxlLmZpbmQoJy5tdGJsLXJvdycpLmVxKHN0ZXAueCk7XG4gICAgICAgICAgdmFyICRjb2wgPSAkcm93LmZpbmQoJy5tdGJsLWNvbCcpLmVxKHN0ZXAueSk7XG4gICAgICAgICAgJGNvbC50ZXh0KHJlZmluZUJ5VHlwZShzdGVwLnYpKTtcbiAgICAgICAgfVxuICAgICAgY2FzZSAnZGVub3RpZnknOlxuICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGNhc2UgJ2Rlc2VsZWN0JzpcbiAgICAgICAgdmFyIGNvbG9yQ2xhc3MgPSBzdGVwLnR5cGUgPT0gJ3NlbGVjdCcgfHwgc3RlcC50eXBlID09ICdkZXNlbGVjdCcgPyB0aGlzLmNvbG9yQ2xhc3Muc2VsZWN0ZWQgOiB0aGlzLmNvbG9yQ2xhc3Mubm90aWZpZWQ7XG4gICAgICAgIHZhciBhZGRDbGFzcyA9IHN0ZXAudHlwZSA9PSAnc2VsZWN0JyB8fCBzdGVwLnR5cGUgPT0gJ25vdGlmeSc7XG4gICAgICAgIHZhciBzeCA9IHN0ZXAuc3g7XG4gICAgICAgIHZhciBzeSA9IHN0ZXAuc3k7XG4gICAgICAgIHZhciBleCA9IHN0ZXAuZXg7XG4gICAgICAgIHZhciBleSA9IHN0ZXAuZXk7XG4gICAgICAgIGlmIChzeCA9PT0gdW5kZWZpbmVkKSBzeCA9IHN0ZXAueDtcbiAgICAgICAgaWYgKHN5ID09PSB1bmRlZmluZWQpIHN5ID0gc3RlcC55O1xuICAgICAgICBpZiAoZXggPT09IHVuZGVmaW5lZCkgZXggPSBzdGVwLng7XG4gICAgICAgIGlmIChleSA9PT0gdW5kZWZpbmVkKSBleSA9IHN0ZXAueTtcbiAgICAgICAgdGhpcy5wYWludENvbG9yKHN4LCBzeSwgZXgsIGV5LCBjb2xvckNsYXNzLCBhZGRDbGFzcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2VwYXJhdGUnOlxuICAgICAgICB0aGlzLmRlc2VwYXJhdGUoc3RlcC54LCBzdGVwLnkpO1xuICAgICAgICB0aGlzLnNlcGFyYXRlKHN0ZXAueCwgc3RlcC55KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkZXNlcGFyYXRlJzpcbiAgICAgICAgdGhpcy5kZXNlcGFyYXRlKHN0ZXAueCwgc3RlcC55KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzdXBlci5wcm9jZXNzU3RlcChzdGVwLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICBzZXREYXRhKEQpIHtcbiAgICB0aGlzLnZpZXdYID0gdGhpcy52aWV3WSA9IDA7XG4gICAgdGhpcy5wYWRkaW5nSCA9IDY7XG4gICAgdGhpcy5wYWRkaW5nViA9IDM7XG4gICAgdGhpcy5mb250U2l6ZSA9IDE2O1xuXG4gICAgaWYgKHN1cGVyLnNldERhdGEuYXBwbHkodGhpcywgYXJndW1lbnRzKSkge1xuICAgICAgdGhpcy4kdGFibGUuZmluZCgnLm10Ymwtcm93JykuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5tdGJsLWNvbCcpLmVhY2goZnVuY3Rpb24gKGopIHtcbiAgICAgICAgICAkKHRoaXMpLnRleHQocmVmaW5lQnlUeXBlKERbaV1bal0pKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuJHRhYmxlLmVtcHR5KCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBELmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgJHJvdyA9ICQoJzxkaXYgY2xhc3M9XCJtdGJsLXJvd1wiPicpO1xuICAgICAgdGhpcy4kdGFibGUuYXBwZW5kKCRyb3cpO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBEW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciAkY29sID0gJCgnPGRpdiBjbGFzcz1cIm10YmwtY29sXCI+JylcbiAgICAgICAgICAuY3NzKHRoaXMuZ2V0Q2VsbENzcygpKVxuICAgICAgICAgIC50ZXh0KHJlZmluZUJ5VHlwZShEW2ldW2pdKSk7XG4gICAgICAgICRyb3cuYXBwZW5kKCRjb2wpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlc2l6ZSgpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmVzaXplKCkge1xuICAgIHN1cGVyLnJlc2l6ZSgpO1xuXG4gICAgdGhpcy5yZWZyZXNoKCk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBzdXBlci5jbGVhcigpO1xuXG4gICAgdGhpcy5jbGVhckNvbG9yKCk7XG4gICAgdGhpcy5kZXNlcGFyYXRlQWxsKCk7XG4gIH1cblxuICBnZXRDZWxsQ3NzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwYWRkaW5nOiB0aGlzLnBhZGRpbmdWLnRvRml4ZWQoMSkgKyAncHggJyArIHRoaXMucGFkZGluZ0gudG9GaXhlZCgxKSArICdweCcsXG4gICAgICAnZm9udC1zaXplJzogdGhpcy5mb250U2l6ZS50b0ZpeGVkKDEpICsgJ3B4J1xuICAgIH07XG4gIH1cblxuICByZWZyZXNoKCkge1xuICAgIHN1cGVyLnJlZnJlc2goKTtcblxuICAgIHZhciAkcGFyZW50ID0gdGhpcy4kdGFibGUucGFyZW50KCk7XG4gICAgdmFyIHRvcCA9ICRwYXJlbnQuaGVpZ2h0KCkgLyAyIC0gdGhpcy4kdGFibGUuaGVpZ2h0KCkgLyAyICsgdGhpcy52aWV3WTtcbiAgICB2YXIgbGVmdCA9ICRwYXJlbnQud2lkdGgoKSAvIDIgLSB0aGlzLiR0YWJsZS53aWR0aCgpIC8gMiArIHRoaXMudmlld1g7XG4gICAgdGhpcy4kdGFibGUuY3NzKCdtYXJnaW4tdG9wJywgdG9wKTtcbiAgICB0aGlzLiR0YWJsZS5jc3MoJ21hcmdpbi1sZWZ0JywgbGVmdCk7XG4gIH1cblxuICBtb3VzZWRvd24oZSkge1xuICAgIHN1cGVyLm1vdXNlZG93bihlKTtcblxuICAgIHRoaXMuZHJhZ1ggPSBlLnBhZ2VYO1xuICAgIHRoaXMuZHJhZ1kgPSBlLnBhZ2VZO1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICB9XG5cbiAgbW91c2Vtb3ZlKGUpIHtcbiAgICBzdXBlci5tb3VzZW1vdmUoZSk7XG5cbiAgICBpZiAodGhpcy5kcmFnZ2luZykge1xuICAgICAgdGhpcy52aWV3WCArPSBlLnBhZ2VYIC0gdGhpcy5kcmFnWDtcbiAgICAgIHRoaXMudmlld1kgKz0gZS5wYWdlWSAtIHRoaXMuZHJhZ1k7XG4gICAgICB0aGlzLmRyYWdYID0gZS5wYWdlWDtcbiAgICAgIHRoaXMuZHJhZ1kgPSBlLnBhZ2VZO1xuICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuICB9XG5cbiAgbW91c2V1cChlKSB7XG4gICAgc3VwZXIubW91c2V1cChlKTtcblxuICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIG1vdXNld2hlZWwoZSkge1xuICAgIHN1cGVyLm1vdXNld2hlZWwoZSk7XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZSA9IGUub3JpZ2luYWxFdmVudDtcbiAgICB2YXIgZGVsdGEgPSAoZS53aGVlbERlbHRhICE9PSB1bmRlZmluZWQgJiYgZS53aGVlbERlbHRhKSB8fFxuICAgICAgKGUuZGV0YWlsICE9PSB1bmRlZmluZWQgJiYgLWUuZGV0YWlsKTtcbiAgICB2YXIgd2VpZ2h0ID0gMS4wMTtcbiAgICB2YXIgcmF0aW8gPSBkZWx0YSA+IDAgPyAxIC8gd2VpZ2h0IDogd2VpZ2h0O1xuICAgIGlmICh0aGlzLmZvbnRTaXplIDwgNCAmJiByYXRpbyA8IDEpIHJldHVybjtcbiAgICBpZiAodGhpcy5mb250U2l6ZSA+IDQwICYmIHJhdGlvID4gMSkgcmV0dXJuO1xuICAgIHRoaXMucGFkZGluZ1YgKj0gcmF0aW87XG4gICAgdGhpcy5wYWRkaW5nSCAqPSByYXRpbztcbiAgICB0aGlzLmZvbnRTaXplICo9IHJhdGlvO1xuICAgIHRoaXMuJHRhYmxlLmZpbmQoJy5tdGJsLWNvbCcpLmNzcyh0aGlzLmdldENlbGxDc3MoKSk7XG4gICAgdGhpcy5yZWZyZXNoKCk7XG4gIH1cblxuICBwYWludENvbG9yKHN4LCBzeSwgZXgsIGV5LCBjb2xvckNsYXNzLCBhZGRDbGFzcykge1xuICAgIGZvciAodmFyIGkgPSBzeDsgaSA8PSBleDsgaSsrKSB7XG4gICAgICB2YXIgJHJvdyA9IHRoaXMuJHRhYmxlLmZpbmQoJy5tdGJsLXJvdycpLmVxKGkpO1xuICAgICAgZm9yICh2YXIgaiA9IHN5OyBqIDw9IGV5OyBqKyspIHtcbiAgICAgICAgdmFyICRjb2wgPSAkcm93LmZpbmQoJy5tdGJsLWNvbCcpLmVxKGopO1xuICAgICAgICBpZiAoYWRkQ2xhc3MpICRjb2wuYWRkQ2xhc3MoY29sb3JDbGFzcyk7XG4gICAgICAgIGVsc2UgJGNvbC5yZW1vdmVDbGFzcyhjb2xvckNsYXNzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjbGVhckNvbG9yKCkge1xuICAgIHRoaXMuJHRhYmxlLmZpbmQoJy5tdGJsLWNvbCcpLnJlbW92ZUNsYXNzKE9iamVjdC5rZXlzKHRoaXMuY29sb3JDbGFzcykuam9pbignICcpKTtcbiAgfVxuXG4gIHNlcGFyYXRlKHgsIHkpIHtcbiAgICB0aGlzLiR0YWJsZS5maW5kKCcubXRibC1yb3cnKS5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICB2YXIgJHJvdyA9ICQodGhpcyk7XG4gICAgICBpZiAoaSA9PSB4KSB7XG4gICAgICAgICRyb3cuYWZ0ZXIoJCgnPGRpdiBjbGFzcz1cIm10YmwtZW1wdHktcm93XCI+JykuYXR0cignZGF0YS1yb3cnLCBpKSlcbiAgICAgIH1cbiAgICAgICRyb3cuZmluZCgnLm10YmwtY29sJykuZWFjaChmdW5jdGlvbiAoaikge1xuICAgICAgICB2YXIgJGNvbCA9ICQodGhpcyk7XG4gICAgICAgIGlmIChqID09IHkpIHtcbiAgICAgICAgICAkY29sLmFmdGVyKCQoJzxkaXYgY2xhc3M9XCJtdGJsLWVtcHR5LWNvbFwiPicpLmF0dHIoJ2RhdGEtY29sJywgaikpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlc2VwYXJhdGUoeCwgeSkge1xuICAgIHRoaXMuJHRhYmxlLmZpbmQoJ1tkYXRhLXJvdz0nICsgeCArICddJykucmVtb3ZlKCk7XG4gICAgdGhpcy4kdGFibGUuZmluZCgnW2RhdGEtY29sPScgKyB5ICsgJ10nKS5yZW1vdmUoKTtcbiAgfVxuXG4gIGRlc2VwYXJhdGVBbGwoKSB7XG4gICAgdGhpcy4kdGFibGUuZmluZCgnLm10YmwtZW1wdHktcm93LCAubXRibC1lbXB0eS1jb2wnKS5yZW1vdmUoKTtcbiAgfVxufVxuXG5jb25zdCBpbml0VmlldyA9ICh0cmFjZXIpID0+IHtcbiAgdHJhY2VyLiR0YWJsZSA9IHRyYWNlci5jYXBzdWxlLiR0YWJsZSA9ICQoJzxkaXYgY2xhc3M9XCJtdGJsLXRhYmxlXCI+Jyk7XG4gIHRyYWNlci4kY29udGFpbmVyLmFwcGVuZCh0cmFjZXIuJHRhYmxlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXkyRFRyYWNlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgVHJhY2VyID0gcmVxdWlyZSgnLi90cmFjZXInKTtcblxuY2xhc3MgQ2hhcnRUcmFjZXIgZXh0ZW5kcyBUcmFjZXIge1xuICBzdGF0aWMgZ2V0Q2xhc3NOYW1lKCkge1xuICAgIHJldHVybiAnQ2hhcnRUcmFjZXInO1xuICB9XG5cbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHN1cGVyKG5hbWUpO1xuXG4gICAgdGhpcy5jb2xvciA9IHtcbiAgICAgIHNlbGVjdGVkOiAncmdiYSgyNTUsIDAsIDAsIDEpJyxcbiAgICAgIG5vdGlmaWVkOiAncmdiYSgwLCAwLCAyNTUsIDEpJyxcbiAgICAgIGRlZmF1bHQ6ICdyZ2JhKDEzNiwgMTM2LCAxMzYsIDEpJ1xuICAgIH07XG5cbiAgICBpZiAodGhpcy5pc05ldykgaW5pdFZpZXcodGhpcyk7XG4gIH1cblxuICBzZXREYXRhKEMpIHtcbiAgICBpZiAoc3VwZXIuc2V0RGF0YS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSByZXR1cm4gdHJ1ZTtcblxuICAgIHZhciBjb2xvciA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQy5sZW5ndGg7IGkrKykgY29sb3IucHVzaCh0aGlzLmNvbG9yLmRlZmF1bHQpO1xuICAgIHRoaXMuY2hhcnQuY29uZmlnLmRhdGEgPSB7XG4gICAgICBsYWJlbHM6IEMubWFwKFN0cmluZyksXG4gICAgICBkYXRhc2V0czogW3tcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvcixcbiAgICAgICAgZGF0YTogQ1xuICAgICAgfV1cbiAgICB9O1xuICAgIHRoaXMuY2hhcnQudXBkYXRlKCk7XG4gIH1cblxuICBfbm90aWZ5KHMsIHYpIHtcbiAgICB0aGlzLm1hbmFnZXIucHVzaFN0ZXAodGhpcy5jYXBzdWxlLCB7XG4gICAgICB0eXBlOiAnbm90aWZ5JyxcbiAgICAgIHM6IHMsXG4gICAgICB2OiB2XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVub3RpZnkocykge1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHtcbiAgICAgIHR5cGU6ICdkZW5vdGlmeScsXG4gICAgICBzOiBzXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfc2VsZWN0KHMsIGUpIHtcbiAgICB0aGlzLm1hbmFnZXIucHVzaFN0ZXAodGhpcy5jYXBzdWxlLCB7XG4gICAgICB0eXBlOiAnc2VsZWN0JyxcbiAgICAgIHM6IHMsXG4gICAgICBlOiBlXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzZWxlY3QocywgZSkge1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHtcbiAgICAgIHR5cGU6ICdkZXNlbGVjdCcsXG4gICAgICBzOiBzLFxuICAgICAgZTogZVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHJvY2Vzc1N0ZXAoc3RlcCwgb3B0aW9ucykge1xuICAgIHN3aXRjaCAoc3RlcC50eXBlKSB7XG4gICAgICBjYXNlICdub3RpZnknOlxuICAgICAgICBpZiAoc3RlcC52ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLmNoYXJ0LmNvbmZpZy5kYXRhLmRhdGFzZXRzWzBdLmRhdGFbc3RlcC5zXSA9IHN0ZXAudjtcbiAgICAgICAgICB0aGlzLmNoYXJ0LmNvbmZpZy5kYXRhLmxhYmVsc1tzdGVwLnNdID0gc3RlcC52LnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgIGNhc2UgJ2Rlbm90aWZ5JzpcbiAgICAgIGNhc2UgJ2Rlc2VsZWN0JzpcbiAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICAgIGxldCBjb2xvciA9IHN0ZXAudHlwZSA9PSAnbm90aWZ5JyA/IHRoaXMuY29sb3Iubm90aWZpZWQgOiBzdGVwLnR5cGUgPT0gJ3NlbGVjdCcgPyB0aGlzLmNvbG9yLnNlbGVjdGVkIDogdGhpcy5jb2xvci5kZWZhdWx0O1xuICAgICAgICBpZiAoc3RlcC5lICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgZm9yICh2YXIgaSA9IHN0ZXAuczsgaSA8PSBzdGVwLmU7IGkrKylcbiAgICAgICAgICAgIHRoaXMuY2hhcnQuY29uZmlnLmRhdGEuZGF0YXNldHNbMF0uYmFja2dyb3VuZENvbG9yW2ldID0gY29sb3I7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0aGlzLmNoYXJ0LmNvbmZpZy5kYXRhLmRhdGFzZXRzWzBdLmJhY2tncm91bmRDb2xvcltzdGVwLnNdID0gY29sb3I7XG4gICAgICAgIHRoaXMuY2hhcnQudXBkYXRlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc3VwZXIucHJvY2Vzc1N0ZXAoc3RlcCwgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgcmVzaXplKCkge1xuICAgIHN1cGVyLnJlc2l6ZSgpO1xuXG4gICAgdGhpcy5jaGFydC5yZXNpemUoKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHN1cGVyLmNsZWFyKCk7XG5cbiAgICBjb25zdCBkYXRhID0gdGhpcy5jaGFydC5jb25maWcuZGF0YTtcbiAgICBpZiAoZGF0YS5kYXRhc2V0cy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGJhY2tncm91bmRDb2xvciA9IGRhdGEuZGF0YXNldHNbMF0uYmFja2dyb3VuZENvbG9yO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYWNrZ3JvdW5kQ29sb3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYmFja2dyb3VuZENvbG9yW2ldID0gdGhpcy5jb2xvci5kZWZhdWx0O1xuICAgICAgfVxuICAgICAgdGhpcy5jaGFydC51cGRhdGUoKTtcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgaW5pdFZpZXcgPSAodHJhY2VyKSA9PiB7XG4gIHRyYWNlci4kd3JhcHBlciA9IHRyYWNlci5jYXBzdWxlLiR3cmFwcGVyID0gJCgnPGNhbnZhcyBjbGFzcz1cIm1jaHJ0LWNoYXJ0XCI+Jyk7XG4gIHRyYWNlci4kY29udGFpbmVyLmFwcGVuZCh0cmFjZXIuJHdyYXBwZXIpO1xuICB0cmFjZXIuY2hhcnQgPSB0cmFjZXIuY2Fwc3VsZS5jaGFydCA9IG5ldyBDaGFydCh0cmFjZXIuJHdyYXBwZXIsIHtcbiAgICB0eXBlOiAnYmFyJyxcbiAgICBkYXRhOiB7XG4gICAgICBsYWJlbHM6IFtdLFxuICAgICAgZGF0YXNldHM6IFtdXG4gICAgfSxcbiAgICBvcHRpb25zOiB7XG4gICAgICBzY2FsZXM6IHtcbiAgICAgICAgeUF4ZXM6IFt7XG4gICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgIGJlZ2luQXRaZXJvOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9XVxuICAgICAgfSxcbiAgICAgIGFuaW1hdGlvbjogZmFsc2UsXG4gICAgICBsZWdlbmQ6IGZhbHNlLFxuICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcbiAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlXG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhcnRUcmFjZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IERpcmVjdGVkR3JhcGhUcmFjZXIgPSByZXF1aXJlKCcuL2RpcmVjdGVkX2dyYXBoJyk7XG5cbmNsYXNzIENvb3JkaW5hdGVTeXN0ZW1UcmFjZXIgZXh0ZW5kcyBEaXJlY3RlZEdyYXBoVHJhY2VyIHtcbiAgc3RhdGljIGdldENsYXNzTmFtZSgpIHtcbiAgICByZXR1cm4gJ0Nvb3JkaW5hdGVTeXN0ZW1UcmFjZXInO1xuICB9XG5cbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHN1cGVyKG5hbWUpO1xuXG4gICAgaWYgKHRoaXMuaXNOZXcpIGluaXRWaWV3KHRoaXMpO1xuICB9XG5cbiAgc2V0RGF0YShDKSB7XG4gICAgaWYgKFRyYWNlci5wcm90b3R5cGUuc2V0RGF0YS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSByZXR1cm4gdHJ1ZTtcblxuICAgIHRoaXMuZ3JhcGguY2xlYXIoKTtcbiAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICB2YXIgZWRnZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IEMubGVuZ3RoOyBpKyspXG4gICAgICBub2Rlcy5wdXNoKHtcbiAgICAgICAgaWQ6IHRoaXMubihpKSxcbiAgICAgICAgeDogQ1tpXVswXSxcbiAgICAgICAgeTogQ1tpXVsxXSxcbiAgICAgICAgbGFiZWw6ICcnICsgaSxcbiAgICAgICAgc2l6ZTogMSxcbiAgICAgICAgY29sb3I6IHRoaXMuY29sb3IuZGVmYXVsdFxuICAgICAgfSk7XG4gICAgdGhpcy5ncmFwaC5yZWFkKHtcbiAgICAgIG5vZGVzOiBub2RlcyxcbiAgICAgIGVkZ2VzOiBlZGdlc1xuICAgIH0pO1xuICAgIHRoaXMucy5jYW1lcmEuZ29Ubyh7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIGFuZ2xlOiAwLFxuICAgICAgcmF0aW86IDFcbiAgICB9KTtcbiAgICB0aGlzLnJlZnJlc2goKTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByb2Nlc3NTdGVwKHN0ZXAsIG9wdGlvbnMpIHtcbiAgICBzd2l0Y2ggKHN0ZXAudHlwZSkge1xuICAgICAgY2FzZSAndmlzaXQnOlxuICAgICAgY2FzZSAnbGVhdmUnOlxuICAgICAgICB2YXIgdmlzaXQgPSBzdGVwLnR5cGUgPT0gJ3Zpc2l0JztcbiAgICAgICAgdmFyIHRhcmdldE5vZGUgPSB0aGlzLmdyYXBoLm5vZGVzKHRoaXMubihzdGVwLnRhcmdldCkpO1xuICAgICAgICB2YXIgY29sb3IgPSB2aXNpdCA/IHRoaXMuY29sb3IudmlzaXRlZCA6IHRoaXMuY29sb3IubGVmdDtcbiAgICAgICAgdGFyZ2V0Tm9kZS5jb2xvciA9IGNvbG9yO1xuICAgICAgICBpZiAoc3RlcC5zb3VyY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHZhciBlZGdlSWQgPSB0aGlzLmUoc3RlcC5zb3VyY2UsIHN0ZXAudGFyZ2V0KTtcbiAgICAgICAgICBpZiAodGhpcy5ncmFwaC5lZGdlcyhlZGdlSWQpKSB7XG4gICAgICAgICAgICB2YXIgZWRnZSA9IHRoaXMuZ3JhcGguZWRnZXMoZWRnZUlkKTtcbiAgICAgICAgICAgIGVkZ2UuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGguZHJvcEVkZ2UoZWRnZUlkKS5hZGRFZGdlKGVkZ2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoLmFkZEVkZ2Uoe1xuICAgICAgICAgICAgICBpZDogdGhpcy5lKHN0ZXAudGFyZ2V0LCBzdGVwLnNvdXJjZSksXG4gICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5uKHN0ZXAuc291cmNlKSxcbiAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLm4oc3RlcC50YXJnZXQpLFxuICAgICAgICAgICAgICBjb2xvcjogY29sb3IsXG4gICAgICAgICAgICAgIHNpemU6IDFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5sb2dUcmFjZXIpIHtcbiAgICAgICAgICB2YXIgc291cmNlID0gc3RlcC5zb3VyY2U7XG4gICAgICAgICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSBzb3VyY2UgPSAnJztcbiAgICAgICAgICB0aGlzLmxvZ1RyYWNlci5wcmludCh2aXNpdCA/IHNvdXJjZSArICcgLT4gJyArIHN0ZXAudGFyZ2V0IDogc291cmNlICsgJyA8LSAnICsgc3RlcC50YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc3VwZXIucHJvY2Vzc1N0ZXAoc3RlcCwgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgZSh2MSwgdjIpIHtcbiAgICBpZiAodjEgPiB2Mikge1xuICAgICAgdmFyIHRlbXAgPSB2MTtcbiAgICAgIHYxID0gdjI7XG4gICAgICB2MiA9IHRlbXA7XG4gICAgfVxuICAgIHJldHVybiAnZScgKyB2MSArICdfJyArIHYyO1xuICB9XG5cbiAgZHJhd09uSG92ZXIobm9kZSwgY29udGV4dCwgc2V0dGluZ3MsIG5leHQpIHtcbiAgICB2YXIgdHJhY2VyID0gdGhpcztcblxuICAgIGNvbnRleHQuc2V0TGluZURhc2goWzUsIDVdKTtcbiAgICB2YXIgbm9kZUlkeCA9IG5vZGUuaWQuc3Vic3RyaW5nKDEpO1xuICAgIHRoaXMuZ3JhcGguZWRnZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChlZGdlKSB7XG4gICAgICB2YXIgZW5kcyA9IGVkZ2UuaWQuc3Vic3RyaW5nKDEpLnNwbGl0KFwiX1wiKTtcbiAgICAgIGlmIChlbmRzWzBdID09IG5vZGVJZHgpIHtcbiAgICAgICAgdmFyIGNvbG9yID0gJyMwZmYnO1xuICAgICAgICB2YXIgc291cmNlID0gbm9kZTtcbiAgICAgICAgdmFyIHRhcmdldCA9IHRyYWNlci5ncmFwaC5ub2RlcygnbicgKyBlbmRzWzFdKTtcbiAgICAgICAgdHJhY2VyLmRyYXdFZGdlKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgICBpZiAobmV4dCkgbmV4dChlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgIH0gZWxzZSBpZiAoZW5kc1sxXSA9PSBub2RlSWR4KSB7XG4gICAgICAgIHZhciBjb2xvciA9ICcjMGZmJztcbiAgICAgICAgdmFyIHNvdXJjZSA9IHRyYWNlci5ncmFwaC5ub2RlcygnbicgKyBlbmRzWzBdKTtcbiAgICAgICAgdmFyIHRhcmdldCA9IG5vZGU7XG4gICAgICAgIHRyYWNlci5kcmF3RWRnZShlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgICAgaWYgKG5leHQpIG5leHQoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkcmF3RWRnZShlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgdmFyIHByZWZpeCA9IHNldHRpbmdzKCdwcmVmaXgnKSB8fCAnJyxcbiAgICAgIHNpemUgPSBlZGdlW3ByZWZpeCArICdzaXplJ10gfHwgMTtcblxuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IHNpemU7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhcbiAgICAgIHNvdXJjZVtwcmVmaXggKyAneCddLFxuICAgICAgc291cmNlW3ByZWZpeCArICd5J11cbiAgICApO1xuICAgIGNvbnRleHQubGluZVRvKFxuICAgICAgdGFyZ2V0W3ByZWZpeCArICd4J10sXG4gICAgICB0YXJnZXRbcHJlZml4ICsgJ3knXVxuICAgICk7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbiAgfVxufVxuXG5jb25zdCBpbml0VmlldyA9ICh0cmFjZXIpID0+IHtcbiAgdHJhY2VyLnMuc2V0dGluZ3Moe1xuICAgIGRlZmF1bHRFZGdlVHlwZTogJ2RlZicsXG4gICAgZnVuY0VkZ2VzRGVmKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb250ZXh0LCBzZXR0aW5ncykge1xuICAgICAgdmFyIGNvbG9yID0gdHJhY2VyLmdldENvbG9yKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBzZXR0aW5ncyk7XG4gICAgICB0cmFjZXIuZHJhd0VkZ2UoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29vcmRpbmF0ZVN5c3RlbVRyYWNlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgVHJhY2VyID0gcmVxdWlyZSgnLi90cmFjZXInKTtcblxuY29uc3Qge1xuICByZWZpbmVCeVR5cGVcbn0gPSByZXF1aXJlKCcuLi8uLi90cmFjZXJfbWFuYWdlci91dGlsL2luZGV4Jyk7XG5cbmNsYXNzIERpcmVjdGVkR3JhcGhUcmFjZXIgZXh0ZW5kcyBUcmFjZXIge1xuICBzdGF0aWMgZ2V0Q2xhc3NOYW1lKCkge1xuICAgIHJldHVybiAnRGlyZWN0ZWRHcmFwaFRyYWNlcic7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgc3VwZXIobmFtZSk7XG5cbiAgICB0aGlzLmNvbG9yID0ge1xuICAgICAgc2VsZWN0ZWQ6ICcjMGYwJyxcbiAgICAgIHZpc2l0ZWQ6ICcjZjAwJyxcbiAgICAgIGxlZnQ6ICcjMDAwJyxcbiAgICAgIGRlZmF1bHQ6ICcjODg4J1xuICAgIH07XG5cbiAgICBpZiAodGhpcy5pc05ldykgaW5pdFZpZXcodGhpcyk7XG4gIH1cblxuICBfc2V0VHJlZURhdGEoRywgcm9vdCkge1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHtcbiAgICAgIHR5cGU6ICdzZXRUcmVlRGF0YScsXG4gICAgICBhcmd1bWVudHM6IGFyZ3VtZW50c1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX3Zpc2l0KHRhcmdldCwgc291cmNlKSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ3Zpc2l0JyxcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgc291cmNlOiBzb3VyY2VcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9sZWF2ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHtcbiAgICAgIHR5cGU6ICdsZWF2ZScsXG4gICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgIHNvdXJjZTogc291cmNlXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcm9jZXNzU3RlcChzdGVwLCBvcHRpb25zKSB7XG4gICAgc3dpdGNoIChzdGVwLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3NldFRyZWVEYXRhJzpcbiAgICAgICAgdGhpcy5zZXRUcmVlRGF0YS5hcHBseSh0aGlzLCBzdGVwLmFyZ3VtZW50cyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndmlzaXQnOlxuICAgICAgY2FzZSAnbGVhdmUnOlxuICAgICAgICB2YXIgdmlzaXQgPSBzdGVwLnR5cGUgPT0gJ3Zpc2l0JztcbiAgICAgICAgdmFyIHRhcmdldE5vZGUgPSB0aGlzLmdyYXBoLm5vZGVzKHRoaXMubihzdGVwLnRhcmdldCkpO1xuICAgICAgICB2YXIgY29sb3IgPSB2aXNpdCA/IHRoaXMuY29sb3IudmlzaXRlZCA6IHRoaXMuY29sb3IubGVmdDtcbiAgICAgICAgdGFyZ2V0Tm9kZS5jb2xvciA9IGNvbG9yO1xuICAgICAgICBpZiAoc3RlcC5zb3VyY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHZhciBlZGdlSWQgPSB0aGlzLmUoc3RlcC5zb3VyY2UsIHN0ZXAudGFyZ2V0KTtcbiAgICAgICAgICB2YXIgZWRnZSA9IHRoaXMuZ3JhcGguZWRnZXMoZWRnZUlkKTtcbiAgICAgICAgICBlZGdlLmNvbG9yID0gY29sb3I7XG4gICAgICAgICAgdGhpcy5ncmFwaC5kcm9wRWRnZShlZGdlSWQpLmFkZEVkZ2UoZWRnZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubG9nVHJhY2VyKSB7XG4gICAgICAgICAgdmFyIHNvdXJjZSA9IHN0ZXAuc291cmNlO1xuICAgICAgICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkgc291cmNlID0gJyc7XG4gICAgICAgICAgdGhpcy5sb2dUcmFjZXIucHJpbnQodmlzaXQgPyBzb3VyY2UgKyAnIC0+ICcgKyBzdGVwLnRhcmdldCA6IHNvdXJjZSArICcgPC0gJyArIHN0ZXAudGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHN1cGVyLnByb2Nlc3NTdGVwKHN0ZXAsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIHNldFRyZWVEYXRhKEcsIHJvb3QsIHVuZGlyZWN0ZWQpIHtcbiAgICB2YXIgdHJhY2VyID0gdGhpcztcblxuICAgIHJvb3QgPSByb290IHx8IDA7XG4gICAgdmFyIG1heERlcHRoID0gLTE7XG5cbiAgICB2YXIgY2hrID0gbmV3IEFycmF5KEcubGVuZ3RoKTtcbiAgICB2YXIgZ2V0RGVwdGggPSBmdW5jdGlvbiAobm9kZSwgZGVwdGgpIHtcbiAgICAgIGlmIChjaGtbbm9kZV0pIHRocm93IFwidGhlIGdpdmVuIGdyYXBoIGlzIG5vdCBhIHRyZWUgYmVjYXVzZSBpdCBmb3JtcyBhIGNpcmN1aXRcIjtcbiAgICAgIGNoa1tub2RlXSA9IHRydWU7XG4gICAgICBpZiAobWF4RGVwdGggPCBkZXB0aCkgbWF4RGVwdGggPSBkZXB0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgR1tub2RlXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoR1tub2RlXVtpXSkgZ2V0RGVwdGgoaSwgZGVwdGggKyAxKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGdldERlcHRoKHJvb3QsIDEpO1xuXG4gICAgaWYgKHRoaXMuc2V0RGF0YShHLCB1bmRpcmVjdGVkKSkgcmV0dXJuIHRydWU7XG5cbiAgICB2YXIgcGxhY2UgPSBmdW5jdGlvbiAobm9kZSwgeCwgeSkge1xuICAgICAgdmFyIHRlbXAgPSB0cmFjZXIuZ3JhcGgubm9kZXModHJhY2VyLm4obm9kZSkpO1xuICAgICAgdGVtcC54ID0geDtcbiAgICAgIHRlbXAueSA9IHk7XG4gICAgfTtcblxuICAgIHZhciB3Z2FwID0gMSAvIChtYXhEZXB0aCAtIDEpO1xuICAgIHZhciBkZnMgPSBmdW5jdGlvbiAobm9kZSwgZGVwdGgsIHRvcCwgYm90dG9tKSB7XG4gICAgICBwbGFjZShub2RlLCB0b3AgKyBib3R0b20sIGRlcHRoICogd2dhcCk7XG4gICAgICB2YXIgY2hpbGRyZW4gPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBHW25vZGVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChHW25vZGVdW2ldKSBjaGlsZHJlbisrO1xuICAgICAgfVxuICAgICAgdmFyIHZnYXAgPSAoYm90dG9tIC0gdG9wKSAvIGNoaWxkcmVuO1xuICAgICAgdmFyIGNudCA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IEdbbm9kZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKEdbbm9kZV1baV0pIGRmcyhpLCBkZXB0aCArIDEsIHRvcCArIHZnYXAgKiBjbnQsIHRvcCArIHZnYXAgKiArK2NudCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBkZnMocm9vdCwgMCwgMCwgMSk7XG5cbiAgICB0aGlzLnJlZnJlc2goKTtcbiAgfVxuXG4gIHNldERhdGEoRywgdW5kaXJlY3RlZCkge1xuICAgIGlmIChzdXBlci5zZXREYXRhLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpIHJldHVybiB0cnVlO1xuXG4gICAgdGhpcy5ncmFwaC5jbGVhcigpO1xuICAgIGNvbnN0IG5vZGVzID0gW107XG4gICAgY29uc3QgZWRnZXMgPSBbXTtcbiAgICBjb25zdCB1bml0QW5nbGUgPSAyICogTWF0aC5QSSAvIEcubGVuZ3RoO1xuICAgIGxldCBjdXJyZW50QW5nbGUgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRy5sZW5ndGg7IGkrKykge1xuICAgICAgY3VycmVudEFuZ2xlICs9IHVuaXRBbmdsZTtcbiAgICAgIG5vZGVzLnB1c2goe1xuICAgICAgICBpZDogdGhpcy5uKGkpLFxuICAgICAgICBsYWJlbDogJycgKyBpLFxuICAgICAgICB4OiAuNSArIE1hdGguc2luKGN1cnJlbnRBbmdsZSkgLyAyLFxuICAgICAgICB5OiAuNSArIE1hdGguY29zKGN1cnJlbnRBbmdsZSkgLyAyLFxuICAgICAgICBzaXplOiAxLFxuICAgICAgICBjb2xvcjogdGhpcy5jb2xvci5kZWZhdWx0LFxuICAgICAgICB3ZWlnaHQ6IDBcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodW5kaXJlY3RlZCkge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8PSBpOyBqKyspIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IEdbaV1bal0gfHwgR1tqXVtpXTtcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIGVkZ2VzLnB1c2goe1xuICAgICAgICAgICAgICBpZDogdGhpcy5lKGksIGopLFxuICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMubihpKSxcbiAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLm4oaiksXG4gICAgICAgICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLmRlZmF1bHQsXG4gICAgICAgICAgICAgIHNpemU6IDEsXG4gICAgICAgICAgICAgIHdlaWdodDogcmVmaW5lQnlUeXBlKHZhbHVlKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IEdbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAoR1tpXVtqXSkge1xuICAgICAgICAgICAgZWRnZXMucHVzaCh7XG4gICAgICAgICAgICAgIGlkOiB0aGlzLmUoaSwgaiksXG4gICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5uKGkpLFxuICAgICAgICAgICAgICB0YXJnZXQ6IHRoaXMubihqKSxcbiAgICAgICAgICAgICAgY29sb3I6IHRoaXMuY29sb3IuZGVmYXVsdCxcbiAgICAgICAgICAgICAgc2l6ZTogMSxcbiAgICAgICAgICAgICAgd2VpZ2h0OiByZWZpbmVCeVR5cGUoR1tpXVtqXSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZ3JhcGgucmVhZCh7XG4gICAgICBub2Rlczogbm9kZXMsXG4gICAgICBlZGdlczogZWRnZXNcbiAgICB9KTtcbiAgICB0aGlzLnMuY2FtZXJhLmdvVG8oe1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICBhbmdsZTogMCxcbiAgICAgIHJhdGlvOiAxXG4gICAgfSk7XG4gICAgdGhpcy5yZWZyZXNoKCk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXNpemUoKSB7XG4gICAgc3VwZXIucmVzaXplKCk7XG5cbiAgICB0aGlzLnMucmVuZGVyZXJzWzBdLnJlc2l6ZSgpO1xuICAgIHRoaXMucmVmcmVzaCgpO1xuICB9XG5cbiAgcmVmcmVzaCgpIHtcbiAgICBzdXBlci5yZWZyZXNoKCk7XG5cbiAgICB0aGlzLnMucmVmcmVzaCgpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgc3VwZXIuY2xlYXIoKTtcblxuICAgIHRoaXMuY2xlYXJHcmFwaENvbG9yKCk7XG4gIH1cblxuICBjbGVhckdyYXBoQ29sb3IoKSB7XG4gICAgdmFyIHRyYWNlciA9IHRoaXM7XG5cbiAgICB0aGlzLmdyYXBoLm5vZGVzKCkuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgbm9kZS5jb2xvciA9IHRyYWNlci5jb2xvci5kZWZhdWx0O1xuICAgIH0pO1xuICAgIHRoaXMuZ3JhcGguZWRnZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChlZGdlKSB7XG4gICAgICBlZGdlLmNvbG9yID0gdHJhY2VyLmNvbG9yLmRlZmF1bHQ7XG4gICAgfSk7XG4gIH1cblxuICBuKHYpIHtcbiAgICByZXR1cm4gJ24nICsgdjtcbiAgfVxuXG4gIGUodjEsIHYyKSB7XG4gICAgcmV0dXJuICdlJyArIHYxICsgJ18nICsgdjI7XG4gIH1cblxuICBnZXRDb2xvcihlZGdlLCBzb3VyY2UsIHRhcmdldCwgc2V0dGluZ3MpIHtcbiAgICB2YXIgY29sb3IgPSBlZGdlLmNvbG9yLFxuICAgICAgZWRnZUNvbG9yID0gc2V0dGluZ3MoJ2VkZ2VDb2xvcicpLFxuICAgICAgZGVmYXVsdE5vZGVDb2xvciA9IHNldHRpbmdzKCdkZWZhdWx0Tm9kZUNvbG9yJyksXG4gICAgICBkZWZhdWx0RWRnZUNvbG9yID0gc2V0dGluZ3MoJ2RlZmF1bHRFZGdlQ29sb3InKTtcbiAgICBpZiAoIWNvbG9yKVxuICAgICAgc3dpdGNoIChlZGdlQ29sb3IpIHtcbiAgICAgICAgY2FzZSAnc291cmNlJzpcbiAgICAgICAgICBjb2xvciA9IHNvdXJjZS5jb2xvciB8fCBkZWZhdWx0Tm9kZUNvbG9yO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0YXJnZXQnOlxuICAgICAgICAgIGNvbG9yID0gdGFyZ2V0LmNvbG9yIHx8IGRlZmF1bHROb2RlQ29sb3I7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29sb3IgPSBkZWZhdWx0RWRnZUNvbG9yO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgcmV0dXJuIGNvbG9yO1xuICB9XG5cbiAgZHJhd0xhYmVsKG5vZGUsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgdmFyIGZvbnRTaXplLFxuICAgICAgcHJlZml4ID0gc2V0dGluZ3MoJ3ByZWZpeCcpIHx8ICcnLFxuICAgICAgc2l6ZSA9IG5vZGVbcHJlZml4ICsgJ3NpemUnXTtcblxuICAgIGlmIChzaXplIDwgc2V0dGluZ3MoJ2xhYmVsVGhyZXNob2xkJykpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAoIW5vZGUubGFiZWwgfHwgdHlwZW9mIG5vZGUubGFiZWwgIT09ICdzdHJpbmcnKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9udFNpemUgPSAoc2V0dGluZ3MoJ2xhYmVsU2l6ZScpID09PSAnZml4ZWQnKSA/XG4gICAgICBzZXR0aW5ncygnZGVmYXVsdExhYmVsU2l6ZScpIDpcbiAgICBzZXR0aW5ncygnbGFiZWxTaXplUmF0aW8nKSAqIHNpemU7XG5cbiAgICBjb250ZXh0LmZvbnQgPSAoc2V0dGluZ3MoJ2ZvbnRTdHlsZScpID8gc2V0dGluZ3MoJ2ZvbnRTdHlsZScpICsgJyAnIDogJycpICtcbiAgICAgIGZvbnRTaXplICsgJ3B4ICcgKyBzZXR0aW5ncygnZm9udCcpO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gKHNldHRpbmdzKCdsYWJlbENvbG9yJykgPT09ICdub2RlJykgP1xuICAgICAgKG5vZGUuY29sb3IgfHwgc2V0dGluZ3MoJ2RlZmF1bHROb2RlQ29sb3InKSkgOlxuICAgICAgc2V0dGluZ3MoJ2RlZmF1bHRMYWJlbENvbG9yJyk7XG5cbiAgICBjb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIGNvbnRleHQuZmlsbFRleHQoXG4gICAgICBub2RlLmxhYmVsLFxuICAgICAgTWF0aC5yb3VuZChub2RlW3ByZWZpeCArICd4J10pLFxuICAgICAgTWF0aC5yb3VuZChub2RlW3ByZWZpeCArICd5J10gKyBmb250U2l6ZSAvIDMpXG4gICAgKTtcbiAgfVxuXG4gIGRyYXdBcnJvdyhlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgdmFyIHByZWZpeCA9IHNldHRpbmdzKCdwcmVmaXgnKSB8fCAnJyxcbiAgICAgIHNpemUgPSBlZGdlW3ByZWZpeCArICdzaXplJ10gfHwgMSxcbiAgICAgIHRTaXplID0gdGFyZ2V0W3ByZWZpeCArICdzaXplJ10sXG4gICAgICBzWCA9IHNvdXJjZVtwcmVmaXggKyAneCddLFxuICAgICAgc1kgPSBzb3VyY2VbcHJlZml4ICsgJ3knXSxcbiAgICAgIHRYID0gdGFyZ2V0W3ByZWZpeCArICd4J10sXG4gICAgICB0WSA9IHRhcmdldFtwcmVmaXggKyAneSddLFxuICAgICAgYW5nbGUgPSBNYXRoLmF0YW4yKHRZIC0gc1ksIHRYIC0gc1gpLFxuICAgICAgZGlzdCA9IDM7XG4gICAgc1ggKz0gTWF0aC5zaW4oYW5nbGUpICogZGlzdDtcbiAgICB0WCArPSBNYXRoLnNpbihhbmdsZSkgKiBkaXN0O1xuICAgIHNZICs9IC1NYXRoLmNvcyhhbmdsZSkgKiBkaXN0O1xuICAgIHRZICs9IC1NYXRoLmNvcyhhbmdsZSkgKiBkaXN0O1xuICAgIHZhciBhU2l6ZSA9IE1hdGgubWF4KHNpemUgKiAyLjUsIHNldHRpbmdzKCdtaW5BcnJvd1NpemUnKSksXG4gICAgICBkID0gTWF0aC5zcXJ0KE1hdGgucG93KHRYIC0gc1gsIDIpICsgTWF0aC5wb3codFkgLSBzWSwgMikpLFxuICAgICAgYVggPSBzWCArICh0WCAtIHNYKSAqIChkIC0gYVNpemUgLSB0U2l6ZSkgLyBkLFxuICAgICAgYVkgPSBzWSArICh0WSAtIHNZKSAqIChkIC0gYVNpemUgLSB0U2l6ZSkgLyBkLFxuICAgICAgdlggPSAodFggLSBzWCkgKiBhU2l6ZSAvIGQsXG4gICAgICB2WSA9ICh0WSAtIHNZKSAqIGFTaXplIC8gZDtcblxuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IHNpemU7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhzWCwgc1kpO1xuICAgIGNvbnRleHQubGluZVRvKFxuICAgICAgYVgsXG4gICAgICBhWVxuICAgICk7XG4gICAgY29udGV4dC5zdHJva2UoKTtcblxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gY29sb3I7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhhWCArIHZYLCBhWSArIHZZKTtcbiAgICBjb250ZXh0LmxpbmVUbyhhWCArIHZZICogMC42LCBhWSAtIHZYICogMC42KTtcbiAgICBjb250ZXh0LmxpbmVUbyhhWCAtIHZZICogMC42LCBhWSArIHZYICogMC42KTtcbiAgICBjb250ZXh0LmxpbmVUbyhhWCArIHZYLCBhWSArIHZZKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xuICB9XG5cbiAgZHJhd09uSG92ZXIobm9kZSwgY29udGV4dCwgc2V0dGluZ3MsIG5leHQpIHtcbiAgICB2YXIgdHJhY2VyID0gdGhpcztcblxuICAgIGNvbnRleHQuc2V0TGluZURhc2goWzUsIDVdKTtcbiAgICB2YXIgbm9kZUlkeCA9IG5vZGUuaWQuc3Vic3RyaW5nKDEpO1xuICAgIHRoaXMuZ3JhcGguZWRnZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChlZGdlKSB7XG4gICAgICB2YXIgZW5kcyA9IGVkZ2UuaWQuc3Vic3RyaW5nKDEpLnNwbGl0KFwiX1wiKTtcbiAgICAgIGlmIChlbmRzWzBdID09IG5vZGVJZHgpIHtcbiAgICAgICAgdmFyIGNvbG9yID0gJyMwZmYnO1xuICAgICAgICB2YXIgc291cmNlID0gbm9kZTtcbiAgICAgICAgdmFyIHRhcmdldCA9IHRyYWNlci5ncmFwaC5ub2RlcygnbicgKyBlbmRzWzFdKTtcbiAgICAgICAgdHJhY2VyLmRyYXdBcnJvdyhlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgICAgaWYgKG5leHQpIG5leHQoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gICAgICB9IGVsc2UgaWYgKGVuZHNbMV0gPT0gbm9kZUlkeCkge1xuICAgICAgICB2YXIgY29sb3IgPSAnI2ZmMCc7XG4gICAgICAgIHZhciBzb3VyY2UgPSB0cmFjZXIuZ3JhcGgubm9kZXMoJ24nICsgZW5kc1swXSk7XG4gICAgICAgIHZhciB0YXJnZXQgPSBub2RlO1xuICAgICAgICB0cmFjZXIuZHJhd0Fycm93KGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgICBpZiAobmV4dCkgbmV4dChlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5jb25zdCBpbml0VmlldyA9ICh0cmFjZXIpID0+IHtcbiAgdHJhY2VyLnMgPSB0cmFjZXIuY2Fwc3VsZS5zID0gbmV3IHNpZ21hKHtcbiAgICByZW5kZXJlcjoge1xuICAgICAgY29udGFpbmVyOiB0cmFjZXIuJGNvbnRhaW5lclswXSxcbiAgICAgIHR5cGU6ICdjYW52YXMnXG4gICAgfSxcbiAgICBzZXR0aW5nczoge1xuICAgICAgbWluQXJyb3dTaXplOiA4LFxuICAgICAgZGVmYXVsdEVkZ2VUeXBlOiAnYXJyb3cnLFxuICAgICAgbWF4RWRnZVNpemU6IDIuNSxcbiAgICAgIGxhYmVsVGhyZXNob2xkOiA0LFxuICAgICAgZm9udDogJ1JvYm90bycsXG4gICAgICBkZWZhdWx0TGFiZWxDb2xvcjogJyNmZmYnLFxuICAgICAgem9vbU1pbjogMC42LFxuICAgICAgem9vbU1heDogMS4yLFxuICAgICAgc2tpcEVycm9yczogdHJ1ZSxcbiAgICAgIG1pbk5vZGVTaXplOiAuNSxcbiAgICAgIG1heE5vZGVTaXplOiAxMixcbiAgICAgIGxhYmVsU2l6ZTogJ3Byb3BvcnRpb25hbCcsXG4gICAgICBsYWJlbFNpemVSYXRpbzogMS4zLFxuICAgICAgZnVuY0xhYmVsc0RlZihub2RlLCBjb250ZXh0LCBzZXR0aW5ncykge1xuICAgICAgICB0cmFjZXIuZHJhd0xhYmVsKG5vZGUsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgIH0sXG4gICAgICBmdW5jSG92ZXJzRGVmKG5vZGUsIGNvbnRleHQsIHNldHRpbmdzLCBuZXh0KSB7XG4gICAgICAgIHRyYWNlci5kcmF3T25Ib3Zlcihub2RlLCBjb250ZXh0LCBzZXR0aW5ncywgbmV4dCk7XG4gICAgICB9LFxuICAgICAgZnVuY0VkZ2VzQXJyb3coZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBjb2xvciA9IHRyYWNlci5nZXRDb2xvcihlZGdlLCBzb3VyY2UsIHRhcmdldCwgc2V0dGluZ3MpO1xuICAgICAgICB0cmFjZXIuZHJhd0Fycm93KGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHNpZ21hLnBsdWdpbnMuZHJhZ05vZGVzKHRyYWNlci5zLCB0cmFjZXIucy5yZW5kZXJlcnNbMF0pO1xuICB0cmFjZXIuZ3JhcGggPSB0cmFjZXIuY2Fwc3VsZS5ncmFwaCA9IHRyYWNlci5zLmdyYXBoO1xufTtcblxuc2lnbWEuY2FudmFzLmxhYmVscy5kZWYgPSBmdW5jdGlvbiAobm9kZSwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgdmFyIGZ1bmMgPSBzZXR0aW5ncygnZnVuY0xhYmVsc0RlZicpO1xuICBpZiAoZnVuYykge1xuICAgIGZ1bmMobm9kZSwgY29udGV4dCwgc2V0dGluZ3MpO1xuICB9XG59O1xuc2lnbWEuY2FudmFzLmhvdmVycy5kZWYgPSBmdW5jdGlvbiAobm9kZSwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgdmFyIGZ1bmMgPSBzZXR0aW5ncygnZnVuY0hvdmVyc0RlZicpO1xuICBpZiAoZnVuYykge1xuICAgIGZ1bmMobm9kZSwgY29udGV4dCwgc2V0dGluZ3MpO1xuICB9XG59O1xuc2lnbWEuY2FudmFzLmVkZ2VzLmRlZiA9IGZ1bmN0aW9uIChlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgdmFyIGZ1bmMgPSBzZXR0aW5ncygnZnVuY0VkZ2VzRGVmJyk7XG4gIGlmIChmdW5jKSB7XG4gICAgZnVuYyhlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29udGV4dCwgc2V0dGluZ3MpO1xuICB9XG59O1xuc2lnbWEuY2FudmFzLmVkZ2VzLmFycm93ID0gZnVuY3Rpb24gKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb250ZXh0LCBzZXR0aW5ncykge1xuICB2YXIgZnVuYyA9IHNldHRpbmdzKCdmdW5jRWRnZXNBcnJvdycpO1xuICBpZiAoZnVuYykge1xuICAgIGZ1bmMoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEaXJlY3RlZEdyYXBoVHJhY2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBUcmFjZXIgPSByZXF1aXJlKCcuL3RyYWNlcicpO1xuY29uc3QgTG9nVHJhY2VyID0gcmVxdWlyZSgnLi9sb2cnKTtcbmNvbnN0IEFycmF5MURUcmFjZXIgPSByZXF1aXJlKCcuL2FycmF5MWQnKTtcbmNvbnN0IEFycmF5MkRUcmFjZXIgPSByZXF1aXJlKCcuL2FycmF5MmQnKTtcbmNvbnN0IENoYXJ0VHJhY2VyID0gcmVxdWlyZSgnLi9jaGFydCcpO1xuY29uc3QgQ29vcmRpbmF0ZVN5c3RlbVRyYWNlciA9IHJlcXVpcmUoJy4vY29vcmRpbmF0ZV9zeXN0ZW0nKTtcbmNvbnN0IERpcmVjdGVkR3JhcGhUcmFjZXIgPSByZXF1aXJlKCcuL2RpcmVjdGVkX2dyYXBoJyk7XG5jb25zdCBVbmRpcmVjdGVkR3JhcGhUcmFjZXIgPSByZXF1aXJlKCcuL3VuZGlyZWN0ZWRfZ3JhcGgnKTtcbmNvbnN0IFdlaWdodGVkRGlyZWN0ZWRHcmFwaFRyYWNlciA9IHJlcXVpcmUoJy4vd2VpZ2h0ZWRfZGlyZWN0ZWRfZ3JhcGgnKTtcbmNvbnN0IFdlaWdodGVkVW5kaXJlY3RlZEdyYXBoVHJhY2VyID0gcmVxdWlyZSgnLi93ZWlnaHRlZF91bmRpcmVjdGVkX2dyYXBoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBUcmFjZXIsXG4gIExvZ1RyYWNlcixcbiAgQXJyYXkxRFRyYWNlcixcbiAgQXJyYXkyRFRyYWNlcixcbiAgQ2hhcnRUcmFjZXIsXG4gIENvb3JkaW5hdGVTeXN0ZW1UcmFjZXIsXG4gIERpcmVjdGVkR3JhcGhUcmFjZXIsXG4gIFVuZGlyZWN0ZWRHcmFwaFRyYWNlcixcbiAgV2VpZ2h0ZWREaXJlY3RlZEdyYXBoVHJhY2VyLFxuICBXZWlnaHRlZFVuZGlyZWN0ZWRHcmFwaFRyYWNlclxufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFRyYWNlciA9IHJlcXVpcmUoJy4vdHJhY2VyJyk7XG5cbmNsYXNzIExvZ1RyYWNlciBleHRlbmRzIFRyYWNlciB7XG4gIHN0YXRpYyBnZXRDbGFzc05hbWUoKSB7XG4gICAgcmV0dXJuICdMb2dUcmFjZXInO1xuICB9XG5cbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHN1cGVyKG5hbWUpO1xuXG4gICAgaWYgKHRoaXMuaXNOZXcpIGluaXRWaWV3KHRoaXMpO1xuICB9XG5cbiAgX3ByaW50KG1zZykge1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHtcbiAgICAgIHR5cGU6ICdwcmludCcsXG4gICAgICBtc2c6IG1zZ1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHJvY2Vzc1N0ZXAoc3RlcCwgb3B0aW9ucykge1xuICAgIHN3aXRjaCAoc3RlcC50eXBlKSB7XG4gICAgICBjYXNlICdwcmludCc6XG4gICAgICAgIHRoaXMucHJpbnQoc3RlcC5tc2cpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZWZyZXNoKCkge1xuICAgIHRoaXMuc2Nyb2xsVG9FbmQoTWF0aC5taW4oNTAsIHRoaXMuaW50ZXJ2YWwpKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHN1cGVyLmNsZWFyKCk7XG5cbiAgICB0aGlzLiR3cmFwcGVyLmVtcHR5KCk7XG4gIH1cblxuICBwcmludChtZXNzYWdlKSB7XG4gICAgdGhpcy4kd3JhcHBlci5hcHBlbmQoJCgnPHNwYW4+JykuYXBwZW5kKG1lc3NhZ2UgKyAnPGJyLz4nKSk7XG4gIH1cblxuICBzY3JvbGxUb0VuZChkdXJhdGlvbikge1xuICAgIHRoaXMuJGNvbnRhaW5lci5hbmltYXRlKHtcbiAgICAgIHNjcm9sbFRvcDogdGhpcy4kY29udGFpbmVyWzBdLnNjcm9sbEhlaWdodFxuICAgIH0sIGR1cmF0aW9uKTtcbiAgfVxufVxuXG5jb25zdCBpbml0VmlldyA9ICh0cmFjZXIpID0+IHtcbiAgdHJhY2VyLiR3cmFwcGVyID0gdHJhY2VyLmNhcHN1bGUuJHdyYXBwZXIgPSAkKCc8ZGl2IGNsYXNzPVwid3JhcHBlclwiPicpO1xuICB0cmFjZXIuJGNvbnRhaW5lci5hcHBlbmQodHJhY2VyLiR3cmFwcGVyKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nVHJhY2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBhcHAgPSByZXF1aXJlKCcuLi8uLi9hcHAnKTtcblxuY29uc3Qge1xuICB0b0pTT04sXG4gIGZyb21KU09OXG59ID0gcmVxdWlyZSgnLi4vLi4vdHJhY2VyX21hbmFnZXIvdXRpbC9pbmRleCcpO1xuXG5jbGFzcyBUcmFjZXIge1xuICBzdGF0aWMgZ2V0Q2xhc3NOYW1lKCkge1xuICAgIHJldHVybiAnVHJhY2VyJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICB0aGlzLm1vZHVsZSA9IHRoaXMuY29uc3RydWN0b3I7XG5cbiAgICB0aGlzLm1hbmFnZXIgPSBhcHAuZ2V0VHJhY2VyTWFuYWdlcigpO1xuICAgIHRoaXMuY2Fwc3VsZSA9IHRoaXMubWFuYWdlci5hbGxvY2F0ZSh0aGlzKTtcbiAgICAkLmV4dGVuZCh0aGlzLCB0aGlzLmNhcHN1bGUpO1xuXG4gICAgdGhpcy5zZXROYW1lKG5hbWUpO1xuICB9XG5cbiAgX3NldERhdGEoLi4uYXJncykge1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHtcbiAgICAgIHR5cGU6ICdzZXREYXRhJyxcbiAgICAgIGFyZ3M6IHRvSlNPTihhcmdzKVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2NsZWFyKCkge1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHtcbiAgICAgIHR5cGU6ICdjbGVhcidcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF93YWl0KCkge1xuICAgIHRoaXMubWFuYWdlci5uZXdTdGVwKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcm9jZXNzU3RlcChzdGVwLCBvcHRpb25zKSB7XG4gICAgY29uc3Qge1xuICAgICAgdHlwZSxcbiAgICAgIGFyZ3NcbiAgICB9ID0gc3RlcDtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnc2V0RGF0YSc6XG4gICAgICAgIHRoaXMuc2V0RGF0YSguLi5mcm9tSlNPTihhcmdzKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2xlYXInOlxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHNldE5hbWUobmFtZSkge1xuICAgIGxldCAkbmFtZTtcbiAgICBpZiAodGhpcy5pc05ldykge1xuICAgICAgJG5hbWUgPSAkKCc8c3BhbiBjbGFzcz1cIm5hbWVcIj4nKTtcbiAgICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQoJG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkbmFtZSA9IHRoaXMuJGNvbnRhaW5lci5maW5kKCdzcGFuLm5hbWUnKTtcbiAgICB9XG4gICAgJG5hbWUudGV4dChuYW1lIHx8IHRoaXMuZGVmYXVsdE5hbWUpO1xuICB9XG5cbiAgc2V0RGF0YSgpIHtcbiAgICBjb25zdCBkYXRhID0gdG9KU09OKGFyZ3VtZW50cyk7XG4gICAgaWYgKCF0aGlzLmlzTmV3ICYmIHRoaXMubGFzdERhdGEgPT09IGRhdGEpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB0aGlzLmxhc3REYXRhID0gdGhpcy5jYXBzdWxlLmxhc3REYXRhID0gZGF0YTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXNpemUoKSB7XG4gIH1cblxuICByZWZyZXNoKCkge1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gIH1cblxuICBhdHRhY2godHJhY2VyKSB7XG4gICAgaWYgKHRyYWNlci5tb2R1bGUgPT09IExvZ1RyYWNlcikge1xuICAgICAgdGhpcy5sb2dUcmFjZXIgPSB0cmFjZXI7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbW91c2Vkb3duKGUpIHtcbiAgfVxuXG4gIG1vdXNlbW92ZShlKSB7XG4gIH1cblxuICBtb3VzZXVwKGUpIHtcbiAgfVxuXG4gIG1vdXNld2hlZWwoZSkge1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhY2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBEaXJlY3RlZEdyYXBoVHJhY2VyID0gcmVxdWlyZSgnLi9kaXJlY3RlZF9ncmFwaCcpO1xuXG5jbGFzcyBVbmRpcmVjdGVkR3JhcGhUcmFjZXIgZXh0ZW5kcyBEaXJlY3RlZEdyYXBoVHJhY2VyIHtcbiAgc3RhdGljIGdldENsYXNzTmFtZSgpIHtcbiAgICByZXR1cm4gJ1VuZGlyZWN0ZWRHcmFwaFRyYWNlcic7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgc3VwZXIobmFtZSk7XG5cbiAgICBpZiAodGhpcy5pc05ldykgaW5pdFZpZXcodGhpcyk7XG4gIH1cblxuICBzZXRUcmVlRGF0YShHLCByb290KSB7XG4gICAgcmV0dXJuIHN1cGVyLnNldFRyZWVEYXRhKEcsIHJvb3QsIHRydWUpO1xuICB9XG5cbiAgc2V0RGF0YShHKSB7XG4gICAgcmV0dXJuIHN1cGVyLnNldERhdGEoRywgdHJ1ZSk7XG4gIH1cblxuICBlKHYxLCB2Mikge1xuICAgIGlmICh2MSA+IHYyKSB7XG4gICAgICB2YXIgdGVtcCA9IHYxO1xuICAgICAgdjEgPSB2MjtcbiAgICAgIHYyID0gdGVtcDtcbiAgICB9XG4gICAgcmV0dXJuICdlJyArIHYxICsgJ18nICsgdjI7XG4gIH1cblxuICBkcmF3T25Ib3Zlcihub2RlLCBjb250ZXh0LCBzZXR0aW5ncywgbmV4dCkge1xuICAgIHZhciB0cmFjZXIgPSB0aGlzO1xuXG4gICAgY29udGV4dC5zZXRMaW5lRGFzaChbNSwgNV0pO1xuICAgIHZhciBub2RlSWR4ID0gbm9kZS5pZC5zdWJzdHJpbmcoMSk7XG4gICAgdGhpcy5ncmFwaC5lZGdlcygpLmZvckVhY2goZnVuY3Rpb24gKGVkZ2UpIHtcbiAgICAgIHZhciBlbmRzID0gZWRnZS5pZC5zdWJzdHJpbmcoMSkuc3BsaXQoXCJfXCIpO1xuICAgICAgaWYgKGVuZHNbMF0gPT0gbm9kZUlkeCkge1xuICAgICAgICB2YXIgY29sb3IgPSAnIzBmZic7XG4gICAgICAgIHZhciBzb3VyY2UgPSBub2RlO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gdHJhY2VyLmdyYXBoLm5vZGVzKCduJyArIGVuZHNbMV0pO1xuICAgICAgICB0cmFjZXIuZHJhd0VkZ2UoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gICAgICAgIGlmIChuZXh0KSBuZXh0KGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgfSBlbHNlIGlmIChlbmRzWzFdID09IG5vZGVJZHgpIHtcbiAgICAgICAgdmFyIGNvbG9yID0gJyMwZmYnO1xuICAgICAgICB2YXIgc291cmNlID0gdHJhY2VyLmdyYXBoLm5vZGVzKCduJyArIGVuZHNbMF0pO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gbm9kZTtcbiAgICAgICAgdHJhY2VyLmRyYXdFZGdlKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgICBpZiAobmV4dCkgbmV4dChlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRyYXdFZGdlKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgICB2YXIgcHJlZml4ID0gc2V0dGluZ3MoJ3ByZWZpeCcpIHx8ICcnLFxuICAgICAgc2l6ZSA9IGVkZ2VbcHJlZml4ICsgJ3NpemUnXSB8fCAxO1xuXG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gc2l6ZTtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKFxuICAgICAgc291cmNlW3ByZWZpeCArICd4J10sXG4gICAgICBzb3VyY2VbcHJlZml4ICsgJ3knXVxuICAgICk7XG4gICAgY29udGV4dC5saW5lVG8oXG4gICAgICB0YXJnZXRbcHJlZml4ICsgJ3gnXSxcbiAgICAgIHRhcmdldFtwcmVmaXggKyAneSddXG4gICAgKTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuICB9XG59XG5cbmNvbnN0IGluaXRWaWV3ID0gKHRyYWNlcikgPT4ge1xuICB0cmFjZXIucy5zZXR0aW5ncyh7XG4gICAgZGVmYXVsdEVkZ2VUeXBlOiAnZGVmJyxcbiAgICBmdW5jRWRnZXNEZWYoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgICB2YXIgY29sb3IgPSB0cmFjZXIuZ2V0Q29sb3IoZWRnZSwgc291cmNlLCB0YXJnZXQsIHNldHRpbmdzKTtcbiAgICAgIHRyYWNlci5kcmF3RWRnZShlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVbmRpcmVjdGVkR3JhcGhUcmFjZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IERpcmVjdGVkR3JhcGhUcmFjZXIgPSByZXF1aXJlKCcuL2RpcmVjdGVkX2dyYXBoJyk7XG5cbmNvbnN0IHtcbiAgcmVmaW5lQnlUeXBlXG59ID0gcmVxdWlyZSgnLi4vLi4vdHJhY2VyX21hbmFnZXIvdXRpbC9pbmRleCcpO1xuXG5jbGFzcyBXZWlnaHRlZERpcmVjdGVkR3JhcGhUcmFjZXIgZXh0ZW5kcyBEaXJlY3RlZEdyYXBoVHJhY2VyIHtcbiAgc3RhdGljIGdldENsYXNzTmFtZSgpIHtcbiAgICByZXR1cm4gJ1dlaWdodGVkRGlyZWN0ZWRHcmFwaFRyYWNlcic7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgc3VwZXIobmFtZSk7XG5cbiAgICBpZiAodGhpcy5pc05ldykgaW5pdFZpZXcodGhpcyk7XG4gIH1cblxuICBfd2VpZ2h0KHRhcmdldCwgd2VpZ2h0KSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ3dlaWdodCcsXG4gICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgIHdlaWdodDogd2VpZ2h0XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfdmlzaXQodGFyZ2V0LCBzb3VyY2UsIHdlaWdodCkge1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHtcbiAgICAgIHR5cGU6ICd2aXNpdCcsXG4gICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgIHNvdXJjZTogc291cmNlLFxuICAgICAgd2VpZ2h0OiB3ZWlnaHRcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9sZWF2ZSh0YXJnZXQsIHNvdXJjZSwgd2VpZ2h0KSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ2xlYXZlJyxcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICB3ZWlnaHQ6IHdlaWdodFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHJvY2Vzc1N0ZXAoc3RlcCwgb3B0aW9ucykge1xuICAgIHN3aXRjaCAoc3RlcC50eXBlKSB7XG4gICAgICBjYXNlICd3ZWlnaHQnOlxuICAgICAgICB2YXIgdGFyZ2V0Tm9kZSA9IHRoaXMuZ3JhcGgubm9kZXModGhpcy5uKHN0ZXAudGFyZ2V0KSk7XG4gICAgICAgIGlmIChzdGVwLndlaWdodCAhPT0gdW5kZWZpbmVkKSB0YXJnZXROb2RlLndlaWdodCA9IHJlZmluZUJ5VHlwZShzdGVwLndlaWdodCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndmlzaXQnOlxuICAgICAgY2FzZSAnbGVhdmUnOlxuICAgICAgICB2YXIgdmlzaXQgPSBzdGVwLnR5cGUgPT0gJ3Zpc2l0JztcbiAgICAgICAgdmFyIHRhcmdldE5vZGUgPSB0aGlzLmdyYXBoLm5vZGVzKHRoaXMubihzdGVwLnRhcmdldCkpO1xuICAgICAgICB2YXIgY29sb3IgPSB2aXNpdCA/IHN0ZXAud2VpZ2h0ID09PSB1bmRlZmluZWQgPyB0aGlzLmNvbG9yLnNlbGVjdGVkIDogdGhpcy5jb2xvci52aXNpdGVkIDogdGhpcy5jb2xvci5sZWZ0O1xuICAgICAgICB0YXJnZXROb2RlLmNvbG9yID0gY29sb3I7XG4gICAgICAgIGlmIChzdGVwLndlaWdodCAhPT0gdW5kZWZpbmVkKSB0YXJnZXROb2RlLndlaWdodCA9IHJlZmluZUJ5VHlwZShzdGVwLndlaWdodCk7XG4gICAgICAgIGlmIChzdGVwLnNvdXJjZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdmFyIGVkZ2VJZCA9IHRoaXMuZShzdGVwLnNvdXJjZSwgc3RlcC50YXJnZXQpO1xuICAgICAgICAgIHZhciBlZGdlID0gdGhpcy5ncmFwaC5lZGdlcyhlZGdlSWQpO1xuICAgICAgICAgIGVkZ2UuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgICB0aGlzLmdyYXBoLmRyb3BFZGdlKGVkZ2VJZCkuYWRkRWRnZShlZGdlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5sb2dUcmFjZXIpIHtcbiAgICAgICAgICB2YXIgc291cmNlID0gc3RlcC5zb3VyY2U7XG4gICAgICAgICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSBzb3VyY2UgPSAnJztcbiAgICAgICAgICB0aGlzLmxvZ1RyYWNlci5wcmludCh2aXNpdCA/IHNvdXJjZSArICcgLT4gJyArIHN0ZXAudGFyZ2V0IDogc291cmNlICsgJyA8LSAnICsgc3RlcC50YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc3VwZXIucHJvY2Vzc1N0ZXAoc3RlcCwgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgc3VwZXIuY2xlYXIoKTtcblxuICAgIHRoaXMuY2xlYXJXZWlnaHRzKCk7XG4gIH1cblxuICBjbGVhcldlaWdodHMoKSB7XG4gICAgdGhpcy5ncmFwaC5ub2RlcygpLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIG5vZGUud2VpZ2h0ID0gMDtcbiAgICB9KTtcbiAgfVxuXG4gIGRyYXdFZGdlV2VpZ2h0KGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgICBpZiAoc291cmNlID09IHRhcmdldClcbiAgICAgIHJldHVybjtcblxuICAgIHZhciBwcmVmaXggPSBzZXR0aW5ncygncHJlZml4JykgfHwgJycsXG4gICAgICBzaXplID0gZWRnZVtwcmVmaXggKyAnc2l6ZSddIHx8IDE7XG5cbiAgICBpZiAoc2l6ZSA8IHNldHRpbmdzKCdlZGdlTGFiZWxUaHJlc2hvbGQnKSlcbiAgICAgIHJldHVybjtcblxuICAgIGlmICgwID09PSBzZXR0aW5ncygnZWRnZUxhYmVsU2l6ZVBvd1JhdGlvJykpXG4gICAgICB0aHJvdyAnXCJlZGdlTGFiZWxTaXplUG93UmF0aW9cIiBtdXN0IG5vdCBiZSAwLic7XG5cbiAgICB2YXIgZm9udFNpemUsXG4gICAgICB4ID0gKHNvdXJjZVtwcmVmaXggKyAneCddICsgdGFyZ2V0W3ByZWZpeCArICd4J10pIC8gMixcbiAgICAgIHkgPSAoc291cmNlW3ByZWZpeCArICd5J10gKyB0YXJnZXRbcHJlZml4ICsgJ3knXSkgLyAyLFxuICAgICAgZFggPSB0YXJnZXRbcHJlZml4ICsgJ3gnXSAtIHNvdXJjZVtwcmVmaXggKyAneCddLFxuICAgICAgZFkgPSB0YXJnZXRbcHJlZml4ICsgJ3knXSAtIHNvdXJjZVtwcmVmaXggKyAneSddLFxuICAgICAgYW5nbGUgPSBNYXRoLmF0YW4yKGRZLCBkWCk7XG5cbiAgICBmb250U2l6ZSA9IChzZXR0aW5ncygnZWRnZUxhYmVsU2l6ZScpID09PSAnZml4ZWQnKSA/XG4gICAgICBzZXR0aW5ncygnZGVmYXVsdEVkZ2VMYWJlbFNpemUnKSA6XG4gICAgc2V0dGluZ3MoJ2RlZmF1bHRFZGdlTGFiZWxTaXplJykgKlxuICAgIHNpemUgKlxuICAgIE1hdGgucG93KHNpemUsIC0xIC8gc2V0dGluZ3MoJ2VkZ2VMYWJlbFNpemVQb3dSYXRpbycpKTtcblxuICAgIGNvbnRleHQuc2F2ZSgpO1xuXG4gICAgaWYgKGVkZ2UuYWN0aXZlKSB7XG4gICAgICBjb250ZXh0LmZvbnQgPSBbXG4gICAgICAgIHNldHRpbmdzKCdhY3RpdmVGb250U3R5bGUnKSxcbiAgICAgICAgZm9udFNpemUgKyAncHgnLFxuICAgICAgICBzZXR0aW5ncygnYWN0aXZlRm9udCcpIHx8IHNldHRpbmdzKCdmb250JylcbiAgICAgIF0uam9pbignICcpO1xuXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LmZvbnQgPSBbXG4gICAgICAgIHNldHRpbmdzKCdmb250U3R5bGUnKSxcbiAgICAgICAgZm9udFNpemUgKyAncHgnLFxuICAgICAgICBzZXR0aW5ncygnZm9udCcpXG4gICAgICBdLmpvaW4oJyAnKTtcblxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICB9XG5cbiAgICBjb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIGNvbnRleHQudGV4dEJhc2VsaW5lID0gJ2FscGhhYmV0aWMnO1xuXG4gICAgY29udGV4dC50cmFuc2xhdGUoeCwgeSk7XG4gICAgY29udGV4dC5yb3RhdGUoYW5nbGUpO1xuICAgIGNvbnRleHQuZmlsbFRleHQoXG4gICAgICBlZGdlLndlaWdodCxcbiAgICAgIDAsXG4gICAgICAoLXNpemUgLyAyKSAtIDNcbiAgICApO1xuXG4gICAgY29udGV4dC5yZXN0b3JlKCk7XG4gIH1cblxuICBkcmF3Tm9kZVdlaWdodChub2RlLCBjb250ZXh0LCBzZXR0aW5ncykge1xuICAgIHZhciBmb250U2l6ZSxcbiAgICAgIHByZWZpeCA9IHNldHRpbmdzKCdwcmVmaXgnKSB8fCAnJyxcbiAgICAgIHNpemUgPSBub2RlW3ByZWZpeCArICdzaXplJ107XG5cbiAgICBpZiAoc2l6ZSA8IHNldHRpbmdzKCdsYWJlbFRocmVzaG9sZCcpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9udFNpemUgPSAoc2V0dGluZ3MoJ2xhYmVsU2l6ZScpID09PSAnZml4ZWQnKSA/XG4gICAgICBzZXR0aW5ncygnZGVmYXVsdExhYmVsU2l6ZScpIDpcbiAgICBzZXR0aW5ncygnbGFiZWxTaXplUmF0aW8nKSAqIHNpemU7XG5cbiAgICBjb250ZXh0LmZvbnQgPSAoc2V0dGluZ3MoJ2ZvbnRTdHlsZScpID8gc2V0dGluZ3MoJ2ZvbnRTdHlsZScpICsgJyAnIDogJycpICtcbiAgICAgIGZvbnRTaXplICsgJ3B4ICcgKyBzZXR0aW5ncygnZm9udCcpO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gKHNldHRpbmdzKCdsYWJlbENvbG9yJykgPT09ICdub2RlJykgP1xuICAgICAgKG5vZGUuY29sb3IgfHwgc2V0dGluZ3MoJ2RlZmF1bHROb2RlQ29sb3InKSkgOlxuICAgICAgc2V0dGluZ3MoJ2RlZmF1bHRMYWJlbENvbG9yJyk7XG5cbiAgICBjb250ZXh0LnRleHRBbGlnbiA9ICdsZWZ0JztcbiAgICBjb250ZXh0LmZpbGxUZXh0KFxuICAgICAgbm9kZS53ZWlnaHQsXG4gICAgICBNYXRoLnJvdW5kKG5vZGVbcHJlZml4ICsgJ3gnXSArIHNpemUgKiAxLjUpLFxuICAgICAgTWF0aC5yb3VuZChub2RlW3ByZWZpeCArICd5J10gKyBmb250U2l6ZSAvIDMpXG4gICAgKTtcbiAgfVxufVxuXG5jb25zdCBpbml0VmlldyA9ICh0cmFjZXIpID0+IHtcbiAgdHJhY2VyLnMuc2V0dGluZ3Moe1xuICAgIGVkZ2VMYWJlbFNpemU6ICdwcm9wb3J0aW9uYWwnLFxuICAgIGRlZmF1bHRFZGdlTGFiZWxTaXplOiAyMCxcbiAgICBlZGdlTGFiZWxTaXplUG93UmF0aW86IDAuOCxcbiAgICBmdW5jTGFiZWxzRGVmKG5vZGUsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgICB0cmFjZXIuZHJhd05vZGVXZWlnaHQobm9kZSwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgdHJhY2VyLmRyYXdMYWJlbChub2RlLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gICAgfSxcbiAgICBmdW5jSG92ZXJzRGVmKG5vZGUsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgICB0cmFjZXIuZHJhd09uSG92ZXIobm9kZSwgY29udGV4dCwgc2V0dGluZ3MsIHRyYWNlci5kcmF3RWRnZVdlaWdodCk7XG4gICAgfSxcbiAgICBmdW5jRWRnZXNBcnJvdyhlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgICAgIHZhciBjb2xvciA9IHRyYWNlci5nZXRDb2xvcihlZGdlLCBzb3VyY2UsIHRhcmdldCwgc2V0dGluZ3MpO1xuICAgICAgdHJhY2VyLmRyYXdBcnJvdyhlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgIHRyYWNlci5kcmF3RWRnZVdlaWdodChlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBXZWlnaHRlZERpcmVjdGVkR3JhcGhUcmFjZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFdlaWdodGVkRGlyZWN0ZWRHcmFwaFRyYWNlciA9IHJlcXVpcmUoJy4vd2VpZ2h0ZWRfZGlyZWN0ZWRfZ3JhcGgnKTtcbmNvbnN0IFVuZGlyZWN0ZWRHcmFwaFRyYWNlciA9IHJlcXVpcmUoJy4vdW5kaXJlY3RlZF9ncmFwaCcpO1xuXG5jbGFzcyBXZWlnaHRlZFVuZGlyZWN0ZWRHcmFwaFRyYWNlciBleHRlbmRzIFdlaWdodGVkRGlyZWN0ZWRHcmFwaFRyYWNlciB7XG4gIHN0YXRpYyBnZXRDbGFzc05hbWUoKSB7XG4gICAgcmV0dXJuICdXZWlnaHRlZFVuZGlyZWN0ZWRHcmFwaFRyYWNlcic7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgc3VwZXIobmFtZSk7XG5cbiAgICB0aGlzLmUgPSBVbmRpcmVjdGVkR3JhcGhUcmFjZXIucHJvdG90eXBlLmU7XG4gICAgdGhpcy5kcmF3T25Ib3ZlciA9IFVuZGlyZWN0ZWRHcmFwaFRyYWNlci5wcm90b3R5cGUuZHJhd09uSG92ZXI7XG4gICAgdGhpcy5kcmF3RWRnZSA9IFVuZGlyZWN0ZWRHcmFwaFRyYWNlci5wcm90b3R5cGUuZHJhd0VkZ2U7XG5cbiAgICBpZiAodGhpcy5pc05ldykgaW5pdFZpZXcodGhpcyk7XG4gIH1cblxuICBzZXRUcmVlRGF0YShHLCByb290KSB7XG4gICAgcmV0dXJuIHN1cGVyLnNldFRyZWVEYXRhKEcsIHJvb3QsIHRydWUpO1xuICB9XG5cbiAgc2V0RGF0YShHKSB7XG4gICAgcmV0dXJuIHN1cGVyLnNldERhdGEoRywgdHJ1ZSk7XG4gIH1cblxuICBkcmF3RWRnZVdlaWdodChlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgdmFyIHByZWZpeCA9IHNldHRpbmdzKCdwcmVmaXgnKSB8fCAnJztcbiAgICBpZiAoc291cmNlW3ByZWZpeCArICd4J10gPiB0YXJnZXRbcHJlZml4ICsgJ3gnXSkge1xuICAgICAgdmFyIHRlbXAgPSBzb3VyY2U7XG4gICAgICBzb3VyY2UgPSB0YXJnZXQ7XG4gICAgICB0YXJnZXQgPSB0ZW1wO1xuICAgIH1cbiAgICBXZWlnaHRlZERpcmVjdGVkR3JhcGhUcmFjZXIucHJvdG90eXBlLmRyYXdFZGdlV2VpZ2h0LmNhbGwodGhpcywgZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gIH1cbn1cblxuY29uc3QgaW5pdFZpZXcgPSAodHJhY2VyKSA9PiB7XG4gIHRyYWNlci5zLnNldHRpbmdzKHtcbiAgICBkZWZhdWx0RWRnZVR5cGU6ICdkZWYnLFxuICAgIGZ1bmNFZGdlc0RlZihlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgICAgIHZhciBjb2xvciA9IHRyYWNlci5nZXRDb2xvcihlZGdlLCBzb3VyY2UsIHRhcmdldCwgc2V0dGluZ3MpO1xuICAgICAgdHJhY2VyLmRyYXdFZGdlKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgdHJhY2VyLmRyYXdFZGdlV2VpZ2h0KGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdlaWdodGVkVW5kaXJlY3RlZEdyYXBoVHJhY2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCByZXF1ZXN0ID0gcmVxdWlyZSgnLi9yZXF1ZXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKHVybCkgPT4ge1xuICByZXR1cm4gcmVxdWVzdCh1cmwsIHtcbiAgICB0eXBlOiAnR0VUJ1xuICB9KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCByZXF1ZXN0ID0gcmVxdWlyZSgnLi9yZXF1ZXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXJsKSB7XG4gIHJldHVybiByZXF1ZXN0KHVybCwge1xuICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgdHlwZTogJ0dFVCdcbiAgfSk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcmVxdWVzdCA9IHJlcXVpcmUoJy4vcmVxdWVzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVybCwgZGF0YSkge1xuICByZXR1cm4gcmVxdWVzdCh1cmwsIHtcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIHR5cGU6ICdQT1NUJyxcbiAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgfSk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUlNWUCA9IHJlcXVpcmUoJ3JzdnAnKTtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJy4uLy4uL2FwcCcpO1xuXG5jb25zdCB7XG4gIGFqYXgsXG4gIGV4dGVuZFxufSA9ICQ7XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVybCwgb3B0aW9ucyA9IHt9KSB7XG4gIGFwcC5zZXRJc0xvYWRpbmcodHJ1ZSk7XG5cbiAgcmV0dXJuIG5ldyBSU1ZQLlByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGNhbGxiYWNrcyA9IHtcbiAgICAgIHN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICAgICAgYXBwLnNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgfSxcbiAgICAgIGVycm9yKHJlYXNvbikge1xuICAgICAgICBhcHAuc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9wdHMgPSBleHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zLCBjYWxsYmFja3MsIHtcbiAgICAgIHVybFxuICAgIH0pO1xuXG4gICAgYWpheChvcHRzKTtcbiAgfSk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vYXBwJyk7XG5jb25zdCBUb2FzdCA9IHJlcXVpcmUoJy4uL2RvbS90b2FzdCcpO1xuXG5jb25zdCBjaGVja0xvYWRpbmcgPSAoKSA9PiB7XG4gIGlmIChhcHAuZ2V0SXNMb2FkaW5nKCkpIHtcbiAgICBUb2FzdC5zaG93RXJyb3JUb2FzdCgnV2FpdCB1bnRpbCBpdCBjb21wbGV0ZXMgbG9hZGluZyBvZiBwcmV2aW91cyBmaWxlLicpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldFBhcmFtZXRlckJ5TmFtZSA9IChuYW1lKSA9PiB7XG4gIGNvbnN0IHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYFs/Jl0ke25hbWV9KD0oW14mI10qKXwmfCN8JClgKTtcblxuICBjb25zdCByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xuXG4gIGlmICghcmVzdWx0cyB8fCByZXN1bHRzLmxlbmd0aCAhPT0gMykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgWywgLCBpZF0gPSByZXN1bHRzO1xuXG4gIHJldHVybiBpZDtcbn07XG5cbmNvbnN0IGdldEhhc2hWYWx1ZSA9IChrZXkpPT4ge1xuICBpZiAoIWtleSkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSk7XG4gIGNvbnN0IHBhcmFtcyA9IGhhc2ggPyBoYXNoLnNwbGl0KCcmJykgOiBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwYWlyID0gcGFyYW1zW2ldLnNwbGl0KCc9Jyk7XG4gICAgaWYgKHBhaXJbMF0gPT09IGtleSkge1xuICAgICAgcmV0dXJuIHBhaXJbMV07XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuY29uc3Qgc2V0SGFzaFZhbHVlID0gKGtleSwgdmFsdWUpPT4ge1xuICBpZiAoIWtleSB8fCAhdmFsdWUpIHJldHVybjtcbiAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKTtcbiAgY29uc3QgcGFyYW1zID0gaGFzaCA/IGhhc2guc3BsaXQoJyYnKSA6IFtdO1xuXG4gIGxldCBmb3VuZCA9IGZhbHNlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGggJiYgIWZvdW5kOyBpKyspIHtcbiAgICBjb25zdCBwYWlyID0gcGFyYW1zW2ldLnNwbGl0KCc9Jyk7XG4gICAgaWYgKHBhaXJbMF0gPT09IGtleSkge1xuICAgICAgcGFpclsxXSA9IHZhbHVlO1xuICAgICAgcGFyYW1zW2ldID0gcGFpci5qb2luKCc9Jyk7XG4gICAgICBmb3VuZCA9IHRydWU7XG4gICAgfVxuICB9XG4gIGlmICghZm91bmQpIHtcbiAgICBwYXJhbXMucHVzaChba2V5LCB2YWx1ZV0uam9pbignPScpKTtcbiAgfVxuXG4gIGNvbnN0IG5ld0hhc2ggPSBwYXJhbXMuam9pbignJicpO1xuICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGAjJHtuZXdIYXNofWA7XG59O1xuXG5jb25zdCByZW1vdmVIYXNoVmFsdWUgPSAoa2V5KSA9PiB7XG4gIGlmICgha2V5KSByZXR1cm47XG4gIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSk7XG4gIGNvbnN0IHBhcmFtcyA9IGhhc2ggPyBoYXNoLnNwbGl0KCcmJykgOiBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHBhaXIgPSBwYXJhbXNbaV0uc3BsaXQoJz0nKTtcbiAgICBpZiAocGFpclswXSA9PT0ga2V5KSB7XG4gICAgICBwYXJhbXMuc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbmV3SGFzaCA9IHBhcmFtcy5qb2luKCcmJyk7XG4gIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gYCMke25ld0hhc2h9YDtcbn07XG5cbmNvbnN0IHNldFBhdGggPSAoY2F0ZWdvcnksIGFsZ29yaXRobSwgZmlsZSkgPT4ge1xuICBjb25zdCBwYXRoID0gY2F0ZWdvcnkgPyBjYXRlZ29yeSArIChhbGdvcml0aG0gPyBgLyR7YWxnb3JpdGhtfWAgKyAoZmlsZSA/IGAvJHtmaWxlfWAgOiAnJykgOiAnJykgOiAnJztcbiAgc2V0SGFzaFZhbHVlKCdwYXRoJywgcGF0aCk7XG59O1xuXG5jb25zdCBnZXRQYXRoID0gKCkgPT4ge1xuICBjb25zdCBoYXNoID0gZ2V0SGFzaFZhbHVlKCdwYXRoJyk7XG4gIGlmIChoYXNoKSB7XG4gICAgY29uc3QgWyBjYXRlZ29yeSwgYWxnb3JpdGhtLCBmaWxlIF0gPSBoYXNoLnNwbGl0KCcvJyk7XG4gICAgcmV0dXJuIHsgY2F0ZWdvcnksIGFsZ29yaXRobSwgZmlsZSB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNoZWNrTG9hZGluZyxcbiAgZ2V0UGFyYW1ldGVyQnlOYW1lLFxuICBnZXRIYXNoVmFsdWUsXG4gIHNldEhhc2hWYWx1ZSxcbiAgcmVtb3ZlSGFzaFZhbHVlLFxuICBzZXRQYXRoLFxuICBnZXRQYXRoXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBsb2FkQWxnb3JpdGhtID0gcmVxdWlyZSgnLi9sb2FkX2FsZ29yaXRobScpO1xuY29uc3QgbG9hZENhdGVnb3JpZXMgPSByZXF1aXJlKCcuL2xvYWRfY2F0ZWdvcmllcycpO1xuY29uc3QgbG9hZEZpbGUgPSByZXF1aXJlKCcuL2xvYWRfZmlsZScpO1xuY29uc3QgbG9hZFNjcmF0Y2hQYXBlciA9IHJlcXVpcmUoJy4vbG9hZF9zY3JhdGNoX3BhcGVyJyk7XG5jb25zdCBzaGFyZVNjcmF0Y2hQYXBlciA9IHJlcXVpcmUoJy4vc2hhcmVfc2NyYXRjaF9wYXBlcicpO1xuY29uc3QgbG9hZFdpa2lMaXN0ID0gcmVxdWlyZSgnLi9sb2FkX3dpa2lfbGlzdCcpO1xuY29uc3QgbG9hZFdpa2kgPSByZXF1aXJlKCcuL2xvYWRfd2lraScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9hZEFsZ29yaXRobSxcbiAgbG9hZENhdGVnb3JpZXMsXG4gIGxvYWRGaWxlLFxuICBsb2FkU2NyYXRjaFBhcGVyLFxuICBzaGFyZVNjcmF0Y2hQYXBlcixcbiAgbG9hZFdpa2lMaXN0LFxuICBsb2FkV2lraVxufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGdldEpTT04gPSByZXF1aXJlKCcuL2FqYXgvZ2V0X2pzb24nKTtcblxuY29uc3Qge1xuICBnZXRBbGdvcml0aG1EaXJcbn0gPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChjYXRlZ29yeSwgYWxnb3JpdGhtKSA9PiB7XG4gIGNvbnN0IGRpciA9IGdldEFsZ29yaXRobURpcihjYXRlZ29yeSwgYWxnb3JpdGhtKTtcbiAgcmV0dXJuIGdldEpTT04oYCR7ZGlyfWRlc2MuanNvbmApO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGdldEpTT04gPSByZXF1aXJlKCcuL2FqYXgvZ2V0X2pzb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIHJldHVybiBnZXRKU09OKCcuL2FsZ29yaXRobS9jYXRlZ29yeS5qc29uJyk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUlNWUCA9IHJlcXVpcmUoJ3JzdnAnKTtcblxuY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vYXBwJyk7XG5cbmNvbnN0IHtcbiAgZ2V0RmlsZURpcixcbiAgaXNTY3JhdGNoUGFwZXJcbn0gPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5jb25zdCB7XG4gIGNoZWNrTG9hZGluZyxcbiAgc2V0UGF0aFxufSA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG5jb25zdCBnZXQgPSByZXF1aXJlKCcuL2FqYXgvZ2V0Jyk7XG5cbmNvbnN0IGxvYWREYXRhQW5kQ29kZSA9IChkaXIpID0+IHtcbiAgcmV0dXJuIFJTVlAuaGFzaCh7XG4gICAgZGF0YTogZ2V0KGAke2Rpcn1kYXRhLmpzYCksXG4gICAgY29kZTogZ2V0KGAke2Rpcn1jb2RlLmpzYClcbiAgfSk7XG59O1xuXG5jb25zdCBsb2FkRmlsZUFuZFVwZGF0ZUNvbnRlbnQgPSAoZGlyKSA9PiB7XG4gIGFwcC5nZXRFZGl0b3IoKS5jbGVhckNvbnRlbnQoKTtcblxuICByZXR1cm4gbG9hZERhdGFBbmRDb2RlKGRpcikudGhlbigoY29udGVudCkgPT4ge1xuICAgIGFwcC51cGRhdGVDYWNoZWRGaWxlKGRpciwgY29udGVudCk7XG4gICAgYXBwLmdldEVkaXRvcigpLnNldENvbnRlbnQoY29udGVudCk7XG4gIH0pO1xufTtcblxuY29uc3QgY2FjaGVkQ29udGVudEV4aXN0cyA9IChjYWNoZWRGaWxlKSA9PiB7XG4gIHJldHVybiBjYWNoZWRGaWxlICYmXG4gICAgY2FjaGVkRmlsZS5kYXRhICE9PSB1bmRlZmluZWQgJiZcbiAgICBjYWNoZWRGaWxlLmNvZGUgIT09IHVuZGVmaW5lZDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gKGNhdGVnb3J5LCBhbGdvcml0aG0sIGZpbGUsIGV4cGxhbmF0aW9uKSA9PiB7XG4gIHJldHVybiBuZXcgUlNWUC5Qcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoY2hlY2tMb2FkaW5nKCkpIHtcbiAgICAgIHJlamVjdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaXNTY3JhdGNoUGFwZXIoY2F0ZWdvcnkpKSB7XG4gICAgICAgIHNldFBhdGgoY2F0ZWdvcnksIGFwcC5nZXRMb2FkZWRTY3JhdGNoKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0UGF0aChjYXRlZ29yeSwgYWxnb3JpdGhtLCBmaWxlKTtcbiAgICAgIH1cbiAgICAgICQoJyNleHBsYW5hdGlvbicpLmh0bWwoZXhwbGFuYXRpb24pO1xuXG4gICAgICBsZXQgZGlyID0gZ2V0RmlsZURpcihjYXRlZ29yeSwgYWxnb3JpdGhtLCBmaWxlKTtcbiAgICAgIGFwcC5zZXRMYXN0RmlsZVVzZWQoZGlyKTtcbiAgICAgIGNvbnN0IGNhY2hlZEZpbGUgPSBhcHAuZ2V0Q2FjaGVkRmlsZShkaXIpO1xuXG4gICAgICBpZiAoY2FjaGVkQ29udGVudEV4aXN0cyhjYWNoZWRGaWxlKSkge1xuICAgICAgICBhcHAuZ2V0RWRpdG9yKCkuc2V0Q29udGVudChjYWNoZWRGaWxlKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9hZEZpbGVBbmRVcGRhdGVDb250ZW50KGRpcikudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUlNWUCA9IHJlcXVpcmUoJ3JzdnAnKTtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJy4uL2FwcCcpO1xuXG5jb25zdCB7XG4gIGdldEZpbGVEaXJcbn0gPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5jb25zdCBnZXRKU09OID0gcmVxdWlyZSgnLi9hamF4L2dldF9qc29uJyk7XG5jb25zdCBsb2FkQWxnb3JpdGhtID0gcmVxdWlyZSgnLi9sb2FkX2FsZ29yaXRobScpO1xuXG5jb25zdCBleHRyYWN0R2lzdENvZGUgPSAoZmlsZXMsIG5hbWUpID0+IGZpbGVzW2Ake25hbWV9LmpzYF0uY29udGVudDtcblxubW9kdWxlLmV4cG9ydHMgPSAoZ2lzdElEKSA9PiB7XG4gIHJldHVybiBuZXcgUlNWUC5Qcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBhcHAuc2V0TG9hZGVkU2NyYXRjaChnaXN0SUQpO1xuXG4gICAgZ2V0SlNPTihgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9naXN0cy8ke2dpc3RJRH1gKS50aGVuKCh7XG4gICAgICBmaWxlc1xuICAgIH0pID0+IHtcblxuICAgICAgY29uc3QgY2F0ZWdvcnkgPSAnc2NyYXRjaCc7XG4gICAgICBjb25zdCBhbGdvcml0aG0gPSBnaXN0SUQ7XG5cbiAgICAgIGxvYWRBbGdvcml0aG0oY2F0ZWdvcnksIGFsZ29yaXRobSkudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGFsZ29EYXRhID0gZXh0cmFjdEdpc3RDb2RlKGZpbGVzLCAnZGF0YScpO1xuICAgICAgICBjb25zdCBhbGdvQ29kZSA9IGV4dHJhY3RHaXN0Q29kZShmaWxlcywgJ2NvZGUnKTtcblxuICAgICAgICAvLyB1cGRhdGUgc2NyYXRjaCBwYXBlciBhbGdvIGNvZGUgd2l0aCB0aGUgbG9hZGVkIGdpc3QgY29kZVxuICAgICAgICBjb25zdCBkaXIgPSBnZXRGaWxlRGlyKGNhdGVnb3J5LCBhbGdvcml0aG0sICdzY3JhdGNoX3BhcGVyJyk7XG4gICAgICAgIGFwcC51cGRhdGVDYWNoZWRGaWxlKGRpciwge1xuICAgICAgICAgIGRhdGE6IGFsZ29EYXRhLFxuICAgICAgICAgIGNvZGU6IGFsZ29Db2RlLFxuICAgICAgICAgICdDUkVESVQubWQnOiAnU2hhcmVkIGJ5IGFuIGFub255bW91cyB1c2VyIGZyb20gaHR0cDovL3BhcmtqczgxNC5naXRodWIuaW8vQWxnb3JpdGhtVmlzdWFsaXplcidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgYWxnb3JpdGhtLFxuICAgICAgICAgIGRhdGFcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBnZXQgPSByZXF1aXJlKCcuL2FqYXgvZ2V0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKHdpa2kpID0+IHtcbiAgcmV0dXJuIGdldChgLi9BbGdvcml0aG1WaXN1YWxpemVyLndpa2kvJHt3aWtpfS5tZGApO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGdldEpTT04gPSByZXF1aXJlKCcuL2FqYXgvZ2V0X2pzb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIHJldHVybiBnZXRKU09OKCcuL3dpa2kuanNvbicpO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJTVlAgPSByZXF1aXJlKCdyc3ZwJyk7XG5jb25zdCBhcHAgPSByZXF1aXJlKCcuLi9hcHAnKTtcblxuY29uc3QgcG9zdEpTT04gPSByZXF1aXJlKCcuL2FqYXgvcG9zdF9qc29uJyk7XG5cbmNvbnN0IHtcbiAgc2V0UGF0aFxufSA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgcmV0dXJuIG5ldyBSU1ZQLlByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgY29uc3Qge1xuICAgICAgZGF0YUVkaXRvcixcbiAgICAgIGNvZGVFZGl0b3JcbiAgICB9ID0gYXBwLmdldEVkaXRvcigpO1xuXG4gICAgY29uc3QgZ2lzdCA9IHtcbiAgICAgICdkZXNjcmlwdGlvbic6ICd0ZW1wJyxcbiAgICAgICdwdWJsaWMnOiB0cnVlLFxuICAgICAgJ2ZpbGVzJzoge1xuICAgICAgICAnZGF0YS5qcyc6IHtcbiAgICAgICAgICAnY29udGVudCc6IGRhdGFFZGl0b3IuZ2V0VmFsdWUoKVxuICAgICAgICB9LFxuICAgICAgICAnY29kZS5qcyc6IHtcbiAgICAgICAgICAnY29udGVudCc6IGNvZGVFZGl0b3IuZ2V0VmFsdWUoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHBvc3RKU09OKCdodHRwczovL2FwaS5naXRodWIuY29tL2dpc3RzJywgZ2lzdCkudGhlbigoe1xuICAgICAgaWRcbiAgICB9KSA9PiB7XG4gICAgICBhcHAuc2V0TG9hZGVkU2NyYXRjaChpZCk7XG4gICAgICBzZXRQYXRoKCdzY3JhdGNoJywgaWQpO1xuICAgICAgY29uc3Qge1xuICAgICAgICBocmVmXG4gICAgICB9ID0gbG9jYXRpb247XG4gICAgICAkKCcjYWxnb3JpdGhtJykuaHRtbCgnU2hhcmVkJyk7XG4gICAgICByZXNvbHZlKGhyZWYpO1xuICAgIH0pO1xuICB9KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBUcmFjZXJNYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyJyk7XG5jb25zdCBUcmFjZXIgPSByZXF1aXJlKCcuLi9tb2R1bGUvdHJhY2VyL3RyYWNlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBpbml0KCkge1xuICAgIGNvbnN0IHRtID0gbmV3IFRyYWNlck1hbmFnZXIoKTtcbiAgICBUcmFjZXIucHJvdG90eXBlLm1hbmFnZXIgPSB0bTtcbiAgICByZXR1cm4gdG07XG4gIH1cblxufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IE1vZHVsZUNvbnRhaW5lciA9IHJlcXVpcmUoJy4uL2RvbS9tb2R1bGVfY29udGFpbmVyJyk7XG5jb25zdCBUb3BNZW51ID0gcmVxdWlyZSgnLi4vZG9tL3RvcF9tZW51Jyk7XG5cbmNvbnN0IHtcbiAgZWFjaCxcbiAgZXh0ZW5kLFxuICBncmVwXG59ID0gJDtcblxuY29uc3Qgc3RlcExpbWl0ID0gMWU2O1xuXG5jb25zdCBUcmFjZXJNYW5hZ2VyID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnRpbWVyID0gbnVsbDtcbiAgdGhpcy5wYXVzZSA9IGZhbHNlO1xuICB0aGlzLmNhcHN1bGVzID0gW107XG4gIHRoaXMuaW50ZXJ2YWwgPSA1MDA7XG59O1xuXG5UcmFjZXJNYW5hZ2VyLnByb3RvdHlwZSA9IHtcblxuICBhZGQodHJhY2VyKSB7XG5cbiAgICBjb25zdCAkY29udGFpbmVyID0gTW9kdWxlQ29udGFpbmVyLmNyZWF0ZSgpO1xuXG4gICAgY29uc3QgY2Fwc3VsZSA9IHtcbiAgICAgIG1vZHVsZTogdHJhY2VyLm1vZHVsZSxcbiAgICAgIHRyYWNlcixcbiAgICAgIGFsbG9jYXRlZDogdHJ1ZSxcbiAgICAgIGRlZmF1bHROYW1lOiBudWxsLFxuICAgICAgJGNvbnRhaW5lcixcbiAgICAgIGlzTmV3OiB0cnVlXG4gICAgfTtcblxuICAgIHRoaXMuY2Fwc3VsZXMucHVzaChjYXBzdWxlKTtcbiAgICByZXR1cm4gY2Fwc3VsZTtcbiAgfSxcblxuICBhbGxvY2F0ZShuZXdUcmFjZXIpIHtcbiAgICBsZXQgc2VsZWN0ZWRDYXBzdWxlID0gbnVsbDtcbiAgICBsZXQgY291bnQgPSAwO1xuXG4gICAgZWFjaCh0aGlzLmNhcHN1bGVzLCAoaSwgY2Fwc3VsZSkgPT4ge1xuICAgICAgaWYgKGNhcHN1bGUubW9kdWxlID09PSBuZXdUcmFjZXIubW9kdWxlKSB7XG4gICAgICAgIGNvdW50Kys7XG4gICAgICAgIGlmICghY2Fwc3VsZS5hbGxvY2F0ZWQpIHtcbiAgICAgICAgICBjYXBzdWxlLnRyYWNlciA9IG5ld1RyYWNlcjtcbiAgICAgICAgICBjYXBzdWxlLmFsbG9jYXRlZCA9IHRydWU7XG4gICAgICAgICAgY2Fwc3VsZS5pc05ldyA9IGZhbHNlO1xuICAgICAgICAgIHNlbGVjdGVkQ2Fwc3VsZSA9IGNhcHN1bGU7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoc2VsZWN0ZWRDYXBzdWxlID09PSBudWxsKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgc2VsZWN0ZWRDYXBzdWxlID0gdGhpcy5hZGQobmV3VHJhY2VyKTtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc05hbWUgPSBuZXdUcmFjZXIubW9kdWxlLmdldENsYXNzTmFtZSgpO1xuICAgIHNlbGVjdGVkQ2Fwc3VsZS5kZWZhdWx0TmFtZSA9IGAke2NsYXNzTmFtZX0gJHtjb3VudH1gO1xuICAgIHNlbGVjdGVkQ2Fwc3VsZS5vcmRlciA9IHRoaXMub3JkZXIrKztcbiAgICByZXR1cm4gc2VsZWN0ZWRDYXBzdWxlO1xuICB9LFxuXG4gIGRlYWxsb2NhdGVBbGwoKSB7XG4gICAgdGhpcy5vcmRlciA9IDA7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIGVhY2godGhpcy5jYXBzdWxlcywgKGksIGNhcHN1bGUpID0+IHtcbiAgICAgIGNhcHN1bGUuYWxsb2NhdGVkID0gZmFsc2U7XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVtb3ZlVW5hbGxvY2F0ZWQoKSB7XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuY2Fwc3VsZXMgPSBncmVwKHRoaXMuY2Fwc3VsZXMsIChjYXBzdWxlKSA9PiB7XG4gICAgICBsZXQgcmVtb3ZlZCA9ICFjYXBzdWxlLmFsbG9jYXRlZDtcblxuICAgICAgaWYgKGNhcHN1bGUuaXNOZXcgfHwgcmVtb3ZlZCkge1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChyZW1vdmVkKSB7XG4gICAgICAgIGNhcHN1bGUuJGNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICFyZW1vdmVkO1xuICAgIH0pO1xuXG4gICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgIHRoaXMucGxhY2UoKTtcbiAgICB9XG4gIH0sXG5cbiAgcGxhY2UoKSB7XG4gICAgY29uc3Qge1xuICAgICAgY2Fwc3VsZXNcbiAgICB9ID0gdGhpcztcblxuICAgIGVhY2goY2Fwc3VsZXMsIChpLCBjYXBzdWxlKSA9PiB7XG4gICAgICBsZXQgd2lkdGggPSAxMDA7XG4gICAgICBsZXQgaGVpZ2h0ID0gKDEwMCAvIGNhcHN1bGVzLmxlbmd0aCk7XG4gICAgICBsZXQgdG9wID0gaGVpZ2h0ICogY2Fwc3VsZS5vcmRlcjtcblxuICAgICAgY2Fwc3VsZS4kY29udGFpbmVyLmNzcyh7XG4gICAgICAgIHRvcDogYCR7dG9wfSVgLFxuICAgICAgICB3aWR0aDogYCR7d2lkdGh9JWAsXG4gICAgICAgIGhlaWdodDogYCR7aGVpZ2h0fSVgXG4gICAgICB9KTtcblxuICAgICAgY2Fwc3VsZS50cmFjZXIucmVzaXplKCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVzaXplKCkge1xuICAgIHRoaXMuY29tbWFuZCgncmVzaXplJyk7XG4gIH0sXG5cbiAgaXNQYXVzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXVzZTtcbiAgfSxcblxuICBzZXRJbnRlcnZhbChpbnRlcnZhbCkge1xuICAgIFRvcE1lbnUuc2V0SW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICB9LFxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMudHJhY2VzID0gW107XG4gICAgdGhpcy50cmFjZUluZGV4ID0gLTE7XG4gICAgdGhpcy5zdGVwQ250ID0gMDtcbiAgICBpZiAodGhpcy50aW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuICAgIH1cbiAgICB0aGlzLmNvbW1hbmQoJ2NsZWFyJyk7XG4gIH0sXG5cbiAgcHVzaFN0ZXAoY2Fwc3VsZSwgc3RlcCkge1xuICAgIGlmICh0aGlzLnN0ZXBDbnQrKyA+IHN0ZXBMaW1pdCkgdGhyb3cgXCJUcmFjZXIncyBzdGFjayBvdmVyZmxvd1wiO1xuICAgIGxldCBsZW4gPSB0aGlzLnRyYWNlcy5sZW5ndGg7XG4gICAgbGV0IGxhc3QgPSBbXTtcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICB0aGlzLnRyYWNlcy5wdXNoKGxhc3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXN0ID0gdGhpcy50cmFjZXNbbGVuIC0gMV07XG4gICAgfVxuICAgIGxhc3QucHVzaChleHRlbmQoc3RlcCwge1xuICAgICAgY2Fwc3VsZVxuICAgIH0pKTtcbiAgfSxcblxuICBuZXdTdGVwKCkge1xuICAgIHRoaXMudHJhY2VzLnB1c2goW10pO1xuICB9LFxuXG4gIHBhdXNlU3RlcCgpIHtcbiAgICBpZiAodGhpcy50cmFjZUluZGV4IDwgMCkgcmV0dXJuO1xuICAgIHRoaXMucGF1c2UgPSB0cnVlO1xuICAgIGlmICh0aGlzLnRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lcik7XG4gICAgfVxuICAgIFRvcE1lbnUuYWN0aXZhdGVCdG5QYXVzZSgpO1xuICB9LFxuXG4gIHJlc3VtZVN0ZXAoKSB7XG4gICAgdGhpcy5wYXVzZSA9IGZhbHNlO1xuICAgIHRoaXMuc3RlcCh0aGlzLnRyYWNlSW5kZXggKyAxKTtcbiAgICBUb3BNZW51LmRlYWN0aXZhdGVCdG5QYXVzZSgpO1xuICB9LFxuXG4gIHN0ZXAoaSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgdHJhY2VyID0gdGhpcztcblxuICAgIGlmIChpc05hTihpKSB8fCBpID49IHRoaXMudHJhY2VzLmxlbmd0aCB8fCBpIDwgMCkgcmV0dXJuO1xuXG4gICAgdGhpcy50cmFjZUluZGV4ID0gaTtcbiAgICBjb25zdCB0cmFjZSA9IHRoaXMudHJhY2VzW2ldO1xuICAgIHRyYWNlLmZvckVhY2goKHN0ZXApID0+IHtcbiAgICAgIHN0ZXAuY2Fwc3VsZS50cmFjZXIucHJvY2Vzc1N0ZXAoc3RlcCwgb3B0aW9ucyk7XG4gICAgfSk7XG5cbiAgICBpZiAoIW9wdGlvbnMudmlydHVhbCkge1xuICAgICAgdGhpcy5jb21tYW5kKCdyZWZyZXNoJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucGF1c2UpIHJldHVybjtcblxuICAgIHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghdHJhY2VyLm5leHRTdGVwKG9wdGlvbnMpKSB7XG4gICAgICAgIFRvcE1lbnUucmVzZXRUb3BNZW51QnV0dG9ucygpO1xuICAgICAgfVxuICAgIH0sIHRoaXMuaW50ZXJ2YWwpO1xuICB9LFxuXG4gIHByZXZTdGVwKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuY29tbWFuZCgnY2xlYXInKTtcblxuICAgIGNvbnN0IGZpbmFsSW5kZXggPSB0aGlzLnRyYWNlSW5kZXggLSAxO1xuICAgIGlmIChmaW5hbEluZGV4IDwgMCkge1xuICAgICAgdGhpcy50cmFjZUluZGV4ID0gLTE7XG4gICAgICB0aGlzLmNvbW1hbmQoJ3JlZnJlc2gnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbmFsSW5kZXg7IGkrKykge1xuICAgICAgdGhpcy5zdGVwKGksIGV4dGVuZChvcHRpb25zLCB7XG4gICAgICAgIHZpcnR1YWw6IHRydWVcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0ZXAoZmluYWxJbmRleCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgbmV4dFN0ZXAob3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgZmluYWxJbmRleCA9IHRoaXMudHJhY2VJbmRleCArIDE7XG4gICAgaWYgKGZpbmFsSW5kZXggPj0gdGhpcy50cmFjZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnRyYWNlSW5kZXggPSB0aGlzLnRyYWNlcy5sZW5ndGggLSAxO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuc3RlcChmaW5hbEluZGV4LCBvcHRpb25zKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICB2aXN1YWxpemUoKSB7XG4gICAgdGhpcy50cmFjZUluZGV4ID0gLTE7XG4gICAgdGhpcy5yZXN1bWVTdGVwKCk7XG4gIH0sXG5cbiAgY29tbWFuZCguLi5hcmdzKSB7XG4gICAgY29uc3QgZnVuY3Rpb25OYW1lID0gYXJncy5zaGlmdCgpO1xuICAgIGVhY2godGhpcy5jYXBzdWxlcywgKGksIGNhcHN1bGUpID0+IHtcbiAgICAgIGlmIChjYXBzdWxlLmFsbG9jYXRlZCkge1xuICAgICAgICBjYXBzdWxlLnRyYWNlci5tb2R1bGUucHJvdG90eXBlW2Z1bmN0aW9uTmFtZV0uYXBwbHkoY2Fwc3VsZS50cmFjZXIsIGFyZ3MpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGZpbmRPd25lcihjb250YWluZXIpIHtcbiAgICBsZXQgc2VsZWN0ZWRDYXBzdWxlID0gbnVsbDtcbiAgICBlYWNoKHRoaXMuY2Fwc3VsZXMsIChpLCBjYXBzdWxlKSA9PiB7XG4gICAgICBpZiAoY2Fwc3VsZS4kY29udGFpbmVyWzBdID09PSBjb250YWluZXIpIHtcbiAgICAgICAgc2VsZWN0ZWRDYXBzdWxlID0gY2Fwc3VsZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzZWxlY3RlZENhcHN1bGUudHJhY2VyO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWNlck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHtcbiAgcGFyc2Vcbn0gPSBKU09OO1xuXG5jb25zdCBmcm9tSlNPTiA9IChvYmopID0+IHtcbiAgcmV0dXJuIHBhcnNlKG9iaiwgKGtleSwgdmFsdWUpID0+IHtcbiAgICByZXR1cm4gdmFsdWUgPT09ICdJbmZpbml0eScgPyBJbmZpbml0eSA6IHZhbHVlO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnJvbUpTT047XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHRvSlNPTiA9IHJlcXVpcmUoJy4vdG9fanNvbicpO1xuY29uc3QgZnJvbUpTT04gPSByZXF1aXJlKCcuL2Zyb21fanNvbicpO1xuY29uc3QgcmVmaW5lQnlUeXBlID0gcmVxdWlyZSgnLi9yZWZpbmVfYnlfdHlwZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdG9KU09OLFxuICBmcm9tSlNPTixcbiAgcmVmaW5lQnlUeXBlXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCByZWZpbmVCeVR5cGUgPSAoaXRlbSkgPT4ge1xuICBzd2l0Y2ggKHR5cGVvZihpdGVtKSkge1xuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gcmVmaW5lTnVtYmVyKGl0ZW0pO1xuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuIHJlZmluZUJvb2xlYW4oaXRlbSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiByZWZpbmVTdHJpbmcoaXRlbSk7XG4gIH1cbn07XG5cbmNvbnN0IHJlZmluZVN0cmluZyA9IChzdHIpID0+IHtcbiAgcmV0dXJuIHN0ciA9PT0gJycgPyAnICcgOiBzdHI7XG59O1xuXG5jb25zdCByZWZpbmVOdW1iZXIgPSAobnVtKSA9PiB7XG4gIHJldHVybiBudW0gPT09IEluZmluaXR5ID8gJ+KInicgOiBudW07XG59O1xuXG5jb25zdCByZWZpbmVCb29sZWFuID0gKGJvb2wpID0+IHtcbiAgcmV0dXJuIGJvb2wgPyAnVCcgOiAnRic7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlZmluZUJ5VHlwZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3Qge1xuICBzdHJpbmdpZnlcbn0gPSBKU09OO1xuXG5jb25zdCB0b0pTT04gPSAob2JqKSA9PiB7XG4gIHJldHVybiBzdHJpbmdpZnkob2JqLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gSW5maW5pdHkgPyAnSW5maW5pdHknIDogdmFsdWU7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0b0pTT047XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGlzU2NyYXRjaFBhcGVyID0gKGNhdGVnb3J5LCBhbGdvcml0aG0pID0+IHtcbiAgcmV0dXJuIGNhdGVnb3J5ID09ICdzY3JhdGNoJztcbn07XG5cbmNvbnN0IGdldEFsZ29yaXRobURpciA9IChjYXRlZ29yeSwgYWxnb3JpdGhtKSA9PiB7XG4gIGlmIChpc1NjcmF0Y2hQYXBlcihjYXRlZ29yeSkpIHJldHVybiAnLi9hbGdvcml0aG0vc2NyYXRjaF9wYXBlci8nO1xuICByZXR1cm4gYC4vYWxnb3JpdGhtLyR7Y2F0ZWdvcnl9LyR7YWxnb3JpdGhtfS9gO1xufTtcblxuY29uc3QgZ2V0RmlsZURpciA9IChjYXRlZ29yeSwgYWxnb3JpdGhtLCBmaWxlKSA9PiB7XG4gIGlmIChpc1NjcmF0Y2hQYXBlcihjYXRlZ29yeSkpIHJldHVybiAnLi9hbGdvcml0aG0vc2NyYXRjaF9wYXBlci8nO1xuICByZXR1cm4gYC4vYWxnb3JpdGhtLyR7Y2F0ZWdvcnl9LyR7YWxnb3JpdGhtfS8ke2ZpbGV9L2A7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNTY3JhdGNoUGFwZXIsXG4gIGdldEFsZ29yaXRobURpcixcbiAgZ2V0RmlsZURpclxufTsiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qIVxuICogQG92ZXJ2aWV3IFJTVlAgLSBhIHRpbnkgaW1wbGVtZW50YXRpb24gb2YgUHJvbWlzZXMvQSsuXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNCBZZWh1ZGEgS2F0eiwgVG9tIERhbGUsIFN0ZWZhbiBQZW5uZXIgYW5kIGNvbnRyaWJ1dG9yc1xuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3RpbGRlaW8vcnN2cC5qcy9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICAzLjIuMVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCR1dGlscyQkb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbicgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCR1dGlscyQkaXNGdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZSh4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRyc3ZwJHV0aWxzJCRfaXNBcnJheTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkpIHtcbiAgICAgIGxpYiRyc3ZwJHV0aWxzJCRfaXNBcnJheSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBsaWIkcnN2cCR1dGlscyQkX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuICAgIH1cblxuICAgIHZhciBsaWIkcnN2cCR1dGlscyQkaXNBcnJheSA9IGxpYiRyc3ZwJHV0aWxzJCRfaXNBcnJheTtcblxuICAgIHZhciBsaWIkcnN2cCR1dGlscyQkbm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJHV0aWxzJCRGKCkgeyB9XG5cbiAgICB2YXIgbGliJHJzdnAkdXRpbHMkJG9fY3JlYXRlID0gKE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlY29uZCBhcmd1bWVudCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG8gIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICBsaWIkcnN2cCR1dGlscyQkRi5wcm90b3R5cGUgPSBvO1xuICAgICAgcmV0dXJuIG5ldyBsaWIkcnN2cCR1dGlscyQkRigpO1xuICAgIH0pO1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGV2ZW50cyQkaW5kZXhPZihjYWxsYmFja3MsIGNhbGxiYWNrKSB7XG4gICAgICBmb3IgKHZhciBpPTAsIGw9Y2FsbGJhY2tzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrc1tpXSA9PT0gY2FsbGJhY2spIHsgcmV0dXJuIGk7IH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGV2ZW50cyQkY2FsbGJhY2tzRm9yKG9iamVjdCkge1xuICAgICAgdmFyIGNhbGxiYWNrcyA9IG9iamVjdC5fcHJvbWlzZUNhbGxiYWNrcztcblxuICAgICAgaWYgKCFjYWxsYmFja3MpIHtcbiAgICAgICAgY2FsbGJhY2tzID0gb2JqZWN0Ll9wcm9taXNlQ2FsbGJhY2tzID0ge307XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjYWxsYmFja3M7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRyc3ZwJGV2ZW50cyQkZGVmYXVsdCA9IHtcblxuICAgICAgLyoqXG4gICAgICAgIGBSU1ZQLkV2ZW50VGFyZ2V0Lm1peGluYCBleHRlbmRzIGFuIG9iamVjdCB3aXRoIEV2ZW50VGFyZ2V0IG1ldGhvZHMuIEZvclxuICAgICAgICBFeGFtcGxlOlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgdmFyIG9iamVjdCA9IHt9O1xuXG4gICAgICAgIFJTVlAuRXZlbnRUYXJnZXQubWl4aW4ob2JqZWN0KTtcblxuICAgICAgICBvYmplY3Qub24oJ2ZpbmlzaGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAvLyBoYW5kbGUgZXZlbnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ2ZpbmlzaGVkJywgeyBkZXRhaWw6IHZhbHVlIH0pO1xuICAgICAgICBgYGBcblxuICAgICAgICBgRXZlbnRUYXJnZXQubWl4aW5gIGFsc28gd29ya3Mgd2l0aCBwcm90b3R5cGVzOlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgdmFyIFBlcnNvbiA9IGZ1bmN0aW9uKCkge307XG4gICAgICAgIFJTVlAuRXZlbnRUYXJnZXQubWl4aW4oUGVyc29uLnByb3RvdHlwZSk7XG5cbiAgICAgICAgdmFyIHllaHVkYSA9IG5ldyBQZXJzb24oKTtcbiAgICAgICAgdmFyIHRvbSA9IG5ldyBQZXJzb24oKTtcblxuICAgICAgICB5ZWh1ZGEub24oJ3Bva2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdZZWh1ZGEgc2F5cyBPVycpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0b20ub24oJ3Bva2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdUb20gc2F5cyBPVycpO1xuICAgICAgICB9KTtcblxuICAgICAgICB5ZWh1ZGEudHJpZ2dlcigncG9rZScpO1xuICAgICAgICB0b20udHJpZ2dlcigncG9rZScpO1xuICAgICAgICBgYGBcblxuICAgICAgICBAbWV0aG9kIG1peGluXG4gICAgICAgIEBmb3IgUlNWUC5FdmVudFRhcmdldFxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge09iamVjdH0gb2JqZWN0IG9iamVjdCB0byBleHRlbmQgd2l0aCBFdmVudFRhcmdldCBtZXRob2RzXG4gICAgICAqL1xuICAgICAgJ21peGluJzogZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIG9iamVjdFsnb24nXSAgICAgID0gdGhpc1snb24nXTtcbiAgICAgICAgb2JqZWN0WydvZmYnXSAgICAgPSB0aGlzWydvZmYnXTtcbiAgICAgICAgb2JqZWN0Wyd0cmlnZ2VyJ10gPSB0aGlzWyd0cmlnZ2VyJ107XG4gICAgICAgIG9iamVjdC5fcHJvbWlzZUNhbGxiYWNrcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIGBldmVudE5hbWVgIGlzIHRyaWdnZXJlZFxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgb2JqZWN0Lm9uKCdldmVudCcsIGZ1bmN0aW9uKGV2ZW50SW5mbyl7XG4gICAgICAgICAgLy8gaGFuZGxlIHRoZSBldmVudFxuICAgICAgICB9KTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignZXZlbnQnKTtcbiAgICAgICAgYGBgXG5cbiAgICAgICAgQG1ldGhvZCBvblxuICAgICAgICBAZm9yIFJTVlAuRXZlbnRUYXJnZXRcbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZSBuYW1lIG9mIHRoZSBldmVudCB0byBsaXN0ZW4gZm9yXG4gICAgICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuXG4gICAgICAqL1xuICAgICAgJ29uJzogZnVuY3Rpb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYWxsQ2FsbGJhY2tzID0gbGliJHJzdnAkZXZlbnRzJCRjYWxsYmFja3NGb3IodGhpcyksIGNhbGxiYWNrcztcblxuICAgICAgICBjYWxsYmFja3MgPSBhbGxDYWxsYmFja3NbZXZlbnROYW1lXTtcblxuICAgICAgICBpZiAoIWNhbGxiYWNrcykge1xuICAgICAgICAgIGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGliJHJzdnAkZXZlbnRzJCRpbmRleE9mKGNhbGxiYWNrcywgY2FsbGJhY2spID09PSAtMSkge1xuICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgIFlvdSBjYW4gdXNlIGBvZmZgIHRvIHN0b3AgZmlyaW5nIGEgcGFydGljdWxhciBjYWxsYmFjayBmb3IgYW4gZXZlbnQ6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICBmdW5jdGlvbiBkb1N0dWZmKCkgeyAvLyBkbyBzdHVmZiEgfVxuICAgICAgICBvYmplY3Qub24oJ3N0dWZmJywgZG9TdHVmZik7XG5cbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ3N0dWZmJyk7IC8vIGRvU3R1ZmYgd2lsbCBiZSBjYWxsZWRcblxuICAgICAgICAvLyBVbnJlZ2lzdGVyIE9OTFkgdGhlIGRvU3R1ZmYgY2FsbGJhY2tcbiAgICAgICAgb2JqZWN0Lm9mZignc3R1ZmYnLCBkb1N0dWZmKTtcbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ3N0dWZmJyk7IC8vIGRvU3R1ZmYgd2lsbCBOT1QgYmUgY2FsbGVkXG4gICAgICAgIGBgYFxuXG4gICAgICAgIElmIHlvdSBkb24ndCBwYXNzIGEgYGNhbGxiYWNrYCBhcmd1bWVudCB0byBgb2ZmYCwgQUxMIGNhbGxiYWNrcyBmb3IgdGhlXG4gICAgICAgIGV2ZW50IHdpbGwgbm90IGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGV2ZW50IGZpcmVzLiBGb3IgZXhhbXBsZTpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIHZhciBjYWxsYmFjazEgPSBmdW5jdGlvbigpe307XG4gICAgICAgIHZhciBjYWxsYmFjazIgPSBmdW5jdGlvbigpe307XG5cbiAgICAgICAgb2JqZWN0Lm9uKCdzdHVmZicsIGNhbGxiYWNrMSk7XG4gICAgICAgIG9iamVjdC5vbignc3R1ZmYnLCBjYWxsYmFjazIpO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBjYWxsYmFjazEgYW5kIGNhbGxiYWNrMiB3aWxsIGJlIGV4ZWN1dGVkLlxuXG4gICAgICAgIG9iamVjdC5vZmYoJ3N0dWZmJyk7XG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBjYWxsYmFjazEgYW5kIGNhbGxiYWNrMiB3aWxsIG5vdCBiZSBleGVjdXRlZCFcbiAgICAgICAgYGBgXG5cbiAgICAgICAgQG1ldGhvZCBvZmZcbiAgICAgICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWUgZXZlbnQgdG8gc3RvcCBsaXN0ZW5pbmcgdG9cbiAgICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgb3B0aW9uYWwgYXJndW1lbnQuIElmIGdpdmVuLCBvbmx5IHRoZSBmdW5jdGlvblxuICAgICAgICBnaXZlbiB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZXZlbnQncyBjYWxsYmFjayBxdWV1ZS4gSWYgbm8gYGNhbGxiYWNrYFxuICAgICAgICBhcmd1bWVudCBpcyBnaXZlbiwgYWxsIGNhbGxiYWNrcyB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZXZlbnQncyBjYWxsYmFja1xuICAgICAgICBxdWV1ZS5cbiAgICAgICovXG4gICAgICAnb2ZmJzogZnVuY3Rpb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgYWxsQ2FsbGJhY2tzID0gbGliJHJzdnAkZXZlbnRzJCRjYWxsYmFja3NGb3IodGhpcyksIGNhbGxiYWNrcywgaW5kZXg7XG5cbiAgICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICAgIGFsbENhbGxiYWNrc1tldmVudE5hbWVdID0gW107XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2tzID0gYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV07XG5cbiAgICAgICAgaW5kZXggPSBsaWIkcnN2cCRldmVudHMkJGluZGV4T2YoY2FsbGJhY2tzLCBjYWxsYmFjayk7XG5cbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkgeyBjYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTsgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgIFVzZSBgdHJpZ2dlcmAgdG8gZmlyZSBjdXN0b20gZXZlbnRzLiBGb3IgZXhhbXBsZTpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIG9iamVjdC5vbignZm9vJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICBjb25zb2xlLmxvZygnZm9vIGV2ZW50IGhhcHBlbmVkIScpO1xuICAgICAgICB9KTtcbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ2ZvbycpO1xuICAgICAgICAvLyAnZm9vIGV2ZW50IGhhcHBlbmVkIScgbG9nZ2VkIHRvIHRoZSBjb25zb2xlXG4gICAgICAgIGBgYFxuXG4gICAgICAgIFlvdSBjYW4gYWxzbyBwYXNzIGEgdmFsdWUgYXMgYSBzZWNvbmQgYXJndW1lbnQgdG8gYHRyaWdnZXJgIHRoYXQgd2lsbCBiZVxuICAgICAgICBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gYWxsIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIGV2ZW50OlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgb2JqZWN0Lm9uKCdmb28nLCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgY29uc29sZS5sb2codmFsdWUubmFtZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdmb28nLCB7IG5hbWU6ICdiYXInIH0pO1xuICAgICAgICAvLyAnYmFyJyBsb2dnZWQgdG8gdGhlIGNvbnNvbGVcbiAgICAgICAgYGBgXG5cbiAgICAgICAgQG1ldGhvZCB0cmlnZ2VyXG4gICAgICAgIEBmb3IgUlNWUC5FdmVudFRhcmdldFxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGJlIHRyaWdnZXJlZFxuICAgICAgICBAcGFyYW0geyp9IG9wdGlvbnMgb3B0aW9uYWwgdmFsdWUgdG8gYmUgcGFzc2VkIHRvIGFueSBldmVudCBoYW5kbGVycyBmb3JcbiAgICAgICAgdGhlIGdpdmVuIGBldmVudE5hbWVgXG4gICAgICAqL1xuICAgICAgJ3RyaWdnZXInOiBmdW5jdGlvbihldmVudE5hbWUsIG9wdGlvbnMsIGxhYmVsKSB7XG4gICAgICAgIHZhciBhbGxDYWxsYmFja3MgPSBsaWIkcnN2cCRldmVudHMkJGNhbGxiYWNrc0Zvcih0aGlzKSwgY2FsbGJhY2tzLCBjYWxsYmFjaztcblxuICAgICAgICBpZiAoY2FsbGJhY2tzID0gYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAvLyBEb24ndCBjYWNoZSB0aGUgY2FsbGJhY2tzLmxlbmd0aCBzaW5jZSBpdCBtYXkgZ3Jvd1xuICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldO1xuXG4gICAgICAgICAgICBjYWxsYmFjayhvcHRpb25zLCBsYWJlbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBsaWIkcnN2cCRjb25maWckJGNvbmZpZyA9IHtcbiAgICAgIGluc3RydW1lbnQ6IGZhbHNlXG4gICAgfTtcblxuICAgIGxpYiRyc3ZwJGV2ZW50cyQkZGVmYXVsdFsnbWl4aW4nXShsaWIkcnN2cCRjb25maWckJGNvbmZpZyk7XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRjb25maWckJGNvbmZpZ3VyZShuYW1lLCB2YWx1ZSkge1xuICAgICAgaWYgKG5hbWUgPT09ICdvbmVycm9yJykge1xuICAgICAgICAvLyBoYW5kbGUgZm9yIGxlZ2FjeSB1c2VycyB0aGF0IGV4cGVjdCB0aGUgYWN0dWFsXG4gICAgICAgIC8vIGVycm9yIHRvIGJlIHBhc3NlZCB0byB0aGVpciBmdW5jdGlvbiBhZGRlZCB2aWFcbiAgICAgICAgLy8gYFJTVlAuY29uZmlndXJlKCdvbmVycm9yJywgc29tZUZ1bmN0aW9uSGVyZSk7YFxuICAgICAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZ1snb24nXSgnZXJyb3InLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWdbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBsaWIkcnN2cCRjb25maWckJGNvbmZpZ1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGliJHJzdnAkaW5zdHJ1bWVudCQkcXVldWUgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGluc3RydW1lbnQkJHNjaGVkdWxlRmx1c2goKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZW50cnk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGliJHJzdnAkaW5zdHJ1bWVudCQkcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBlbnRyeSA9IGxpYiRyc3ZwJGluc3RydW1lbnQkJHF1ZXVlW2ldO1xuXG4gICAgICAgICAgdmFyIHBheWxvYWQgPSBlbnRyeS5wYXlsb2FkO1xuXG4gICAgICAgICAgcGF5bG9hZC5ndWlkID0gcGF5bG9hZC5rZXkgKyBwYXlsb2FkLmlkO1xuICAgICAgICAgIHBheWxvYWQuY2hpbGRHdWlkID0gcGF5bG9hZC5rZXkgKyBwYXlsb2FkLmNoaWxkSWQ7XG4gICAgICAgICAgaWYgKHBheWxvYWQuZXJyb3IpIHtcbiAgICAgICAgICAgIHBheWxvYWQuc3RhY2sgPSBwYXlsb2FkLmVycm9yLnN0YWNrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnWyd0cmlnZ2VyJ10oZW50cnkubmFtZSwgZW50cnkucGF5bG9hZCk7XG4gICAgICAgIH1cbiAgICAgICAgbGliJHJzdnAkaW5zdHJ1bWVudCQkcXVldWUubGVuZ3RoID0gMDtcbiAgICAgIH0sIDUwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRpbnN0cnVtZW50JCRpbnN0cnVtZW50KGV2ZW50TmFtZSwgcHJvbWlzZSwgY2hpbGQpIHtcbiAgICAgIGlmICgxID09PSBsaWIkcnN2cCRpbnN0cnVtZW50JCRxdWV1ZS5wdXNoKHtcbiAgICAgICAgbmFtZTogZXZlbnROYW1lLFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAga2V5OiBwcm9taXNlLl9ndWlkS2V5LFxuICAgICAgICAgIGlkOiAgcHJvbWlzZS5faWQsXG4gICAgICAgICAgZXZlbnROYW1lOiBldmVudE5hbWUsXG4gICAgICAgICAgZGV0YWlsOiBwcm9taXNlLl9yZXN1bHQsXG4gICAgICAgICAgY2hpbGRJZDogY2hpbGQgJiYgY2hpbGQuX2lkLFxuICAgICAgICAgIGxhYmVsOiBwcm9taXNlLl9sYWJlbCxcbiAgICAgICAgICB0aW1lU3RhbXA6IGxpYiRyc3ZwJHV0aWxzJCRub3coKSxcbiAgICAgICAgICBlcnJvcjogbGliJHJzdnAkY29uZmlnJCRjb25maWdbXCJpbnN0cnVtZW50LXdpdGgtc3RhY2tcIl0gPyBuZXcgRXJyb3IocHJvbWlzZS5fbGFiZWwpIDogbnVsbFxuICAgICAgICB9fSkpIHtcbiAgICAgICAgICBsaWIkcnN2cCRpbnN0cnVtZW50JCRzY2hlZHVsZUZsdXNoKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB2YXIgbGliJHJzdnAkaW5zdHJ1bWVudCQkZGVmYXVsdCA9IGxpYiRyc3ZwJGluc3RydW1lbnQkJGluc3RydW1lbnQ7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkdGhlbiQkdGhlbihvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbiwgbGFiZWwpIHtcbiAgICAgIHZhciBwYXJlbnQgPSB0aGlzO1xuICAgICAgdmFyIHN0YXRlID0gcGFyZW50Ll9zdGF0ZTtcblxuICAgICAgaWYgKHN0YXRlID09PSBsaWIkcnN2cCQkaW50ZXJuYWwkJEZVTEZJTExFRCAmJiAhb25GdWxmaWxsbWVudCB8fCBzdGF0ZSA9PT0gbGliJHJzdnAkJGludGVybmFsJCRSRUpFQ1RFRCAmJiAhb25SZWplY3Rpb24pIHtcbiAgICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCAmJiBsaWIkcnN2cCRpbnN0cnVtZW50JCRkZWZhdWx0KCdjaGFpbmVkJywgcGFyZW50LCBwYXJlbnQpO1xuICAgICAgICByZXR1cm4gcGFyZW50O1xuICAgICAgfVxuXG4gICAgICBwYXJlbnQuX29uRXJyb3IgPSBudWxsO1xuXG4gICAgICB2YXIgY2hpbGQgPSBuZXcgcGFyZW50LmNvbnN0cnVjdG9yKGxpYiRyc3ZwJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgdmFyIHJlc3VsdCA9IHBhcmVudC5fcmVzdWx0O1xuXG4gICAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZy5pbnN0cnVtZW50ICYmIGxpYiRyc3ZwJGluc3RydW1lbnQkJGRlZmF1bHQoJ2NoYWluZWQnLCBwYXJlbnQsIGNoaWxkKTtcblxuICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50c1tzdGF0ZSAtIDFdO1xuICAgICAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYyhmdW5jdGlvbigpe1xuICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc3RhdGUsIGNoaWxkLCBjYWxsYmFjaywgcmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9XG4gICAgdmFyIGxpYiRyc3ZwJHRoZW4kJGRlZmF1bHQgPSBsaWIkcnN2cCR0aGVuJCR0aGVuO1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJHByb21pc2UkcmVzb2x2ZSQkcmVzb2x2ZShvYmplY3QsIGxhYmVsKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgICAgaWYgKG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBvYmplY3QuY29uc3RydWN0b3IgPT09IENvbnN0cnVjdG9yKSB7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRyc3ZwJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIG9iamVjdCk7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRyc3ZwJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCA9IGxpYiRyc3ZwJHByb21pc2UkcmVzb2x2ZSQkcmVzb2x2ZTtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRlbnVtZXJhdG9yJCRtYWtlU2V0dGxlZFJlc3VsdChzdGF0ZSwgcG9zaXRpb24sIHZhbHVlKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdGU6ICdmdWxmaWxsZWQnLFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdGU6ICdyZWplY3RlZCcsXG4gICAgICAgICAgcmVhc29uOiB2YWx1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGVudW1lcmF0b3IkJEVudW1lcmF0b3IoQ29uc3RydWN0b3IsIGlucHV0LCBhYm9ydE9uUmVqZWN0LCBsYWJlbCkge1xuICAgICAgdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IENvbnN0cnVjdG9yO1xuICAgICAgdGhpcy5wcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRyc3ZwJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgdGhpcy5fYWJvcnRPblJlamVjdCA9IGFib3J0T25SZWplY3Q7XG5cbiAgICAgIGlmICh0aGlzLl92YWxpZGF0ZUlucHV0KGlucHV0KSkge1xuICAgICAgICB0aGlzLl9pbnB1dCAgICAgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5sZW5ndGggICAgID0gaW5wdXQubGVuZ3RoO1xuICAgICAgICB0aGlzLl9yZW1haW5pbmcgPSBpbnB1dC5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLmxlbmd0aCB8fCAwO1xuICAgICAgICAgIHRoaXMuX2VudW1lcmF0ZSgpO1xuICAgICAgICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdCh0aGlzLnByb21pc2UsIHRoaXMuX3ZhbGlkYXRpb25FcnJvcigpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGliJHJzdnAkZW51bWVyYXRvciQkZGVmYXVsdCA9IGxpYiRyc3ZwJGVudW1lcmF0b3IkJEVudW1lcmF0b3I7XG5cbiAgICBsaWIkcnN2cCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGVJbnB1dCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICByZXR1cm4gbGliJHJzdnAkdXRpbHMkJGlzQXJyYXkoaW5wdXQpO1xuICAgIH07XG5cbiAgICBsaWIkcnN2cCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGlvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXknKTtcbiAgICB9O1xuXG4gICAgbGliJHJzdnAkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG4gICAgfTtcblxuICAgIGxpYiRyc3ZwJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsZW5ndGggICAgID0gdGhpcy5sZW5ndGg7XG4gICAgICB2YXIgcHJvbWlzZSAgICA9IHRoaXMucHJvbWlzZTtcbiAgICAgIHZhciBpbnB1dCAgICAgID0gdGhpcy5faW5wdXQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBwcm9taXNlLl9zdGF0ZSA9PT0gbGliJHJzdnAkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkcnN2cCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fc2V0dGxlTWF5YmVUaGVuYWJsZSA9IGZ1bmN0aW9uKGVudHJ5LCBpKSB7XG4gICAgICB2YXIgYyA9IHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3I7XG4gICAgICB2YXIgcmVzb2x2ZSA9IGMucmVzb2x2ZTtcblxuICAgICAgaWYgKHJlc29sdmUgPT09IGxpYiRyc3ZwJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCkge1xuICAgICAgICB2YXIgdGhlbiA9IGxpYiRyc3ZwJCRpbnRlcm5hbCQkZ2V0VGhlbihlbnRyeSk7XG5cbiAgICAgICAgaWYgKHRoZW4gPT09IGxpYiRyc3ZwJHRoZW4kJGRlZmF1bHQgJiZcbiAgICAgICAgICAgIGVudHJ5Ll9zdGF0ZSAhPT0gbGliJHJzdnAkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgICAgZW50cnkuX29uRXJyb3IgPSBudWxsO1xuICAgICAgICAgIHRoaXMuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gdGhpcy5fbWFrZVJlc3VsdChsaWIkcnN2cCQkaW50ZXJuYWwkJEZVTEZJTExFRCwgaSwgZW50cnkpO1xuICAgICAgICB9IGVsc2UgaWYgKGMgPT09IGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQpIHtcbiAgICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBjKGxpYiRyc3ZwJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIGVudHJ5LCB0aGVuKTtcbiAgICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQocHJvbWlzZSwgaSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KG5ldyBjKGZ1bmN0aW9uKHJlc29sdmUpIHsgcmVzb2x2ZShlbnRyeSk7IH0pLCBpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KHJlc29sdmUoZW50cnkpLCBpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGliJHJzdnAkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uKGVudHJ5LCBpKSB7XG4gICAgICBpZiAobGliJHJzdnAkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZShlbnRyeSkpIHtcbiAgICAgICAgdGhpcy5fc2V0dGxlTWF5YmVUaGVuYWJsZShlbnRyeSwgaSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZW1haW5pbmctLTtcbiAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gdGhpcy5fbWFrZVJlc3VsdChsaWIkcnN2cCQkaW50ZXJuYWwkJEZVTEZJTExFRCwgaSwgZW50cnkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkcnN2cCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fc2V0dGxlZEF0ID0gZnVuY3Rpb24oc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IHRoaXMucHJvbWlzZTtcblxuICAgICAgaWYgKHByb21pc2UuX3N0YXRlID09PSBsaWIkcnN2cCQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG5cbiAgICAgICAgaWYgKHRoaXMuX2Fib3J0T25SZWplY3QgJiYgc3RhdGUgPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gdGhpcy5fbWFrZVJlc3VsdChzdGF0ZSwgaSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxpYiRyc3ZwJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9tYWtlUmVzdWx0ID0gZnVuY3Rpb24oc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcblxuICAgIGxpYiRyc3ZwJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl93aWxsU2V0dGxlQXQgPSBmdW5jdGlvbihwcm9taXNlLCBpKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHByb21pc2UsIHVuZGVmaW5lZCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KGxpYiRyc3ZwJCRpbnRlcm5hbCQkRlVMRklMTEVELCBpLCB2YWx1ZSk7XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KGxpYiRyc3ZwJCRpbnRlcm5hbCQkUkVKRUNURUQsIGksIHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJHByb21pc2UkYWxsJCRhbGwoZW50cmllcywgbGFiZWwpIHtcbiAgICAgIHJldHVybiBuZXcgbGliJHJzdnAkZW51bWVyYXRvciQkZGVmYXVsdCh0aGlzLCBlbnRyaWVzLCB0cnVlIC8qIGFib3J0IG9uIHJlamVjdCAqLywgbGFiZWwpLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRwcm9taXNlJGFsbCQkZGVmYXVsdCA9IGxpYiRyc3ZwJHByb21pc2UkYWxsJCRhbGw7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkcHJvbWlzZSRyYWNlJCRyYWNlKGVudHJpZXMsIGxhYmVsKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJHJzdnAkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG5cbiAgICAgIGlmICghbGliJHJzdnAkdXRpbHMkJGlzQXJyYXkoZW50cmllcykpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLicpKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSBlbnRyaWVzLmxlbmd0aDtcblxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsbWVudCh2YWx1ZSkge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGlvbihyZWFzb24pIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSBsaWIkcnN2cCQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkc3Vic2NyaWJlKENvbnN0cnVjdG9yLnJlc29sdmUoZW50cmllc1tpXSksIHVuZGVmaW5lZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRyc3ZwJHByb21pc2UkcmFjZSQkZGVmYXVsdCA9IGxpYiRyc3ZwJHByb21pc2UkcmFjZSQkcmFjZTtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRwcm9taXNlJHJlamVjdCQkcmVqZWN0KHJlYXNvbiwgbGFiZWwpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJHJzdnAkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG4gICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRwcm9taXNlJHJlamVjdCQkZGVmYXVsdCA9IGxpYiRyc3ZwJHByb21pc2UkcmVqZWN0JCRyZWplY3Q7XG5cbiAgICB2YXIgbGliJHJzdnAkcHJvbWlzZSQkZ3VpZEtleSA9ICdyc3ZwXycgKyBsaWIkcnN2cCR1dGlscyQkbm93KCkgKyAnLSc7XG4gICAgdmFyIGxpYiRyc3ZwJHByb21pc2UkJGNvdW50ZXIgPSAwO1xuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRwcm9taXNlJCRuZWVkc05ldygpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkcHJvbWlzZSQkUHJvbWlzZShyZXNvbHZlciwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX2lkID0gbGliJHJzdnAkcHJvbWlzZSQkY291bnRlcisrO1xuICAgICAgdGhpcy5fbGFiZWwgPSBsYWJlbDtcbiAgICAgIHRoaXMuX3N0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fcmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXTtcblxuICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCAmJiBsaWIkcnN2cCRpbnN0cnVtZW50JCRkZWZhdWx0KCdjcmVhdGVkJywgdGhpcyk7XG5cbiAgICAgIGlmIChsaWIkcnN2cCQkaW50ZXJuYWwkJG5vb3AgIT09IHJlc29sdmVyKSB7XG4gICAgICAgIHR5cGVvZiByZXNvbHZlciAhPT0gJ2Z1bmN0aW9uJyAmJiBsaWIkcnN2cCRwcm9taXNlJCRuZWVkc1Jlc29sdmVyKCk7XG4gICAgICAgIHRoaXMgaW5zdGFuY2VvZiBsaWIkcnN2cCRwcm9taXNlJCRQcm9taXNlID8gbGliJHJzdnAkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZSh0aGlzLCByZXNvbHZlcikgOiBsaWIkcnN2cCRwcm9taXNlJCRuZWVkc05ldygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0ID0gbGliJHJzdnAkcHJvbWlzZSQkUHJvbWlzZTtcblxuICAgIC8vIGRlcHJlY2F0ZWRcbiAgICBsaWIkcnN2cCRwcm9taXNlJCRQcm9taXNlLmNhc3QgPSBsaWIkcnN2cCRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQ7XG4gICAgbGliJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5hbGwgPSBsaWIkcnN2cCRwcm9taXNlJGFsbCQkZGVmYXVsdDtcbiAgICBsaWIkcnN2cCRwcm9taXNlJCRQcm9taXNlLnJhY2UgPSBsaWIkcnN2cCRwcm9taXNlJHJhY2UkJGRlZmF1bHQ7XG4gICAgbGliJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5yZXNvbHZlID0gbGliJHJzdnAkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0O1xuICAgIGxpYiRyc3ZwJHByb21pc2UkJFByb21pc2UucmVqZWN0ID0gbGliJHJzdnAkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQ7XG5cbiAgICBsaWIkcnN2cCRwcm9taXNlJCRQcm9taXNlLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBsaWIkcnN2cCRwcm9taXNlJCRQcm9taXNlLFxuXG4gICAgICBfZ3VpZEtleTogbGliJHJzdnAkcHJvbWlzZSQkZ3VpZEtleSxcblxuICAgICAgX29uRXJyb3I6IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgICAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZy5hZnRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAocHJvbWlzZS5fb25FcnJvcikge1xuICAgICAgICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWdbJ3RyaWdnZXInXSgnZXJyb3InLCByZWFzb24sIHByb21pc2UuX2xhYmVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcblxuICAgIC8qKlxuICAgICAgVGhlIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsXG4gICAgICB3aGljaCByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZVxuICAgICAgcmVhc29uIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAvLyB1c2VyIGlzIGF2YWlsYWJsZVxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gdXNlciBpcyB1bmF2YWlsYWJsZSwgYW5kIHlvdSBhcmUgZ2l2ZW4gdGhlIHJlYXNvbiB3aHlcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIENoYWluaW5nXG4gICAgICAtLS0tLS0tLVxuXG4gICAgICBUaGUgcmV0dXJuIHZhbHVlIG9mIGB0aGVuYCBpcyBpdHNlbGYgYSBwcm9taXNlLiAgVGhpcyBzZWNvbmQsICdkb3duc3RyZWFtJ1xuICAgICAgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZpcnN0IHByb21pc2UncyBmdWxmaWxsbWVudFxuICAgICAgb3IgcmVqZWN0aW9uIGhhbmRsZXIsIG9yIHJlamVjdGVkIGlmIHRoZSBoYW5kbGVyIHRocm93cyBhbiBleGNlcHRpb24uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIHVzZXIubmFtZTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0IG5hbWUnO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodXNlck5hbWUpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGB1c2VyTmFtZWAgd2lsbCBiZSB0aGUgdXNlcidzIG5hbWUsIG90aGVyd2lzZSBpdFxuICAgICAgICAvLyB3aWxsIGJlIGAnZGVmYXVsdCBuYW1lJ2BcbiAgICAgIH0pO1xuXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScpO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gaWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGByZWFzb25gIHdpbGwgYmUgJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jy5cbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCByZWplY3RlZCwgYHJlYXNvbmAgd2lsbCBiZSAnYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScuXG4gICAgICB9KTtcbiAgICAgIGBgYFxuICAgICAgSWYgdGhlIGRvd25zdHJlYW0gcHJvbWlzZSBkb2VzIG5vdCBzcGVjaWZ5IGEgcmVqZWN0aW9uIGhhbmRsZXIsIHJlamVjdGlvbiByZWFzb25zIHdpbGwgYmUgcHJvcGFnYXRlZCBmdXJ0aGVyIGRvd25zdHJlYW0uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFBlZGFnb2dpY2FsRXhjZXB0aW9uKCdVcHN0cmVhbSBlcnJvcicpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBUaGUgYFBlZGdhZ29jaWFsRXhjZXB0aW9uYCBpcyBwcm9wYWdhdGVkIGFsbCB0aGUgd2F5IGRvd24gdG8gaGVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQXNzaW1pbGF0aW9uXG4gICAgICAtLS0tLS0tLS0tLS1cblxuICAgICAgU29tZXRpbWVzIHRoZSB2YWx1ZSB5b3Ugd2FudCB0byBwcm9wYWdhdGUgdG8gYSBkb3duc3RyZWFtIHByb21pc2UgY2FuIG9ubHkgYmVcbiAgICAgIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS4gVGhpcyBjYW4gYmUgYWNoaWV2ZWQgYnkgcmV0dXJuaW5nIGEgcHJvbWlzZSBpbiB0aGVcbiAgICAgIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvbiBoYW5kbGVyLiBUaGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgdGhlbiBiZSBwZW5kaW5nXG4gICAgICB1bnRpbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBzZXR0bGVkLiBUaGlzIGlzIGNhbGxlZCAqYXNzaW1pbGF0aW9uKi5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBUaGUgdXNlcidzIGNvbW1lbnRzIGFyZSBub3cgYXZhaWxhYmxlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBJZiB0aGUgYXNzaW1saWF0ZWQgcHJvbWlzZSByZWplY3RzLCB0aGVuIHRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCBhbHNvIHJlamVjdC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIGZ1bGZpbGxzLCB3ZSdsbCBoYXZlIHRoZSB2YWx1ZSBoZXJlXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgcmVqZWN0cywgd2UnbGwgaGF2ZSB0aGUgcmVhc29uIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFNpbXBsZSBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IGZpbmRSZXN1bHQoKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFJlc3VsdChmdW5jdGlvbihyZXN1bHQsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRSZXN1bHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFkdmFuY2VkIEV4YW1wbGVcbiAgICAgIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIGF1dGhvciwgYm9va3M7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF1dGhvciA9IGZpbmRBdXRob3IoKTtcbiAgICAgICAgYm9va3MgID0gZmluZEJvb2tzQnlBdXRob3IoYXV0aG9yKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuXG4gICAgICBmdW5jdGlvbiBmb3VuZEJvb2tzKGJvb2tzKSB7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZmFpbHVyZShyZWFzb24pIHtcblxuICAgICAgfVxuXG4gICAgICBmaW5kQXV0aG9yKGZ1bmN0aW9uKGF1dGhvciwgZXJyKXtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZpbmRCb29va3NCeUF1dGhvcihhdXRob3IsIGZ1bmN0aW9uKGJvb2tzLCBlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgZm91bmRCb29rcyhib29rcyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgIGZhaWx1cmUocmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRBdXRob3IoKS5cbiAgICAgICAgdGhlbihmaW5kQm9va3NCeUF1dGhvcikuXG4gICAgICAgIHRoZW4oZnVuY3Rpb24oYm9va3Mpe1xuICAgICAgICAgIC8vIGZvdW5kIGJvb2tzXG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCB0aGVuXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZ1bGZpbGxtZW50XG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGlvblxuICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICB0aGVuOiBsaWIkcnN2cCR0aGVuJCRkZWZhdWx0LFxuXG4gICAgLyoqXG4gICAgICBgY2F0Y2hgIGlzIHNpbXBseSBzdWdhciBmb3IgYHRoZW4odW5kZWZpbmVkLCBvblJlamVjdGlvbilgIHdoaWNoIG1ha2VzIGl0IHRoZSBzYW1lXG4gICAgICBhcyB0aGUgY2F0Y2ggYmxvY2sgb2YgYSB0cnkvY2F0Y2ggc3RhdGVtZW50LlxuXG4gICAgICBgYGBqc1xuICAgICAgZnVuY3Rpb24gZmluZEF1dGhvcigpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkbid0IGZpbmQgdGhhdCBhdXRob3InKTtcbiAgICAgIH1cblxuICAgICAgLy8gc3luY2hyb25vdXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbmRBdXRob3IoKTtcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9XG5cbiAgICAgIC8vIGFzeW5jIHdpdGggcHJvbWlzZXNcbiAgICAgIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCBjYXRjaFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3Rpb25cbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgJ2NhdGNoJzogZnVuY3Rpb24ob25SZWplY3Rpb24sIGxhYmVsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGlvbiwgbGFiZWwpO1xuICAgICAgfSxcblxuICAgIC8qKlxuICAgICAgYGZpbmFsbHlgIHdpbGwgYmUgaW52b2tlZCByZWdhcmRsZXNzIG9mIHRoZSBwcm9taXNlJ3MgZmF0ZSBqdXN0IGFzIG5hdGl2ZVxuICAgICAgdHJ5L2NhdGNoL2ZpbmFsbHkgYmVoYXZlc1xuXG4gICAgICBTeW5jaHJvbm91cyBleGFtcGxlOlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZEF1dGhvcigpIHtcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEF1dGhvcigpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gZmluZEF1dGhvcigpOyAvLyBzdWNjZWVkIG9yIGZhaWxcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRPdGhlckF1dGhlcigpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gYWx3YXlzIHJ1bnNcbiAgICAgICAgLy8gZG9lc24ndCBhZmZlY3QgdGhlIHJldHVybiB2YWx1ZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEFzeW5jaHJvbm91cyBleGFtcGxlOlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIHJldHVybiBmaW5kT3RoZXJBdXRoZXIoKTtcbiAgICAgIH0pLmZpbmFsbHkoZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gYXV0aG9yIHdhcyBlaXRoZXIgZm91bmQsIG9yIG5vdFxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCBmaW5hbGx5XG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICAnZmluYWxseSc6IGZ1bmN0aW9uKGNhbGxiYWNrLCBsYWJlbCkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gICAgICAgIHZhciBjb25zdHJ1Y3RvciA9IHByb21pc2UuY29uc3RydWN0b3I7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucmVqZWN0KHJlYXNvbik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGxhYmVsKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uICBsaWIkcnN2cCQkaW50ZXJuYWwkJHdpdGhPd25Qcm9taXNlKCkge1xuICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZXMgY2FsbGJhY2sgY2Fubm90IHJldHVybiB0aGF0IHNhbWUgcHJvbWlzZS4nKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkaW50ZXJuYWwkJG5vb3AoKSB7fVxuXG4gICAgdmFyIGxpYiRyc3ZwJCRpbnRlcm5hbCQkUEVORElORyAgID0gdm9pZCAwO1xuICAgIHZhciBsaWIkcnN2cCQkaW50ZXJuYWwkJEZVTEZJTExFRCA9IDE7XG4gICAgdmFyIGxpYiRyc3ZwJCRpbnRlcm5hbCQkUkVKRUNURUQgID0gMjtcblxuICAgIHZhciBsaWIkcnN2cCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SID0gbmV3IGxpYiRyc3ZwJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkZ2V0VGhlbihwcm9taXNlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SLmVycm9yID0gZXJyb3I7XG4gICAgICAgIHJldHVybiBsaWIkcnN2cCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkdHJ5VGhlbih0aGVuLCB2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcik7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUsIHRoZW4pIHtcbiAgICAgIGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKGZ1bmN0aW9uKHByb21pc2UpIHtcbiAgICAgICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZXJyb3IgPSBsaWIkcnN2cCQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdGhlbmFibGUsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHNlYWxlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgICAgIGlmICh0aGVuYWJsZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSwgdW5kZWZpbmVkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcblxuICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0sICdTZXR0bGU6ICcgKyAocHJvbWlzZS5fbGFiZWwgfHwgJyB1bmtub3duIHByb21pc2UnKSk7XG5cbiAgICAgICAgaWYgKCFzZWFsZWQgJiYgZXJyb3IpIHtcbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSkge1xuICAgICAgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gbGliJHJzdnAkJGludGVybmFsJCRGVUxGSUxMRUQpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgdGhlbmFibGUuX29uRXJyb3IgPSBudWxsO1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHRoZW5hYmxlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHRoZW5hYmxlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlLCB1bmRlZmluZWQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUsIHRoZW4pIHtcbiAgICAgIGlmIChtYXliZVRoZW5hYmxlLmNvbnN0cnVjdG9yID09PSBwcm9taXNlLmNvbnN0cnVjdG9yICYmXG4gICAgICAgICAgdGhlbiA9PT0gbGliJHJzdnAkdGhlbiQkZGVmYXVsdCAmJlxuICAgICAgICAgIGNvbnN0cnVjdG9yLnJlc29sdmUgPT09IGxpYiRyc3ZwJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCkge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoZW4gPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IpIHtcbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBsaWIkcnN2cCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SLmVycm9yKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGVuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobGliJHJzdnAkdXRpbHMkJGlzRnVuY3Rpb24odGhlbikpIHtcbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChsaWIkcnN2cCR1dGlscyQkb2JqZWN0T3JGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIHZhbHVlLCBsaWIkcnN2cCQkaW50ZXJuYWwkJGdldFRoZW4odmFsdWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgICAgIGlmIChwcm9taXNlLl9vbkVycm9yKSB7XG4gICAgICAgIHByb21pc2UuX29uRXJyb3IocHJvbWlzZS5fcmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgbGliJHJzdnAkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSkge1xuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBsaWIkcnN2cCQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG5cbiAgICAgIHByb21pc2UuX3Jlc3VsdCA9IHZhbHVlO1xuICAgICAgcHJvbWlzZS5fc3RhdGUgPSBsaWIkcnN2cCQkaW50ZXJuYWwkJEZVTEZJTExFRDtcblxuICAgICAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBpZiAobGliJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICAgIGxpYiRyc3ZwJGluc3RydW1lbnQkJGRlZmF1bHQoJ2Z1bGZpbGxlZCcsIHByb21pc2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYyhsaWIkcnN2cCQkaW50ZXJuYWwkJHB1Ymxpc2gsIHByb21pc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbikge1xuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBsaWIkcnN2cCQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRyc3ZwJCRpbnRlcm5hbCQkUkVKRUNURUQ7XG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG4gICAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYyhsaWIkcnN2cCQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24sIHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwYXJlbnQuX3N1YnNjcmliZXJzO1xuICAgICAgdmFyIGxlbmd0aCA9IHN1YnNjcmliZXJzLmxlbmd0aDtcblxuICAgICAgcGFyZW50Ll9vbkVycm9yID0gbnVsbDtcblxuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoXSA9IGNoaWxkO1xuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoICsgbGliJHJzdnAkJGludGVybmFsJCRGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArIGxpYiRyc3ZwJCRpbnRlcm5hbCQkUkVKRUNURURdICA9IG9uUmVqZWN0aW9uO1xuXG4gICAgICBpZiAobGVuZ3RoID09PSAwICYmIHBhcmVudC5fc3RhdGUpIHtcbiAgICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMobGliJHJzdnAkJGludGVybmFsJCRwdWJsaXNoLCBwYXJlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgICAgIHZhciBzZXR0bGVkID0gcHJvbWlzZS5fc3RhdGU7XG5cbiAgICAgIGlmIChsaWIkcnN2cCRjb25maWckJGNvbmZpZy5pbnN0cnVtZW50KSB7XG4gICAgICAgIGxpYiRyc3ZwJGluc3RydW1lbnQkJGRlZmF1bHQoc2V0dGxlZCA9PT0gbGliJHJzdnAkJGludGVybmFsJCRGVUxGSUxMRUQgPyAnZnVsZmlsbGVkJyA6ICdyZWplY3RlZCcsIHByb21pc2UpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuXG4gICAgICB2YXIgY2hpbGQsIGNhbGxiYWNrLCBkZXRhaWwgPSBwcm9taXNlLl9yZXN1bHQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic2NyaWJlcnMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgY2hpbGQgPSBzdWJzY3JpYmVyc1tpXTtcbiAgICAgICAgY2FsbGJhY2sgPSBzdWJzY3JpYmVyc1tpICsgc2V0dGxlZF07XG5cbiAgICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKSB7XG4gICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbGliJHJzdnAkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IgPSBuZXcgbGliJHJzdnAkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkJGludGVybmFsJCR0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUi5lcnJvciA9IGU7XG4gICAgICAgIHJldHVybiBsaWIkcnN2cCQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHNldHRsZWQsIHByb21pc2UsIGNhbGxiYWNrLCBkZXRhaWwpIHtcbiAgICAgIHZhciBoYXNDYWxsYmFjayA9IGxpYiRyc3ZwJHV0aWxzJCRpc0Z1bmN0aW9uKGNhbGxiYWNrKSxcbiAgICAgICAgICB2YWx1ZSwgZXJyb3IsIHN1Y2NlZWRlZCwgZmFpbGVkO1xuXG4gICAgICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgdmFsdWUgPSBsaWIkcnN2cCQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbGliJHJzdnAkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IpIHtcbiAgICAgICAgICBmYWlsZWQgPSB0cnVlO1xuICAgICAgICAgIGVycm9yID0gdmFsdWUuZXJyb3I7XG4gICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBsaWIkcnN2cCQkaW50ZXJuYWwkJHdpdGhPd25Qcm9taXNlKCkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGRldGFpbDtcbiAgICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBsaWIkcnN2cCQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgLy8gbm9vcFxuICAgICAgfSBlbHNlIGlmIChoYXNDYWxsYmFjayAmJiBzdWNjZWVkZWQpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gbGliJHJzdnAkJGludGVybmFsJCRGVUxGSUxMRUQpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gbGliJHJzdnAkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICAgICAgdmFyIHJlc29sdmVkID0gZmFsc2U7XG4gICAgICB0cnkge1xuICAgICAgICByZXNvbHZlcihmdW5jdGlvbiByZXNvbHZlUHJvbWlzZSh2YWx1ZSl7XG4gICAgICAgICAgaWYgKHJlc29sdmVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHJlc29sdmVkID0gdHJ1ZTtcbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgICAgIGlmIChyZXNvbHZlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICByZXNvbHZlZCA9IHRydWU7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQoQ29uc3RydWN0b3IsIGVudHJpZXMsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9zdXBlckNvbnN0cnVjdG9yKENvbnN0cnVjdG9yLCBlbnRyaWVzLCBmYWxzZSAvKiBkb24ndCBhYm9ydCBvbiByZWplY3QgKi8sIGxhYmVsKTtcbiAgICB9XG5cbiAgICBsaWIkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZC5wcm90b3R5cGUgPSBsaWIkcnN2cCR1dGlscyQkb19jcmVhdGUobGliJHJzdnAkZW51bWVyYXRvciQkZGVmYXVsdC5wcm90b3R5cGUpO1xuICAgIGxpYiRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkLnByb3RvdHlwZS5fc3VwZXJDb25zdHJ1Y3RvciA9IGxpYiRyc3ZwJGVudW1lcmF0b3IkJGRlZmF1bHQ7XG4gICAgbGliJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQucHJvdG90eXBlLl9tYWtlUmVzdWx0ID0gbGliJHJzdnAkZW51bWVyYXRvciQkbWFrZVNldHRsZWRSZXN1bHQ7XG4gICAgbGliJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ2FsbFNldHRsZWQgbXVzdCBiZSBjYWxsZWQgd2l0aCBhbiBhcnJheScpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRhbGwkc2V0dGxlZCQkYWxsU2V0dGxlZChlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyBsaWIkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZChsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0LCBlbnRyaWVzLCBsYWJlbCkucHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRyc3ZwJGFsbCRzZXR0bGVkJCRkZWZhdWx0ID0gbGliJHJzdnAkYWxsJHNldHRsZWQkJGFsbFNldHRsZWQ7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkYWxsJCRhbGwoYXJyYXksIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwoYXJyYXksIGxhYmVsKTtcbiAgICB9XG4gICAgdmFyIGxpYiRyc3ZwJGFsbCQkZGVmYXVsdCA9IGxpYiRyc3ZwJGFsbCQkYWxsO1xuICAgIHZhciBsaWIkcnN2cCRhc2FwJCRsZW4gPSAwO1xuICAgIHZhciBsaWIkcnN2cCRhc2FwJCR0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuICAgIHZhciBsaWIkcnN2cCRhc2FwJCR2ZXJ0eE5leHQ7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkYXNhcCQkYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gICAgICBsaWIkcnN2cCRhc2FwJCRxdWV1ZVtsaWIkcnN2cCRhc2FwJCRsZW5dID0gY2FsbGJhY2s7XG4gICAgICBsaWIkcnN2cCRhc2FwJCRxdWV1ZVtsaWIkcnN2cCRhc2FwJCRsZW4gKyAxXSA9IGFyZztcbiAgICAgIGxpYiRyc3ZwJGFzYXAkJGxlbiArPSAyO1xuICAgICAgaWYgKGxpYiRyc3ZwJGFzYXAkJGxlbiA9PT0gMikge1xuICAgICAgICAvLyBJZiBsZW4gaXMgMSwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgICAgIC8vIElmIGFkZGl0aW9uYWwgY2FsbGJhY2tzIGFyZSBxdWV1ZWQgYmVmb3JlIHRoZSBxdWV1ZSBpcyBmbHVzaGVkLCB0aGV5XG4gICAgICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoaXMgZmx1c2ggdGhhdCB3ZSBhcmUgc2NoZWR1bGluZy5cbiAgICAgICAgbGliJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBsaWIkcnN2cCRhc2FwJCRkZWZhdWx0ID0gbGliJHJzdnAkYXNhcCQkYXNhcDtcblxuICAgIHZhciBsaWIkcnN2cCRhc2FwJCRicm93c2VyV2luZG93ID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcbiAgICB2YXIgbGliJHJzdnAkYXNhcCQkYnJvd3Nlckdsb2JhbCA9IGxpYiRyc3ZwJGFzYXAkJGJyb3dzZXJXaW5kb3cgfHwge307XG4gICAgdmFyIGxpYiRyc3ZwJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gbGliJHJzdnAkYXNhcCQkYnJvd3Nlckdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGxpYiRyc3ZwJGFzYXAkJGJyb3dzZXJHbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgbGliJHJzdnAkYXNhcCQkaXNOb2RlID0gdHlwZW9mIHNlbGYgPT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nO1xuXG4gICAgLy8gdGVzdCBmb3Igd2ViIHdvcmtlciBidXQgbm90IGluIElFMTBcbiAgICB2YXIgbGliJHJzdnAkYXNhcCQkaXNXb3JrZXIgPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgICAvLyBub2RlXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkYXNhcCQkdXNlTmV4dFRpY2soKSB7XG4gICAgICB2YXIgbmV4dFRpY2sgPSBwcm9jZXNzLm5leHRUaWNrO1xuICAgICAgLy8gbm9kZSB2ZXJzaW9uIDAuMTAueCBkaXNwbGF5cyBhIGRlcHJlY2F0aW9uIHdhcm5pbmcgd2hlbiBuZXh0VGljayBpcyB1c2VkIHJlY3Vyc2l2ZWx5XG4gICAgICAvLyBzZXRJbW1lZGlhdGUgc2hvdWxkIGJlIHVzZWQgaW5zdGVhZCBpbnN0ZWFkXG4gICAgICB2YXIgdmVyc2lvbiA9IHByb2Nlc3MudmVyc2lvbnMubm9kZS5tYXRjaCgvXig/OihcXGQrKVxcLik/KD86KFxcZCspXFwuKT8oXFwqfFxcZCspJC8pO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmVyc2lvbikgJiYgdmVyc2lvblsxXSA9PT0gJzAnICYmIHZlcnNpb25bMl0gPT09ICcxMCcpIHtcbiAgICAgICAgbmV4dFRpY2sgPSBzZXRJbW1lZGlhdGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIG5leHRUaWNrKGxpYiRyc3ZwJGFzYXAkJGZsdXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gdmVydHhcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRhc2FwJCR1c2VWZXJ0eFRpbWVyKCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBsaWIkcnN2cCRhc2FwJCR2ZXJ0eE5leHQobGliJHJzdnAkYXNhcCQkZmx1c2gpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCkge1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgdmFyIG9ic2VydmVyID0gbmV3IGxpYiRyc3ZwJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGxpYiRyc3ZwJGFzYXAkJGZsdXNoKTtcbiAgICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbm9kZS5kYXRhID0gKGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gd2ViIHdvcmtlclxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGliJHJzdnAkYXNhcCQkZmx1c2g7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRhc2FwJCR1c2VTZXRUaW1lb3V0KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGxpYiRyc3ZwJGFzYXAkJGZsdXNoLCAxKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGxpYiRyc3ZwJGFzYXAkJHF1ZXVlID0gbmV3IEFycmF5KDEwMDApO1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGFzYXAkJGZsdXNoKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaWIkcnN2cCRhc2FwJCRsZW47IGkrPTIpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gbGliJHJzdnAkYXNhcCQkcXVldWVbaV07XG4gICAgICAgIHZhciBhcmcgPSBsaWIkcnN2cCRhc2FwJCRxdWV1ZVtpKzFdO1xuXG4gICAgICAgIGNhbGxiYWNrKGFyZyk7XG5cbiAgICAgICAgbGliJHJzdnAkYXNhcCQkcXVldWVbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIGxpYiRyc3ZwJGFzYXAkJHF1ZXVlW2krMV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIGxpYiRyc3ZwJGFzYXAkJGxlbiA9IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkYXNhcCQkYXR0ZW1wdFZlcnRleCgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByID0gcmVxdWlyZTtcbiAgICAgICAgdmFyIHZlcnR4ID0gcigndmVydHgnKTtcbiAgICAgICAgbGliJHJzdnAkYXNhcCQkdmVydHhOZXh0ID0gdmVydHgucnVuT25Mb29wIHx8IHZlcnR4LnJ1bk9uQ29udGV4dDtcbiAgICAgICAgcmV0dXJuIGxpYiRyc3ZwJGFzYXAkJHVzZVZlcnR4VGltZXIoKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gbGliJHJzdnAkYXNhcCQkdXNlU2V0VGltZW91dCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBsaWIkcnN2cCRhc2FwJCRzY2hlZHVsZUZsdXNoO1xuICAgIC8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG4gICAgaWYgKGxpYiRyc3ZwJGFzYXAkJGlzTm9kZSkge1xuICAgICAgbGliJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRyc3ZwJGFzYXAkJHVzZU5leHRUaWNrKCk7XG4gICAgfSBlbHNlIGlmIChsaWIkcnN2cCRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgbGliJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRyc3ZwJGFzYXAkJHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbiAgICB9IGVsc2UgaWYgKGxpYiRyc3ZwJGFzYXAkJGlzV29ya2VyKSB7XG4gICAgICBsaWIkcnN2cCRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJHJzdnAkYXNhcCQkdXNlTWVzc2FnZUNoYW5uZWwoKTtcbiAgICB9IGVsc2UgaWYgKGxpYiRyc3ZwJGFzYXAkJGJyb3dzZXJXaW5kb3cgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbGliJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRyc3ZwJGFzYXAkJGF0dGVtcHRWZXJ0ZXgoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGliJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRyc3ZwJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkZGVmZXIkJGRlZmVyKGxhYmVsKSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSB7fTtcblxuICAgICAgZGVmZXJyZWRbJ3Byb21pc2UnXSA9IG5ldyBsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0KGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBkZWZlcnJlZFsncmVzb2x2ZSddID0gcmVzb2x2ZTtcbiAgICAgICAgZGVmZXJyZWRbJ3JlamVjdCddID0gcmVqZWN0O1xuICAgICAgfSwgbGFiZWwpO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQ7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRkZWZlciQkZGVmYXVsdCA9IGxpYiRyc3ZwJGRlZmVyJCRkZWZlcjtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRmaWx0ZXIkJGZpbHRlcihwcm9taXNlcywgZmlsdGVyRm4sIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwocHJvbWlzZXMsIGxhYmVsKS50aGVuKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBpZiAoIWxpYiRyc3ZwJHV0aWxzJCRpc0Z1bmN0aW9uKGZpbHRlckZuKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgZnVuY3Rpb24gYXMgZmlsdGVyJ3Mgc2Vjb25kIGFyZ3VtZW50LlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSB2YWx1ZXMubGVuZ3RoO1xuICAgICAgICB2YXIgZmlsdGVyZWQgPSBuZXcgQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZmlsdGVyZWRbaV0gPSBmaWx0ZXJGbih2YWx1ZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKGZpbHRlcmVkLCBsYWJlbCkudGhlbihmdW5jdGlvbihmaWx0ZXJlZCkge1xuICAgICAgICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgdmFyIG5ld0xlbmd0aCA9IDA7XG5cbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZmlsdGVyZWRbaV0pIHtcbiAgICAgICAgICAgICAgcmVzdWx0c1tuZXdMZW5ndGhdID0gdmFsdWVzW2ldO1xuICAgICAgICAgICAgICBuZXdMZW5ndGgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXN1bHRzLmxlbmd0aCA9IG5ld0xlbmd0aDtcblxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgbGliJHJzdnAkZmlsdGVyJCRkZWZhdWx0ID0gbGliJHJzdnAkZmlsdGVyJCRmaWx0ZXI7XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoKENvbnN0cnVjdG9yLCBvYmplY3QsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9zdXBlckNvbnN0cnVjdG9yKENvbnN0cnVjdG9yLCBvYmplY3QsIHRydWUsIGxhYmVsKTtcbiAgICB9XG5cbiAgICB2YXIgbGliJHJzdnAkcHJvbWlzZSRoYXNoJCRkZWZhdWx0ID0gbGliJHJzdnAkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaDtcblxuICAgIGxpYiRyc3ZwJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlID0gbGliJHJzdnAkdXRpbHMkJG9fY3JlYXRlKGxpYiRyc3ZwJGVudW1lcmF0b3IkJGRlZmF1bHQucHJvdG90eXBlKTtcbiAgICBsaWIkcnN2cCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5fc3VwZXJDb25zdHJ1Y3RvciA9IGxpYiRyc3ZwJGVudW1lcmF0b3IkJGRlZmF1bHQ7XG4gICAgbGliJHJzdnAkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IHt9O1xuICAgIH07XG5cbiAgICBsaWIkcnN2cCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5fdmFsaWRhdGVJbnB1dCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICByZXR1cm4gaW5wdXQgJiYgdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JztcbiAgICB9O1xuXG4gICAgbGliJHJzdnAkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUuX3ZhbGlkYXRpb25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignUHJvbWlzZS5oYXNoIG11c3QgYmUgY2FsbGVkIHdpdGggYW4gb2JqZWN0Jyk7XG4gICAgfTtcblxuICAgIGxpYiRyc3ZwJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcbiAgICAgIHZhciBwcm9taXNlICAgID0gZW51bWVyYXRvci5wcm9taXNlO1xuICAgICAgdmFyIGlucHV0ICAgICAgPSBlbnVtZXJhdG9yLl9pbnB1dDtcbiAgICAgIHZhciByZXN1bHRzICAgID0gW107XG5cbiAgICAgIGZvciAodmFyIGtleSBpbiBpbnB1dCkge1xuICAgICAgICBpZiAocHJvbWlzZS5fc3RhdGUgPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkUEVORElORyAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaW5wdXQsIGtleSkpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgcG9zaXRpb246IGtleSxcbiAgICAgICAgICAgIGVudHJ5OiBpbnB1dFtrZXldXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGxlbmd0aCA9IHJlc3VsdHMubGVuZ3RoO1xuICAgICAgZW51bWVyYXRvci5fcmVtYWluaW5nID0gbGVuZ3RoO1xuICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSBsaWIkcnN2cCQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdHNbaV07XG4gICAgICAgIGVudW1lcmF0b3IuX2VhY2hFbnRyeShyZXN1bHQuZW50cnksIHJlc3VsdC5wb3NpdGlvbik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQoQ29uc3RydWN0b3IsIG9iamVjdCwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX3N1cGVyQ29uc3RydWN0b3IoQ29uc3RydWN0b3IsIG9iamVjdCwgZmFsc2UsIGxhYmVsKTtcbiAgICB9XG5cbiAgICBsaWIkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkLnByb3RvdHlwZSA9IGxpYiRyc3ZwJHV0aWxzJCRvX2NyZWF0ZShsaWIkcnN2cCRwcm9taXNlJGhhc2gkJGRlZmF1bHQucHJvdG90eXBlKTtcbiAgICBsaWIkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkLnByb3RvdHlwZS5fc3VwZXJDb25zdHJ1Y3RvciA9IGxpYiRyc3ZwJGVudW1lcmF0b3IkJGRlZmF1bHQ7XG4gICAgbGliJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZC5wcm90b3R5cGUuX21ha2VSZXN1bHQgPSBsaWIkcnN2cCRlbnVtZXJhdG9yJCRtYWtlU2V0dGxlZFJlc3VsdDtcblxuICAgIGxpYiRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ2hhc2hTZXR0bGVkIG11c3QgYmUgY2FsbGVkIHdpdGggYW4gb2JqZWN0Jyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGhhc2gkc2V0dGxlZCQkaGFzaFNldHRsZWQob2JqZWN0LCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyBsaWIkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkKGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQsIG9iamVjdCwgbGFiZWwpLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRoYXNoJHNldHRsZWQkJGRlZmF1bHQgPSBsaWIkcnN2cCRoYXNoJHNldHRsZWQkJGhhc2hTZXR0bGVkO1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGhhc2gkJGhhc2gob2JqZWN0LCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyBsaWIkcnN2cCRwcm9taXNlJGhhc2gkJGRlZmF1bHQobGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCwgb2JqZWN0LCBsYWJlbCkucHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRyc3ZwJGhhc2gkJGRlZmF1bHQgPSBsaWIkcnN2cCRoYXNoJCRoYXNoO1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJG1hcCQkbWFwKHByb21pc2VzLCBtYXBGbiwgbGFiZWwpIHtcbiAgICAgIHJldHVybiBsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChwcm9taXNlcywgbGFiZWwpLnRoZW4oZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIGlmICghbGliJHJzdnAkdXRpbHMkJGlzRnVuY3Rpb24obWFwRm4pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHBhc3MgYSBmdW5jdGlvbiBhcyBtYXAncyBzZWNvbmQgYXJndW1lbnQuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGg7XG4gICAgICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgIHJlc3VsdHNbaV0gPSBtYXBGbih2YWx1ZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKHJlc3VsdHMsIGxhYmVsKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgbGliJHJzdnAkbWFwJCRkZWZhdWx0ID0gbGliJHJzdnAkbWFwJCRtYXA7XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRub2RlJCRSZXN1bHQoKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHZhciBsaWIkcnN2cCRub2RlJCRFUlJPUiA9IG5ldyBsaWIkcnN2cCRub2RlJCRSZXN1bHQoKTtcbiAgICB2YXIgbGliJHJzdnAkbm9kZSQkR0VUX1RIRU5fRVJST1IgPSBuZXcgbGliJHJzdnAkbm9kZSQkUmVzdWx0KCk7XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRub2RlJCRnZXRUaGVuKG9iaikge1xuICAgICAgdHJ5IHtcbiAgICAgICByZXR1cm4gb2JqLnRoZW47XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIGxpYiRyc3ZwJG5vZGUkJEVSUk9SLnZhbHVlPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuIGxpYiRyc3ZwJG5vZGUkJEVSUk9SO1xuICAgICAgfVxuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkbm9kZSQkdHJ5QXBwbHkoZiwgcywgYSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZi5hcHBseShzLCBhKTtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgbGliJHJzdnAkbm9kZSQkRVJST1IudmFsdWUgPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuIGxpYiRyc3ZwJG5vZGUkJEVSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJG5vZGUkJG1ha2VPYmplY3QoXywgYXJndW1lbnROYW1lcykge1xuICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgdmFyIG5hbWU7XG4gICAgICB2YXIgaTtcbiAgICAgIHZhciBsZW5ndGggPSBfLmxlbmd0aDtcbiAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbGVuZ3RoOyB4KyspIHtcbiAgICAgICAgYXJnc1t4XSA9IF9beF07XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBhcmd1bWVudE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5hbWUgPSBhcmd1bWVudE5hbWVzW2ldO1xuICAgICAgICBvYmpbbmFtZV0gPSBhcmdzW2kgKyAxXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRub2RlJCRhcnJheVJlc3VsdChfKSB7XG4gICAgICB2YXIgbGVuZ3RoID0gXy5sZW5ndGg7XG4gICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsZW5ndGggLSAxKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzW2kgLSAxXSA9IF9baV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhcmdzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJG5vZGUkJHdyYXBUaGVuYWJsZSh0aGVuLCBwcm9taXNlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aGVuOiBmdW5jdGlvbihvbkZ1bEZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgICAgIHJldHVybiB0aGVuLmNhbGwocHJvbWlzZSwgb25GdWxGaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJG5vZGUkJGRlbm9kZWlmeShub2RlRnVuYywgb3B0aW9ucykge1xuICAgICAgdmFyIGZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsICsgMSk7XG4gICAgICAgIHZhciBhcmc7XG4gICAgICAgIHZhciBwcm9taXNlSW5wdXQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgIGFyZyA9IGFyZ3VtZW50c1tpXTtcblxuICAgICAgICAgIGlmICghcHJvbWlzZUlucHV0KSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBjbGVhbiB0aGlzIHVwXG4gICAgICAgICAgICBwcm9taXNlSW5wdXQgPSBsaWIkcnN2cCRub2RlJCRuZWVkc1Byb21pc2VJbnB1dChhcmcpO1xuICAgICAgICAgICAgaWYgKHByb21pc2VJbnB1dCA9PT0gbGliJHJzdnAkbm9kZSQkR0VUX1RIRU5fRVJST1IpIHtcbiAgICAgICAgICAgICAgdmFyIHAgPSBuZXcgbGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdChsaWIkcnN2cCQkaW50ZXJuYWwkJG5vb3ApO1xuICAgICAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwLCBsaWIkcnN2cCRub2RlJCRHRVRfVEhFTl9FUlJPUi52YWx1ZSk7XG4gICAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9taXNlSW5wdXQgJiYgcHJvbWlzZUlucHV0ICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgIGFyZyA9IGxpYiRyc3ZwJG5vZGUkJHdyYXBUaGVuYWJsZShwcm9taXNlSW5wdXQsIGFyZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGFyZ3NbaV0gPSBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0KGxpYiRyc3ZwJCRpbnRlcm5hbCQkbm9vcCk7XG5cbiAgICAgICAgYXJnc1tsXSA9IGZ1bmN0aW9uKGVyciwgdmFsKSB7XG4gICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycik7XG4gICAgICAgICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbCk7XG4gICAgICAgICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdHJ1ZSlcbiAgICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCBsaWIkcnN2cCRub2RlJCRhcnJheVJlc3VsdChhcmd1bWVudHMpKTtcbiAgICAgICAgICBlbHNlIGlmIChsaWIkcnN2cCR1dGlscyQkaXNBcnJheShvcHRpb25zKSlcbiAgICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCBsaWIkcnN2cCRub2RlJCRtYWtlT2JqZWN0KGFyZ3VtZW50cywgb3B0aW9ucykpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWwpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChwcm9taXNlSW5wdXQpIHtcbiAgICAgICAgICByZXR1cm4gbGliJHJzdnAkbm9kZSQkaGFuZGxlUHJvbWlzZUlucHV0KHByb21pc2UsIGFyZ3MsIG5vZGVGdW5jLCBzZWxmKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbGliJHJzdnAkbm9kZSQkaGFuZGxlVmFsdWVJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZik7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGZuLl9fcHJvdG9fXyA9IG5vZGVGdW5jO1xuXG4gICAgICByZXR1cm4gZm47XG4gICAgfVxuXG4gICAgdmFyIGxpYiRyc3ZwJG5vZGUkJGRlZmF1bHQgPSBsaWIkcnN2cCRub2RlJCRkZW5vZGVpZnk7XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRub2RlJCRoYW5kbGVWYWx1ZUlucHV0KHByb21pc2UsIGFyZ3MsIG5vZGVGdW5jLCBzZWxmKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gbGliJHJzdnAkbm9kZSQkdHJ5QXBwbHkobm9kZUZ1bmMsIHNlbGYsIGFyZ3MpO1xuICAgICAgaWYgKHJlc3VsdCA9PT0gbGliJHJzdnAkbm9kZSQkRVJST1IpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVzdWx0LnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJG5vZGUkJGhhbmRsZVByb21pc2VJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZil7XG4gICAgICByZXR1cm4gbGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwoYXJncykudGhlbihmdW5jdGlvbihhcmdzKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGxpYiRyc3ZwJG5vZGUkJHRyeUFwcGx5KG5vZGVGdW5jLCBzZWxmLCBhcmdzKTtcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gbGliJHJzdnAkbm9kZSQkRVJST1IpIHtcbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZXN1bHQudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkbm9kZSQkbmVlZHNQcm9taXNlSW5wdXQoYXJnKSB7XG4gICAgICBpZiAoYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmIChhcmcuY29uc3RydWN0b3IgPT09IGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbGliJHJzdnAkbm9kZSQkZ2V0VGhlbihhcmcpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRwbGF0Zm9ybSQkcGxhdGZvcm07XG5cbiAgICAvKiBnbG9iYWwgc2VsZiAqL1xuICAgIGlmICh0eXBlb2Ygc2VsZiA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGxpYiRyc3ZwJHBsYXRmb3JtJCRwbGF0Zm9ybSA9IHNlbGY7XG5cbiAgICAvKiBnbG9iYWwgZ2xvYmFsICovXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsID09PSAnb2JqZWN0Jykge1xuICAgICAgbGliJHJzdnAkcGxhdGZvcm0kJHBsYXRmb3JtID0gZ2xvYmFsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIGdsb2JhbDogYHNlbGZgIG9yIGBnbG9iYWxgIGZvdW5kJyk7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRyc3ZwJHBsYXRmb3JtJCRkZWZhdWx0ID0gbGliJHJzdnAkcGxhdGZvcm0kJHBsYXRmb3JtO1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJHJhY2UkJHJhY2UoYXJyYXksIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5yYWNlKGFycmF5LCBsYWJlbCk7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRyYWNlJCRkZWZhdWx0ID0gbGliJHJzdnAkcmFjZSQkcmFjZTtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRyZWplY3QkJHJlamVjdChyZWFzb24sIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5yZWplY3QocmVhc29uLCBsYWJlbCk7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRyZWplY3QkJGRlZmF1bHQgPSBsaWIkcnN2cCRyZWplY3QkJHJlamVjdDtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRyZXNvbHZlJCRyZXNvbHZlKHZhbHVlLCBsYWJlbCkge1xuICAgICAgcmV0dXJuIGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQucmVzb2x2ZSh2YWx1ZSwgbGFiZWwpO1xuICAgIH1cbiAgICB2YXIgbGliJHJzdnAkcmVzb2x2ZSQkZGVmYXVsdCA9IGxpYiRyc3ZwJHJlc29sdmUkJHJlc29sdmU7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkcmV0aHJvdyQkcmV0aHJvdyhyZWFzb24pIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgIH0pO1xuICAgICAgdGhyb3cgcmVhc29uO1xuICAgIH1cbiAgICB2YXIgbGliJHJzdnAkcmV0aHJvdyQkZGVmYXVsdCA9IGxpYiRyc3ZwJHJldGhyb3ckJHJldGhyb3c7XG5cbiAgICAvLyBkZWZhdWx0c1xuICAgIGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jID0gbGliJHJzdnAkYXNhcCQkZGVmYXVsdDtcbiAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZy5hZnRlciA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgICBzZXRUaW1lb3V0KGNiLCAwKTtcbiAgICB9O1xuICAgIHZhciBsaWIkcnN2cCQkY2FzdCA9IGxpYiRyc3ZwJHJlc29sdmUkJGRlZmF1bHQ7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkJGFzeW5jKGNhbGxiYWNrLCBhcmcpIHtcbiAgICAgIGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKGNhbGxiYWNrLCBhcmcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRvbigpIHtcbiAgICAgIGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnWydvbiddLmFwcGx5KGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRvZmYoKSB7XG4gICAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZ1snb2ZmJ10uYXBwbHkobGliJHJzdnAkY29uZmlnJCRjb25maWcsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHVwIGluc3RydW1lbnRhdGlvbiB0aHJvdWdoIGB3aW5kb3cuX19QUk9NSVNFX0lOVFJVTUVOVEFUSU9OX19gXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3dbJ19fUFJPTUlTRV9JTlNUUlVNRU5UQVRJT05fXyddID09PSAnb2JqZWN0Jykge1xuICAgICAgdmFyIGxpYiRyc3ZwJCRjYWxsYmFja3MgPSB3aW5kb3dbJ19fUFJPTUlTRV9JTlNUUlVNRU5UQVRJT05fXyddO1xuICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWd1cmUoJ2luc3RydW1lbnQnLCB0cnVlKTtcbiAgICAgIGZvciAodmFyIGxpYiRyc3ZwJCRldmVudE5hbWUgaW4gbGliJHJzdnAkJGNhbGxiYWNrcykge1xuICAgICAgICBpZiAobGliJHJzdnAkJGNhbGxiYWNrcy5oYXNPd25Qcm9wZXJ0eShsaWIkcnN2cCQkZXZlbnROYW1lKSkge1xuICAgICAgICAgIGxpYiRyc3ZwJCRvbihsaWIkcnN2cCQkZXZlbnROYW1lLCBsaWIkcnN2cCQkY2FsbGJhY2tzW2xpYiRyc3ZwJCRldmVudE5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBsaWIkcnN2cCR1bWQkJFJTVlAgPSB7XG4gICAgICAncmFjZSc6IGxpYiRyc3ZwJHJhY2UkJGRlZmF1bHQsXG4gICAgICAnUHJvbWlzZSc6IGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQsXG4gICAgICAnYWxsU2V0dGxlZCc6IGxpYiRyc3ZwJGFsbCRzZXR0bGVkJCRkZWZhdWx0LFxuICAgICAgJ2hhc2gnOiBsaWIkcnN2cCRoYXNoJCRkZWZhdWx0LFxuICAgICAgJ2hhc2hTZXR0bGVkJzogbGliJHJzdnAkaGFzaCRzZXR0bGVkJCRkZWZhdWx0LFxuICAgICAgJ2Rlbm9kZWlmeSc6IGxpYiRyc3ZwJG5vZGUkJGRlZmF1bHQsXG4gICAgICAnb24nOiBsaWIkcnN2cCQkb24sXG4gICAgICAnb2ZmJzogbGliJHJzdnAkJG9mZixcbiAgICAgICdtYXAnOiBsaWIkcnN2cCRtYXAkJGRlZmF1bHQsXG4gICAgICAnZmlsdGVyJzogbGliJHJzdnAkZmlsdGVyJCRkZWZhdWx0LFxuICAgICAgJ3Jlc29sdmUnOiBsaWIkcnN2cCRyZXNvbHZlJCRkZWZhdWx0LFxuICAgICAgJ3JlamVjdCc6IGxpYiRyc3ZwJHJlamVjdCQkZGVmYXVsdCxcbiAgICAgICdhbGwnOiBsaWIkcnN2cCRhbGwkJGRlZmF1bHQsXG4gICAgICAncmV0aHJvdyc6IGxpYiRyc3ZwJHJldGhyb3ckJGRlZmF1bHQsXG4gICAgICAnZGVmZXInOiBsaWIkcnN2cCRkZWZlciQkZGVmYXVsdCxcbiAgICAgICdFdmVudFRhcmdldCc6IGxpYiRyc3ZwJGV2ZW50cyQkZGVmYXVsdCxcbiAgICAgICdjb25maWd1cmUnOiBsaWIkcnN2cCRjb25maWckJGNvbmZpZ3VyZSxcbiAgICAgICdhc3luYyc6IGxpYiRyc3ZwJCRhc3luY1xuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZGVmaW5lOnRydWUgbW9kdWxlOnRydWUgd2luZG93OiB0cnVlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbGliJHJzdnAkdW1kJCRSU1ZQOyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZVsnZXhwb3J0cyddKSB7XG4gICAgICBtb2R1bGVbJ2V4cG9ydHMnXSA9IGxpYiRyc3ZwJHVtZCQkUlNWUDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBsaWIkcnN2cCRwbGF0Zm9ybSQkZGVmYXVsdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGxpYiRyc3ZwJHBsYXRmb3JtJCRkZWZhdWx0WydSU1ZQJ10gPSBsaWIkcnN2cCR1bWQkJFJTVlA7XG4gICAgfVxufSkuY2FsbCh0aGlzKTtcblxuIl19

//# sourceMappingURL=algorithm_visualizer.js.map
