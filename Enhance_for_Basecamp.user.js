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

var memory = window.localStorage;

// ------------------------------------------------------------
// Storage by Remy Sharp - https://gist.github.com/350433
// Used because Fluid forgets things when you close the app
// ------------------------------------------------------------

if (window.fluid) memory = (function () {
  var Storage = function (type) {
    function createCookie(name, value, days) {
      var date, expires;
  
      if (days) {
        date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        expires = "; expires="+date.toGMTString();
      } else {
        expires = "";
      }
      document.cookie = name+"="+value+expires+"; path=/";
    }
  
    function readCookie(name) {
      var nameEQ = name + "=",
          ca = document.cookie.split(';'),
          i, c;
  
      for (i=0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0)==' ') {
          c = c.substring(1,c.length);
        }
  
        if (c.indexOf(nameEQ) == 0) {
          return c.substring(nameEQ.length,c.length);
        }
      }
      return null;
    }
    
    function setData(data) {
      data = JSON.stringify(data);
      if (type == 'session') {
        window.name = data;
      } else {
        createCookie('localStorage', data, 365);
      }
    }
    
    function clearData() {
      if (type == 'session') {
        window.name = '';
      } else {
        createCookie('localStorage', '', 365);
      }
    }
    
    function getData() {
      var data = type == 'session' ? window.name : readCookie('localStorage');
      return data ? JSON.parse(data) : {};
    }
  
  
    // initialise if there's already data
    var data = getData();
  
    return {
      clear: function () {
        data = {};
        clearData();
      },
      getItem: function (key) {
        return data[key] === undefined ? null : data[key];
      },
      key: function (i) {
        // not perfect, but works
        var ctr = 0;
        for (var k in data) {
          if (ctr == i) return k;
          else ctr++;
        }
        return null;
      },
      removeItem: function (key) {
        delete data[key];
        setData(data);
      },
      setItem: function (key, value) {
        data[key] = value+''; // forces the value to a string
        setData(data);
      }
    };
  };
  
  return new Storage('local');
})();

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------
var config = memory.getItem('enhanceConfig') || {
  todoCollapse: true,
  quickLinks: true,
  priorities: true,
  colours: {
    hot: 'C00400',
    warm: 'D96B00',
    cold: '5BB0F2'
  }
};

if (config.constructor == String) {
  config = JSON.parse(config);
}

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
    '.priority { color:#fff; display:inline-block; padding:3px; font-size:0.8em; line-height:1.3em; text-transform:uppercase; margin-right:3px; border-radius:4px; width:31px; text-align:center; }',
    '.page_header .content .item .priority { width:45px; }',
    '.todo_cold { background-color:#' + config.colours.cold + '; }',
    '.todo_warm { background-color:#' + config.colours.warm + '; }',
    '.todo_hot { background-color:#' + config.colours.hot + '; }',
    '.hidden { display:none; }'
  ].join('\n');

  document.getElementsByTagName('head')[0].appendChild(style);

  // Helper stuff
  var body = document.getElementsByTagName('body')[0];
  
  /*
   * Stores the current state of the overview collapse state
   */
  function saveOverviewState() {
    var collapsed = body.querySelectorAll('.todo .hide.hidden');
    var toSave = [];
    
    if (collapsed) {
      for (var i = 0; i < collapsed.length; i++) {
        toSave.push(collapsed[i].parentNode.id.replace('project_', ''));
      }
    }
    
    var state = memory.getItem('enhanceOverview') || {};
    
    if (state.constructor == String) {
      state = JSON.parse(state);
    }
    
    state.collapse = toSave;
    memory.setItem('enhanceOverview', JSON.stringify(state));
  }

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
    saveOverviewState();

    e.preventDefault();
  }

  function showTodo(e){
    eShow([e.target.parentNode.nextSibling.nextSibling, e.target.previousSibling]);
    eHide(e.target);
    saveOverviewState();

    e.preventDefault();
  }

  function hideAllTodo(e){
    eHide([tables, minButtons, e.target]);
    eShow([maxButtons, e.target.nextSibling]);
    saveOverviewState();

    e.preventDefault();
  }

  function showAllTodo(e){
    eShow([tables, minButtons, e.target.previousSibling]);
    eHide([maxButtons, e.target]);
    saveOverviewState();

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
        var projectId = h2.getElementsByTagName('a')[0].href.split('/')[4];
        
        h2.id = 'project_' + projectId;

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
        
        var state = memory.getItem('enhanceOverview') || {};
        if (state.constructor == String) {
          state = JSON.parse(state);
        }
        
        if (state.collapse) {
          for (var i = 0; i < state.collapse.length; i++) {
            var list = document.getElementById('project_' + state.collapse[i]);
            
            if (list) {
              list.querySelector('button.hide')['click']();
            }
          }
        }
      }
    }
  }

  // Priorities
  if (config.priorities) {
    var todos = body.querySelectorAll('.todolist .content, .item .item_content, .items_wrapper .content span, .page_header .content .item, .event .item span');

    for (var i = 0; i < todos.length; i++) {
      var todo = todos[i];
      var t = todo.textContent.match(/\[(HOT|WARM|COLD)(?=\])/g);

      if (t) {
        var r = todo.innerHTML;
        todo.innerHTML = r.replace(t[0] + '] ', '');
        t = t[0].substr(1,4).toLowerCase();
        var todoPriority = document.createElement('span');
            todoPriority.textContent = t;
            todoPriority.className = 'priority todo_' + t;
        todo.insertBefore(todoPriority, todo.firstChild);
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