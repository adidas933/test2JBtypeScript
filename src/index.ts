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
// Functions:
async function tablesAndStatistics(states: States[]): Promise<void> {
  const mainData = populationData(states);
  const getRegionData = await regionData(states);
  $('thead').append(`<th>State Name</th><th>Citizens</th>`);
  mainData.forEach((state) => createRow('name', 'population', 'statesTable', state));
  $('tbody').append(`<th>Region</th><th>Number Of States</th>`);
  getRegionData.forEach((state) => createRow('region', 'numOfStates', 'statesTable', state));
  const currencyCounters = getCurrencies(states);
  Object.keys(currencyCounters).forEach((key) => statisticsContainer.append(`<li><strong>${key}</strong> ${currencyCounters[key]} state/s use this currency</li>`));
  getOtherData(states);
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

    function getOtherData(states: States[]): void {
      let sumOfCitizens = 0;
      states.forEach((state) => sumOfCitizens += state.population);
      statisticsContainer.append($('<h4 class="moreDataHeader">More Data:</h4>'));
      statisticsContainer.append(`<li>Total states result: ${states.length}</li>`);
      statisticsContainer.append(`<li>Sum of citizens count${sumOfCitizens}</li>`);
      statisticsContainer.append(`<li>Average of citizens count${Math.floor(sumOfCitizens / states.length)}</li>`);
    }

  function getCurrencies(states: States[]): Counter {
    const currencyTypeCounters: Counter = {};
    statisticsContainer.append($('<h4 class="statesCurrenciesHeading">States Currencies</h4>'));
    states.forEach((state: States) => {
      if (!state.currencies) 
        return currencyTypeCounters['No currency'] = (currencyTypeCounters['No currency'] || 0) + 1;
      let keys = Object.keys(state.currencies);
      keys.forEach((key) => currencyTypeCounters[key] = (currencyTypeCounters[key] || 0) + 1)});
      return currencyTypeCounters;
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
    tableClass: string,
    data: States
    ): void {
    const tr = $('<tr>');
    const nameValue = nameOrRegion === 'name' ? data.name.official : data.region;
    const populationOrStatesValue = populationOrStates === 'population' ? data.population : data.numOfStates;
    const tdName = $(`<td>${nameValue.toString()}</td>`);
    tr.append(tdName, $('<td>').text(populationOrStatesValue.toString()));
    $(`.${tableClass} tbody`).append(tr);
  }

  async function getStates(input: string): Promise<void> {
    const response = await fetch(
      `https://restcountries.com/v3.1/${input}`
    );
    const states: States[] = await response.json();
    tablesAndStatistics(states);
  }
// Event listeners:
  $('.getStateBtn')?.on('click', function () {
    getStates(`name/${$('.searchStateInput').val()}`);
  });

  $('.allStatesBtn')?.on('click', function () {
    getStates('all');
  })
