// ==UserScript==
// @name        Enhance! for Basecamp
// @description Adds various enhancements to Basecamp, includeing collapsable to-do lists, priority colouring and quick links
// @include     http://basecamphq.com/*
// @include     https://basecamphq.com/*
// @include     http://*.basecamphq.com/*
// @include     https://*.basecamphq.com/*
// @version     0.3
// @author      Mike Robinson
// @homepage    http://twitter.com/akamike
// ==/UserScript==

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------
var config = {
  'todoCollapse': true, // Adds a handy button to collapse to-do lists on the overview
  'quickLinks': true,   // Adds quick links to the overview for timesheets and to-do comments
  'filters': true,      // Adds to-do list filters on the overview
  'forms': true,        // Adds select box time forms for common data entry
  'priorities': true,   // Add colour coded priorities to to-dos: prefix with [HOT], [WARM] or [COLD]
  'todoIDs': true,      // Add todo IDs and todo ID linking
  'colours': {          // colours for prioritised to-dos
    'hot': '#C00400',   // #C00400
    'warm': '#D96B00',  // #D96B00
    'cold': '#5BB0F2'   // #5BB0F2
  }
};

// ------------------------------------------------------------
// Enhance!
// ------------------------------------------------------------

var Enhance = function(){
  // Add custom styles
  var style = document.createElement('style');
  style.textContent = [
    '.quick_link { font-size:11px; font-weight:normal; text-decoration:none; background:transparent url(https://asset0.basecamphq.com/images/basecamp_sprites.png) no-repeat 0 0; width:17px; text-indent:-9999px; display:inline-block; line-height:17px; visibility:hidden; }',
    '.todo_list:hover h2 .quick_link, tr:hover .quick_link { visibility:visible; }',
    '.quick_link:hover { background-color:transparent; cursor:pointer; }',
    '.quick_link.time { background-position:-392px 0; }',
    '.quick_link.comments { background-position:-104px 0; width:13px; line-height:13px; margin:2px 0 0 5px; }',
    '.todo_id { padding-left:5px; font-size:11px; color:#999; }',
    '#collapse { position:absolute; left:30px; top:55px; }',
    'h2 button, #collapse button { background-color:#EEE; border:solid 1px #CCC; margin-left:-5px; width:17px; height:16px; text-align:center; line-height:14px; padding:0; position:relative; top:-2px; }',
    '#collapse button { width:85px; padding:0 5px; text-align:left; }',
    'h2 button:hover, #collapse button:hover { background-color:#FFF; cursor:pointer; }',
    '#filters { display:inline; font-size:11px; }',
    '#filters label { cursor:pointer; }',
    '.todo_cold { color:' + config.colours.cold + '; }',
    '.todo_warm { color:' + config.colours.warm + '; }',
    '.todo_hot { color:' + config.colours.hot + '; }',
    '.hidden { display:none; }'
  ].join('\n');

  document.getElementsByTagName('head')[0].appendChild(style);

  // Helper stuff
  var body = document.getElementsByTagName('body')[0];

  /*
   * Check if the provided element has a specific class
   */
  function eHasClass(target, search) {
    if (target.className.indexOf(search) != -1) {
      return true;
    }

    return false;
  }

  /*
   * Show the provided element
   */
  function eShow(target) {
    if (isArray(target) || isNodeList(target)) {
      for (var i = 0; i < target.length; i++) {
        eShow(target[i]);
      }
    } else if (target instanceof Element && eHasClass(target, 'hidden')) {
      target.className = target.className.replace(/ hidden/, '');
    }
  }

  /*
   * Hide the provided element
   */
   function eHide(target) {
    if (isArray(target) || isNodeList(target)) {
      for (var i = 0; i < target.length; i++) {
        eHide(target[i]);
      }
    } else if (target instanceof Element && !eHasClass(target, 'hidden')) {
      target.className += ' hidden';
    }
  }

  /*
   * Testing for Arrays and NodeLists
   */
  function isArray(target) {
    return target.constructor == Array;
  }

  function isNodeList(target) {
    return target.constructor == NodeList;
  }

  /*
   * Hide/show event handler for todo collapsing
   */
  function hideTodo(e){
    eHide([e.target.parentNode.nextSibling.nextSibling, e.target]);
    eShow(e.target.nextSibling);

    e.preventDefault();
  }

  function showTodo(e){
    eShow([e.target.parentNode.nextSibling.nextSibling, e.target.previousSibling]);
    eHide(e.target);

    e.preventDefault();
  }

  function hideAllTodo(e){
    eHide([tables, minButtons, e.target]);
    eShow([maxButtons, e.target.nextSibling]);

    e.preventDefault();
  }

  function showAllTodo(e){
    eShow([tables, minButtons, e.target.previousSibling]);
    eHide([maxButtons, e.target]);

    e.preventDefault();
  }

  /*
   * Hide show event handler for todo filtering
   */
  function filterLists(e) {
    var rows = body.querySelectorAll('.todo_list table tr[class]:not([class=" hidden"])');
    var affected = [];

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];

      if (row.textContent.indexOf(e.target.value) != -1) {
        affected.push(row);

        if (row.nextSibling) {
          affected = getSimilarRows(row.nextSibling, affected);
        }
      }
    }

    if (e.target.checked) {
      eShow(affected);
    } else {
      eHide(affected);
    }
  }

  function getSimilarRows(el, ar) {
    if (!el.className || el.className == ' hidden') {
      ar.push(el);

      if (el.nextSibling) {
        return getSimilarRows(el.nextSibling, ar);
      }
    }

    return ar;
  }

  /*
   * Now let's add some features!
   */
  if (eHasClass(body, 'todoglobal')) {
    var todoLists = body.querySelectorAll('.todo_list');

    if (todoLists.length > 0) {
      for (var i = 0; i < todoLists.length; i++) {
        var list = todoLists[i];
        var h2 = list.getElementsByTagName('h2')[0];

        if (config.todoCollapse) {
          var minButton = document.createElement('button');
              minButton.className = 'hide';
              minButton.title = 'Collapse';
              minButton.textContent = '-';
              minButton.addEventListener('click', hideTodo);

          var maxButton = document.createElement('button');
              maxButton.className = 'show hidden';
              maxButton.title = 'Expand';
              maxButton.textContent = '+';
              maxButton.addEventListener('click', showTodo);

          h2.insertBefore(maxButton, h2.firstChild);
          h2.insertBefore(minButton, maxButton);
        }

        // Quick links
        if (config.quickLinks || config.todoIDs) {
          var proj = h2.getElementsByTagName('a')[0].href.replace('todo_lists', '');

          if (config.quickLinks) {
            // Timesheet
            var timesheet = document.createElement('a');
                timesheet.href = proj + 'time_entries';
                timesheet.className = 'quick_link time';
                timesheet.textContent = 'Timesheet';
            h2.appendChild(timesheet);
          }

          // Todo comments
          var rows = list.getElementsByTagName('tr');

          for (var x = 0; x < rows.length; x++) {
            var row = rows[x];
            var id = row.getElementsByTagName('small')[0].id.split('_');

            if (config.quickLinks) {
              var comments = document.createElement('a');
                  comments.href = proj + 'todo_items/' + id[1] + '/comments';
                  comments.className = 'quick_link comments';
                  comments.textContent = 'Comments';
              row.querySelector('td:last-child').appendChild(comments);
            }

            // Todo IDs
            if (config.todoIDs) {
              var visibleId = document.createElement('span');
                  visibleId.className = 'todo_id';
                  visibleId.textContent = '[#' + id[1] + ']';
              row.querySelector('td:last-child .content').appendChild(visibleId);
            }
          }
        }
      }

      if (config.todoCollapse) {
        // Expand/Collapse all buttons
        var inner = body.querySelector('.Full .innercol');
        var tables = inner.querySelectorAll('.todolist');
        var minButtons = inner.querySelectorAll('.todo_list .hide');
        var maxButtons = inner.querySelectorAll('.todo_list .show');

        var collapseButton = document.createElement('button');
            collapseButton.className = 'hide';
            collapseButton.textContent = '- Collapse All';
            collapseButton.addEventListener('click', hideAllTodo);

        var expandButton = document.createElement('button');
            expandButton.className = 'show hidden';
            expandButton.textContent = '+ Expand All';
            expandButton.addEventListener('click', showAllTodo);

        var collapseExpand = document.createElement('div');
            collapseExpand.id = 'collapse';

        collapseExpand.appendChild(collapseButton);
        collapseExpand.appendChild(expandButton);

        inner.insertBefore(collapseExpand, inner.firstChild);
      }
    }

    // Filters
    if (config.filters) {
      // Containing div
      var filters = document.createElement('div');
          filters.id = 'filters';

      // On hold
      var onHold = document.createElement('label');
          onHold.setAttribute('for', 'onhold');
          onHold.textContent = 'On hold';

      var onHoldInput = document.createElement('input');
          onHoldInput.type = 'checkbox';
          onHoldInput.name = 'onhold';
          onHoldInput.id = 'onhold';
          onHoldInput.value = 'On hold';
          onHoldInput.checked = 'checked';
          onHoldInput.addEventListener('click', filterLists);

      onHold.insertBefore(onHoldInput, onHold.childNodes[0]);

      // Active
      var active = document.createElement('label');
          active.setAttribute('for', 'active');
          active.textContent = 'Active';

      var activeInput = document.createElement('input');
          activeInput.type = 'checkbox';
          activeInput.name = 'active';
          activeInput.id = 'active';
          activeInput.value = 'Active';
          activeInput.checked = 'checked';
          activeInput.addEventListener('click', filterLists);

      active.insertBefore(activeInput, active.childNodes[0]);

      // New - named newOpt to avoid keyword
      var newOpt = document.createElement('label');
          newOpt.setAttribute('for', 'new');
          newOpt.textContent = 'New';

      var newInput = document.createElement('input');
          newInput.type = 'checkbox';
          newInput.name = 'new';
          newInput.id = 'new';
          newInput.value = 'New';
          newInput.checked = 'checked';
          newInput.addEventListener('click', filterLists);

      newOpt.insertBefore(newInput, newOpt.childNodes[0]);

      filters.appendChild(onHold);
      filters.appendChild(active);
      filters.appendChild(newOpt);

      // Drop in the filters
      var responsible = document.getElementById('responsible_party_form');
      responsible.appendChild(filters);

      // Forcing style
      body.querySelector('div.page_header_links').setAttribute('style', 'width:600px !important');
    }
  }

  // Priorities
  if (config.priorities) {
    var todos = body.querySelectorAll('.todolist .content, .item .item_content, .items_wrapper .content span, .page_header .content .item, .event .item span');

    for (var i = 0; i < todos.length; i++) {
      var todo = todos[i];
      var t = todo.textContent.match(/\[(HOT|WARM|COLD)(?=\])/g);

      if (t) {
        todo.className += ' todo_' + t[0].substr(1,4).toLowerCase();
      }
    }
  }

  // Overview Quick link
  if (config.quickLinks) {
    // Separating pipe
    var separator = document.createElement('span');
        separator.className = 'pipe';
        separator.textContent = '|';

    // The actual link
    var overviewLink = document.createElement('a');
        overviewLink.href = '/todo_lists';
        overviewLink.textContent = 'Overview';

    // Adding required HTML and spaces
    var globalLinks = document.getElementById('settings_signout_and_help');
        globalLinks.insertBefore(overviewLink, globalLinks.childNodes[2]);
        globalLinks.insertBefore(document.createTextNode(' '), overviewLink);
        globalLinks.insertBefore(separator, overviewLink.previousSibling);
        globalLinks.insertBefore(document.createTextNode(' '), separator);
  }

  // Inline todo ID linking
  if (config.todoIDs) {
    var paras = body.querySelectorAll('.formatted_text_body p');

    if (paras.length > 0) {
      for (var i = 0; i < paras.length; i++) {
        paras[i].innerHTML = paras[i].innerHTML.replace(/\#([0-9]{1,})/g, '<a href="/todo_items/$1/comments">#$1</a>');
      }
    }
  }

  if (config.forms && eHasClass(body, 'time')) {
    // Time entry simple time select
    var timeSelect = document.createElement('select');
        timeSelect.name = 'time_entry[hours]';
        timeSelect.id = 'time_entry_hours';

    var option = function(value, label){
      var opt = document.createElement('option');
          opt.value = value;
          opt.textContent = label;
      return opt;
    };

    timeSelect.appendChild(option(0, '---'));
    timeSelect.appendChild(option('0.25', '15 mins'));
    timeSelect.appendChild(option('0.50', '30 mins'));
    timeSelect.appendChild(option('0.75', '45 mins'));

    for (var i = 1; i <= 8; i++) {
      timeSelect.appendChild(option(i + '.00', i + ' hour' + (i > 1 ? 's' : '')));
      timeSelect.appendChild(option(i + '.25', i + 'h 15m'));
      timeSelect.appendChild(option(i + '.50', i + 'h 30m'));
      timeSelect.appendChild(option(i + '.75', i + 'h 45m'));
    }

    var oldTime = document.getElementById('time_entry_hours');
        oldTime.className += 'remove_me';
        oldTime.parentNode.appendChild(timeSelect);
        oldTime.parentNode.removeChild(oldTime);
        oldTime = null;
  }
}();
