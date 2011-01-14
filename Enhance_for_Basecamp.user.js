// ==UserScript==
// @name        Enhance! for Basecamp
// @description Adds various enhancements to Basecamp, includeing collapsable to-do lists, priority colouring and quick links
// @include     http://basecamphq.com/*
// @include     https://basecamphq.com/*
// @include     http://*.basecamphq.com/*
// @include     https://*.basecamphq.com/*
// @version     0.2
// @author      Mike Robinson
// @homepage    http://twitter.com/akamike
// ==/UserScript==

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------
var config = {
  'todoCollapse': true, // Adds a handy button to collapse to-do lists on the overview
  'quickLinks': true,   // Adds quick links to the overview for timesheets and to-do comments
  'priorities': true,   // Add colour coded priorities to to-dos: prefix with [HOT], [WARM] or [COLD]
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
    '#collapse { position:absolute; left:30px; top:55px; }',
    'h2 button, #collapse button { background-color:#EEE; border:solid 1px #CCC; margin-left:-5px; width:17px; height:16px; text-align:center; line-height:14px; padding:0; position:relative; top:-2px; }',
    '#collapse button { width:85px; padding:0 5px; text-align:left; }',
    'h2 button:hover, #collapse button:hover { background-color:#FFF; cursor:pointer; }',
    '.todo_cold { color:' + config.colours.cold + '; }',
    '.todo_warm { color:' + config.colours.warm + '; }',
    '.todo_hot { color:' + config.colours.hot + '; }',
    '.hidden { display:none; }'
  ].join('\n');

  document.getElementsByTagName('head')[0].appendChild(style);

  // Helper stuff
  var body = document.getElementsByTagName('body')[0];

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
    } else if (eHasClass(target, 'hidden')) {
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
    } else if (!eHasClass(target, 'hidden')) {
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
        if (config.quickLinks) {
          // Timesheet
          var timesheet = document.createElement('a');
              timesheet.href = h2.getElementsByTagName('a')[0].href.replace('todo_lists', 'time_entries');
              timesheet.className = 'quick_link time';
              timesheet.textContent = 'Timesheet';
          h2.appendChild(timesheet);

          var proj = h2.getElementsByTagName('a')[0].href.replace('todo_lists', 'todo_items/');

          // Todo comments
          var rows = list.getElementsByTagName('tr');

          for (var x = 0; x < rows.length; x++) {
            var row = rows[x];
            var id = row.getElementsByTagName('small')[0].id.split('_');

            var comments = document.createElement('a');
                comments.href = proj + id[1] + '/comments';
                comments.className = 'quick_link comments';
                comments.textContent = 'Comments';
            row.querySelector('td:last-child').appendChild(comments);
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
  }

  // Priorities
  if (config.priorities) {
    var todos = body.querySelectorAll('.todolist .content, .item .item_content, .items_wrapper .content span, .page_header .content .item, .event .item span');

    for (var i = 0; i < todos.length; i++) {
      var todo = todos[i];
      var t = todo.textContent.match(/\[(HOT|WARM|COLD)\]/g);

      if (t) {
        var classSuffix = false;

        switch (t[0]) {
          case '[COLD]':
            classSuffix = 'cold';
            break;
          case '[WARM]':
            classSuffix = 'warm';
            break;
          case '[HOT]':
            classSuffix = 'hot';
            break;
        }

        if (classSuffix) {
          todo.className += ' todo_' + classSuffix;
        }
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
}();