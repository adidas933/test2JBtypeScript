// Classes:
class StateNames {
  official: string;
  constructor ( official: string ) { this.official = official };
}

class Currencies {
  name: string;
  symbol: string;
  constructor ( name: string, symbol: string ) { this.name = name, this.symbol = symbol } 
}

class States {
  name: StateNames;
  population: number;
  region: string;
  currencies: Currencies;
  numOfStates: number;
  constructor (
    name: string,
    population: number,
    region: string,
    currencies: Currencies,
    numOfStates: number
  ) {
      this.name = new StateNames(name);
      this.population = population;
      this.region = region;
      this.currencies = currencies;
      this.numOfStates = numOfStates;
  }
}

class Counter { [key: string]: number };

// Variables:
const statisticsContainer = $('.statisticsContainer');
const thead = $('thead');
const tbody = $('tbody');
const getStateBtn = $('.getStateBtn');
const allStatesBtn = $('.allStatesBtn');

// Functions:
async function tableCitizens(states: States[]): Promise<void> {
  thead.append(`<th>State Name</th><th>Citizens</th>`);
  const mainData = populationData(states);
  mainData.forEach((state) => createRow('name', 'population', state));
}

async function tableRegion(states: States[]): Promise<void> {
  tbody.append(`<th>Region</th><th>Number Of States</th>`);
  const getRegionData = await regionData(states);
  getRegionData.forEach((state) => createRow('region', 'numOfStates', state));
}

function populationData(states: States[]): States[] {
  return states.map((state) => ({
    name: new StateNames(state.name.official),
    population: state.population,
    region: '',
    currencies: new Currencies('', ''),
    numOfStates: 0
  }))}

async function regionData(states: States[]): Promise<States[]> {
  return await Promise.all(
    states.map(async (state) => ({
      name: new StateNames(''),
      population: 0,
      currencies:new Currencies('', ''),
      region: state.region,
      numOfStates: (await getRegionStates(state.region)).length,
    })))};

function sumOfStatesFound (states: States[]): void {
  statisticsContainer.append('<h4 class="moreDataHeader">More Data:</h4>');
  statisticsContainer.append(`<li><strong>Total states result:</strong> ${states.length}</li>`);
}

function sumOfCitizensFound (states: States[]): number {
  let sumOfCitizens = 0;
  states.forEach((state) => sumOfCitizens += state.population);
  statisticsContainer.append(`<li><strong>Sum of citizens count:</strong> ${sumOfCitizens}</li>`);
  return sumOfCitizens;
}

function averageOfCitizens (states: States[], sumOfCitizens: number): void {
  statisticsContainer.append(`<li><strong>Average of citizens count:</strong> ${Math.floor(sumOfCitizens / states.length)}</li>`);
}

function getCurrencies(states: States[]): void {
  statisticsContainer.append($('<h4 class="statesCurrenciesHeading">States Currencies</h4>'));
  const currencyTypeCounters: Counter = {};
  states.forEach((state: States) => {
    if (!state.currencies) 
      return currencyTypeCounters['No currency'] = (currencyTypeCounters['No currency'] || 0) + 1;
    Object.keys(state.currencies).forEach((key) => currencyTypeCounters[key] = (currencyTypeCounters[key] || 0) + 1)});
    Object.keys(currencyTypeCounters).forEach((key) => statisticsContainer.append(`<li><strong>${key}</strong> ${currencyTypeCounters[key]} state/s use this currency</li>`));
}

  async function getRegionStates(region: string): Promise<States[]> {
    const response = await fetch(
      `https://restcountries.com/v3.1/region/${region}`
    );
    return await response.json();
  }

  function createRow(
    nameOrRegion: string,
    populationOrStates: string,
    data: States
    ): void {
    const tr = $('<tr>');
    const nameValue = nameOrRegion === 'name' ? data.name.official : data.region;
    const populationOrStatesValue = populationOrStates === 'population' ? data.population : data.numOfStates;
    const tdName = $(`<td>${nameValue.toString()}</td>`);
    tr.append(tdName, $('<td>').text(populationOrStatesValue.toString()));
    tbody.append(tr);
  }

  async function getStates(input: string): Promise<void> {
    const response = await fetch(
      `https://restcountries.com/v3.1/${input}`
    );
    const states: States[] = await response.json();
    tableCitizens(states);
    tableRegion(states);
    getCurrencies(states);
    sumOfStatesFound(states);
    const sumOfCitizens = sumOfCitizensFound(states);
    averageOfCitizens(states, sumOfCitizens);
  }

// Event listeners:
  getStateBtn?.on('click', function () {
    getStates(`name/${$('.searchStateInput').val()}`);
  });

  allStatesBtn?.on('click', function () {
    getStates('all');
  })
