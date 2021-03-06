'use strict';
const debounce = require('p-debounce');
const {memoize} = require('cerebro-tools');
const icon = require('./assets/npm-logo.png');
const id = 'npm';
const memoizationSettings = {
  maxAge: 60 * 1000 // 1 minute
};

const fetchPackages = debounce(memoize((query) => {
  console.log('query passed:', query)
  return fetch(`https://api.npms.io/v2/search?q=${query}`)
    .then(response => response.json())
    .then(data => data.results);
}, memoizationSettings), 300);

const extractQueryFromTerm = (term) => {
  const match = term.match(/^npm\s(.+)$/);

  if (!match) {
    return false;
  }

  const [_, query] = match;
  return query.trim();
}

const displayResult = ({ display, actions }, result) => {
  display({
    icon,
    id: `npm-${result.package.name}`,
    term: result.package.name,
    title: result.package.name,
    subtitle: result.package.description,
    clipboard: `npm i -S ${result.package.name}`,
    onSelect: (event) => {
      const { npm, repository } = result.package.links;
      const url = event.altKey && repository ? repository : npm;
      actions.open(url);
    }
  });
};

const fn = (scope) => {
  const { term, display, hide, actions } = scope;

  const query = extractQueryFromTerm(term);

  if (query) {
    display({ icon, id: 'npm-loading', title: 'Searching NPM packages ...' });

    fetchPackages(query).then(results => {
      hide('npm-loading');
      results
        .slice(0, 10)
        .map((result) => displayResult(scope, result));
    });
  }
};

module.exports = {
  icon,
  fn,
  keyword: 'npm',
  name: 'Search NPM packages'
}
