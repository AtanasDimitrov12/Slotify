export interface City {
  name: string;
  code: string;
}

export interface Country {
  name: string;
  code: string;
  cities: City[];
}

export const COUNTRIES: Country[] = [
  {
    name: 'United States',
    code: 'US',
    cities: [
      { name: 'New York', code: 'NYC' },
      { name: 'Los Angeles', code: 'LAX' },
      { name: 'Chicago', code: 'CHI' },
      { name: 'Houston', code: 'HOU' },
      { name: 'Phoenix', code: 'PHX' },
    ],
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    cities: [
      { name: 'London', code: 'LON' },
      { name: 'Birmingham', code: 'BHX' },
      { name: 'Manchester', code: 'MAN' },
      { name: 'Glasgow', code: 'GLA' },
      { name: 'Liverpool', code: 'LPL' },
    ],
  },
  {
    name: 'Germany',
    code: 'DE',
    cities: [
      { name: 'Berlin', code: 'BER' },
      { name: 'Hamburg', code: 'HAM' },
      { name: 'Munich', code: 'MUC' },
      { name: 'Cologne', code: 'CGN' },
      { name: 'Frankfurt', code: 'FRA' },
    ],
  },
  {
    name: 'France',
    code: 'FR',
    cities: [
      { name: 'Paris', code: 'PAR' },
      { name: 'Marseille', code: 'MRS' },
      { name: 'Lyon', code: 'LYN' },
      { name: 'Toulouse', code: 'TLS' },
      { name: 'Nice', code: 'NCE' },
    ],
  },
  {
    name: 'Bulgaria',
    code: 'BG',
    cities: [
      { name: 'Sofia', code: 'SOF' },
      { name: 'Plovdiv', code: 'PLV' },
      { name: 'Varna', code: 'VAR' },
      { name: 'Burgas', code: 'BUR' },
      { name: 'Ruse', code: 'RSE' },
    ],
  },
  {
    name: 'Netherlands',
    code: 'NL',
    cities: [
      { name: 'Amsterdam', code: 'AMS' },
      { name: 'Rotterdam', code: 'RTM' },
      { name: 'The Hague', code: 'THE' },
      { name: 'Eindhoven', code: 'EIN' },
      { name: 'Tilburg', code: 'TIL' },
    ],
  },
];
