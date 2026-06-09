(function () {
  'use strict';

  var API = '/api/todos';

  var state = {
    items: [],
    filter: 'all'
  };

  var dom = {};

  function init() {
    cacheDom();
    bindEvents();
    fetchTodos();
  }

  function cacheDom() {
    dom.input = document.getElementById('todoInput');
    dom.addBtn = document.getElementById('addBtn');
    dom.list = document.getElementById('todoList');
    dom.counter = document.getElementById('counter');
    dom.clearCompleted = document.getElementById('clearCompleted');
    dom.filters = document.querySelectorAll('.filter-btn');
  }

  function bindEvents() {
    dom.addBtn.addEventListener('click', addItem);
    dom.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') addItem();
    });

    dom.clearCompleted.addEventListener('click', clearCompleted);

    dom.filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setFilter(btn.dataset.filter);
      });
    });
  }

  function fetchTodos() {
    fetch(API)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        state.items = data.map(function (item) {
          return {
            id: item.id,
            text: item.text,
            completed: !!item.completed
          };
        });
        render();
      })
      .catch(function (err) {
        console.error('Failed to load todos:', err);
        render();
      });
  }

  function addItem() {
    var text = dom.input.value.trim();
    if (!text) return;

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    })
      .then(function (res) { return res.json(); })
      .then(function (item) {
        state.items.unshift({
          id: item.id,
          text: item.text,
          completed: !!item.completed
        });
        dom.input.value = '';
        dom.input.focus();
        render();
      })
      .catch(function (err) {
        console.error('Failed to add todo:', err);
      });
  }

  function removeItem(id) {
    fetch(API + '/' + id, { method: 'DELETE' })
      .then(function () {
        state.items = state.items.filter(function (item) {
          return item.id !== id;
        });
        render();
      })
      .catch(function (err) {
        console.error('Failed to delete todo:', err);
      });
  }

  function toggleItem(id) {
    var item = state.items.find(function (it) { return it.id === id; });
    if (!item) return;

    var newCompleted = !item.completed;

    fetch(API + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: newCompleted })
    })
      .then(function (res) { return res.json(); })
      .then(function (updated) {
        state.items = state.items.map(function (it) {
          if (it.id === id) {
            return { id: updated.id, text: updated.text, completed: !!updated.completed };
          }
          return it;
        });
        render();
      })
      .catch(function (err) {
        console.error('Failed to update todo:', err);
      });
  }

  function updateItem(id, newText) {
    fetch(API + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText })
    })
      .then(function (res) { return res.json(); })
      .then(function (updated) {
        state.items = state.items.map(function (it) {
          if (it.id === id) {
            return { id: updated.id, text: updated.text, completed: !!updated.completed };
          }
          return it;
        });
        render();
      })
      .catch(function (err) {
        console.error('Failed to update todo:', err);
      });
  }

  function clearCompleted() {
    fetch(API + '/completed', { method: 'DELETE' })
      .then(function () {
        state.items = state.items.filter(function (item) {
          return !item.completed;
        });
        render();
      })
      .catch(function (err) {
        console.error('Failed to clear completed:', err);
      });
  }

  function setFilter(filter) {
    state.filter = filter;
    dom.filters.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    render();
  }

  function getFilteredItems() {
    if (state.filter === 'active') {
      return state.items.filter(function (item) { return !item.completed; });
    }
    if (state.filter === 'completed') {
      return state.items.filter(function (item) { return item.completed; });
    }
    return state.items;
  }

  function render() {
    var filtered = getFilteredItems();
    var activeCount = state.items.filter(function (item) { return !item.completed; }).length;

    dom.counter.textContent = activeCount + ' item' + (activeCount !== 1 ? 's' : '') + ' left';

    if (filtered.length === 0) {
      dom.list.innerHTML = renderEmptyState();
    } else {
      dom.list.innerHTML = filtered.map(function (item) {
        return renderItem(item);
      }).join('');
    }

    bindItemEvents();
  }

  function renderEmptyState() {
    var message = state.items.length === 0
      ? 'Your todo list is empty. Add something above!'
      : 'No items match this filter.';

    return (
      '<li class="empty-state">' +
        '<div class="icon">&#9744;</div>' +
        '<p>' + message + '</p>' +
      '</li>'
    );
  }

  function renderItem(item) {
    var completedClass = item.completed ? ' completed' : '';
    var checked = item.completed ? ' checked' : '';

    return (
      '<li class="todo-item' + completedClass + '" data-id="' + item.id + '">' +
        '<input type="checkbox" class="todo-checkbox"' + checked + '>' +
        '<span class="todo-text">' + escapeHtml(item.text) + '</span>' +
        '<button class="btn-edit">Edit</button>' +
        '<button class="btn-delete">Delete</button>' +
      '</li>'
    );
  }

  function bindItemEvents() {
    var items = dom.list.querySelectorAll('.todo-item');
    items.forEach(function (li) {
      var id = parseInt(li.dataset.id, 10);

      li.querySelector('.todo-checkbox').addEventListener('change', function () {
        toggleItem(id);
      });

      li.querySelector('.btn-delete').addEventListener('click', function () {
        removeItem(id);
      });

      var editBtn = li.querySelector('.btn-edit');
      var textEl = li.querySelector('.todo-text');

      editBtn.addEventListener('click', function () {
        enterEditMode(li, id, textEl);
      });

      li.addEventListener('dblclick', function (e) {
        if (e.target === textEl || e.target === li) {
          enterEditMode(li, id, textEl);
        }
      });
    });
  }

  function enterEditMode(li, id, textEl) {
    if (li.classList.contains('editing')) return;

    var item = state.items.find(function (it) { return it.id === id; });
    if (!item) return;

    li.classList.add('editing');

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = item.text;

    var saveBtn = document.createElement('button');
    saveBtn.className = 'btn-save';
    saveBtn.textContent = 'Save';

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.textContent = 'Cancel';

    textEl.replaceWith(input);

    var editBtn = li.querySelector('.btn-edit');
    var deleteBtn = li.querySelector('.btn-delete');
    editBtn.replaceWith(saveBtn);
    deleteBtn.replaceWith(cancelBtn);

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    function save() {
      var newText = input.value.trim();
      if (newText && newText !== item.text) {
        updateItem(id, newText);
      } else if (!newText) {
        return;
      } else {
        render();
      }
    }

    function cancel() {
      render();
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') cancel();
    });

    input.addEventListener('blur', function () {
      setTimeout(cancel, 150);
    });

    saveBtn.addEventListener('click', save);
    cancelBtn.addEventListener('click', cancel);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  init();
})();
