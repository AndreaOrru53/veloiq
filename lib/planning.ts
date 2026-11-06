export type RideInput = { km:number; elevation:number; type:'Strada'|'MTB'; level:'Base'|'Intermedio'|'Avanzato' };
export function estimateRide({km,elevation,type,level}:RideInput) {
  const speed = (type === 'MTB' ? 16 : 25) * ({Base:.82,Intermedio:1,Avanzato:1.13}[level]);
  const hours = km / speed + elevation / 1000 * (type === 'MTB' ? .42 : .30);
  const carbs = Math.round(hours * (level === 'Avanzato' ? 75 : level === 'Intermedio' ? 60 : 45));
  return { hours, carbs, water: Math.max(1, Math.round(hours * .55 * 10)/10), calories: Math.round(hours * (type === 'MTB' ? 650 : 550)) };
}
export function clothingAdvice(temp:number, wind:number, rain:number) {
  if (rain > 55) return 'Porta una giacca impermeabile e uno strato di ricambio.';
  if (temp < 8) return 'Intimo termico, giacca invernale, guanti e copriscarpe.';
  if (temp < 15 || wind > 25) return 'Gilet antivento, manicotti e guanti leggeri.';
  if (temp < 23) return 'Completo estivo con gilet leggero per le discese.';
  return 'Completo estivo traspirante e protezione solare.';
}
