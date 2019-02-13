'use strict';

// Create element method
const e = (tag, attrs = {}, ...children) => {
  const elem = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    elem.setAttribute(key, value);
  }
  elem.append(...children);
  return elem;
};

// Append UI
document.getElementById('app').append(
  e('div', { id: 'header' },
    e('h1', {}, 'Math Perf')));
