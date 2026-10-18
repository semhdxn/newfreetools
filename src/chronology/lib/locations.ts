/** Approximate centre coordinates [lat, lon] for common UK towns and cities. Bundled — no lookups leave the device. */
export const UK_COORDS: Record<string, [number, number]> = {
  Aberdeen: [57.15, -2.09], Barnsley: [53.55, -1.48], Basildon: [51.57, 0.46], Bath: [51.38, -2.36], Bedford: [52.14, -0.47],
  Belfast: [54.6, -5.93], Birmingham: [52.49, -1.89], Blackburn: [53.75, -2.48], Blackpool: [53.82, -3.05], Bolton: [53.58, -2.43],
  Bournemouth: [50.72, -1.88], Bradford: [53.79, -1.75], Brighton: [50.82, -0.14], Bristol: [51.45, -2.59], Burnley: [53.79, -2.24],
  "Burton upon Trent": [52.8, -1.64], Bury: [53.59, -2.3], Cambridge: [52.2, 0.12], Cardiff: [51.48, -3.18], Carlisle: [54.89, -2.93],
  Chelmsford: [51.74, 0.47], Cheltenham: [51.9, -2.08], Chester: [53.19, -2.89], Colchester: [51.89, 0.9], Coventry: [52.41, -1.51],
  Crawley: [51.11, -0.19], Croydon: [51.37, -0.1], Derby: [52.92, -1.48], Doncaster: [53.52, -1.13], Dudley: [52.51, -2.08],
  Dundee: [56.46, -2.97], Dunfermline: [56.07, -3.46], Eastbourne: [50.77, 0.28], Edinburgh: [55.95, -3.19], Exeter: [50.72, -3.53],
  Gateshead: [54.96, -1.6], Glasgow: [55.86, -4.25], Gloucester: [51.86, -2.24], Grimsby: [53.57, -0.08], Guildford: [51.24, -0.57],
  Halifax: [53.72, -1.86], Harlow: [51.77, 0.1], Harrogate: [53.99, -1.54], Hastings: [50.86, 0.57], "Hemel Hempstead": [51.75, -0.47],
  Hereford: [52.06, -2.72], Huddersfield: [53.65, -1.78], Hull: [53.74, -0.33], Inverness: [57.48, -4.22], Ipswich: [52.06, 1.16],
  Kettering: [52.4, -0.73], Leeds: [53.8, -1.55], Leicester: [52.64, -1.13], Lincoln: [53.23, -0.54], Liverpool: [53.41, -2.98],
  London: [51.51, -0.13], Luton: [51.88, -0.42], Maidstone: [51.27, 0.52], Manchester: [53.48, -2.24], Mansfield: [53.14, -1.2],
  Middlesbrough: [54.57, -1.23], "Milton Keynes": [52.04, -0.76], "Newcastle upon Tyne": [54.98, -1.61], Newport: [51.58, -3.0],
  Newry: [54.18, -6.34], Northampton: [52.24, -0.9], Norwich: [52.63, 1.3], Nottingham: [52.95, -1.15], Nuneaton: [52.52, -1.47],
  Oldham: [53.54, -2.12], Oxford: [51.75, -1.26], Paisley: [55.85, -4.42], Peterborough: [52.57, -0.24], Plymouth: [50.38, -4.14],
  Poole: [50.72, -1.98], Portsmouth: [50.8, -1.09], Preston: [53.76, -2.7], Reading: [51.45, -0.97], Rotherham: [53.43, -1.36],
  Salford: [53.49, -2.29], Sheffield: [53.38, -1.47], Slough: [51.51, -0.59], Southampton: [50.9, -1.4], "Southend-on-Sea": [51.54, 0.71],
  "St Albans": [51.75, -0.34], Stevenage: [51.9, -0.2], Stockport: [53.41, -2.16], "Stoke-on-Trent": [53.0, -2.18], Sunderland: [54.91, -1.38],
  Swansea: [51.62, -3.94], Swindon: [51.56, -1.78], Telford: [52.68, -2.45], Wakefield: [53.68, -1.5], Walsall: [52.59, -1.98],
  Warrington: [53.39, -2.6], Watford: [51.66, -0.4], Wigan: [53.55, -2.63], Woking: [51.32, -0.56], Wolverhampton: [52.59, -2.13], York: [53.96, -1.08],
};

/** Common UK towns and cities offered as suggestions for the location field (still free text). */
export const UK_LOCATIONS = Object.keys(UK_COORDS).sort();

const LOWER = new Map(Object.entries(UK_COORDS).map(([k, v]) => [k.toLowerCase(), v]));
export const coordsFor = (name: string) => LOWER.get(name.trim().toLowerCase()) ?? null;

/** Straight-line distance in miles between two known towns, or null if either is unknown. */
export function milesBetween(a: string, b: string): number | null {
  const p = coordsFor(a), q = coordsFor(b);
  if (!p || !q) return null;
  const r = Math.PI / 180, R = 3958.8;
  const dLat = (q[0] - p[0]) * r, dLon = (q[1] - p[1]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(p[0] * r) * Math.cos(q[0] * r) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
