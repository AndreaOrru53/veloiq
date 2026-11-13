'use client';
import { useEffect, useMemo, useState } from 'react';
import { Activity, Bike, CalendarDays, ChevronRight, CircleHelp, CloudSun, Compass, Gauge, Menu, Plus, Settings2, ShieldCheck, Sparkles, Timer, TrendingUp, Wrench, Droplets, Wind, CloudRain, Mountain, Route, Zap } from 'lucide-react';
import { estimateRide, clothingAdvice } from '@/lib/planning';

type Tab = 'Panoramica' | 'Percorsi' | 'Meteo' | 'Garage';

const tabs: {name:Tab;icon:any}[] = [
  {name:'Panoramica',icon:Activity},
  {name:'Percorsi',icon:Compass},
  {name:'Meteo',icon:CloudSun},
  {name:'Garage',icon:Wrench}
];
const initialBike = [{name:'Catena',km:1850,limit:2500},{name:'Pastiglie freno',km:900,limit:1800},{name:'Copertone posteriore',km:2800,limit:3500},{name:'Trasmissione',km:6200,limit:8000}];
function Card({children,className=''}:{children:React.ReactNode,className?:string}) { return <section className={'rounded-2xl border border-line bg-panel p-5 '+className}>{children}</section> }
function Stat({label,value,unit,icon:Icon}:{label:string,value:string,unit:string,icon:any}) { return <Card><div className="flex items-center justify-between"><span className="text-sm text-slate-400">{label}</span><Icon size={18} className="text-lime"/></div><div className="mt-3 text-3xl font-semibold">{value}<span className="ml-1 text-sm font-normal text-slate-400">{unit}</span></div></Card> }
export default function Home() {
 const [tab,setTab]=useState<Tab>('Panoramica');
 const [km,setKm]=useState(65),[elevation,setElevation]=useState(900),[type,setType]=useState<'Strada'|'MTB'>('Strada'),[level,setLevel]=useState<'Base'|'Intermedio'|'Avanzato'>('Intermedio');
 const [temp,setTemp]=useState(16),[wind,setWind]=useState(14),[rain,setRain]=useState(10);
const [bike, setBike] = useState(initialBike);
const [myBike, setMyBike] = useState({
  brand: '',
  model: '',
  type: 'Strada',
  totalKm: 0
});
type GarageBike = {
  id: string;
  brand: string;
  model: string;
  type: string;
  totalKm: number;
  components:
   {
    name: string;
    km: number;
    limit: number;
    lastResetAt?: string;
  }[];
  maintenanceHistory?: {
    id: string;
    date: string;
    component: string;
    totalKm: number;
    cost: number;
  }[];

  rideHistory?: {
    id: string;
    date: string;
    distance: number;
    source: 'manual' | 'strava';
    stravaActivityId?: string;
  }[];

};

const [bikes, setBikes] = useState<GarageBike[]>([]);
const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);

const [showAddBikeForm, setShowAddBikeForm] = useState(false);

const [newBikeForm, setNewBikeForm] = useState({
  brand: '',
  model: '',
  type: 'Strada',
  totalKm: '0'
});

const selectedBike =
  bikes.find(b => b.id === selectedBikeId) ?? bikes[0] ?? null;

const deleteSelectedBike = () => {
  if (!selectedBike) return;

  const confirmed = window.confirm(
    `Vuoi davvero eliminare ${selectedBike.brand || 'questa bicicletta'} ${selectedBike.model}?\n\nVerranno eliminati anche tutti i componenti e lo storico delle manutenzioni.`
  );

  if (!confirmed) return;

  const bikeIdToDelete = selectedBike.id;

  setBikes(previous =>
    previous.filter(b => b.id !== bikeIdToDelete)
  );

  setSelectedBikeId(null);
};


const updateSelectedBike = (
  field: 'brand' | 'model' | 'type' | 'totalKm',
  value: string | number
) => {
  if (!selectedBike) return;

  setBikes(previous =>
    previous.map(b =>
      b.id === selectedBike.id
        ? { ...b, [field]: value }
        : b
    )
  );
};
const [bikesLoaded, setBikesLoaded] = useState(false);

useEffect(() => {
  try {
    const saved = localStorage.getItem('veloiq-bikes');

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setBikes(parsed);
      }
    } else {
      // Recupera la bicicletta registrata nella versione precedente
      const oldBike = localStorage.getItem('veloiq-my-bike');
      const oldComponents = localStorage.getItem('veloiq-garage');

      if (oldBike) {
        const parsedBike = JSON.parse(oldBike);

        if (
          parsedBike &&
          typeof parsedBike.brand === 'string' &&
          typeof parsedBike.model === 'string' &&
          typeof parsedBike.totalKm === 'number'
        ) {
          const parsedComponents = oldComponents
            ? JSON.parse(oldComponents)
            : initialBike;

          const migratedBike: GarageBike = {
            id: crypto.randomUUID(),
            brand: parsedBike.brand,
            model: parsedBike.model,
            type: parsedBike.type || 'Strada',
            totalKm: parsedBike.totalKm,
            components: Array.isArray(parsedComponents)
              ? parsedComponents
              : initialBike
          };

          setBikes([migratedBike]);
        }
      }
    }
  } catch (error) {
    console.error('Errore caricamento biciclette:', error);
  } finally {
    setBikesLoaded(true);
  }
}, []);

useEffect(() => {
  if (!bikesLoaded) return;

  try {
    localStorage.setItem('veloiq-bikes', JSON.stringify(bikes));
  } catch (error) {
    console.error('Errore salvataggio biciclette:', error);
  }
}, [bikes, bikesLoaded]);
const [garageLoaded, setGarageLoaded] = useState(false);
const [bikeInfoLoaded, setBikeInfoLoaded] = useState(false);

useEffect(() => {
  try {
    const saved = localStorage.getItem('veloiq-my-bike');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        typeof parsed.brand === 'string' &&
        typeof parsed.model === 'string' &&
        typeof parsed.type === 'string' &&
        typeof parsed.totalKm === 'number' &&
        Number.isFinite(parsed.totalKm) &&
        parsed.totalKm >= 0
      ) {
        setMyBike(parsed);
      }
    }
  } catch (error) {
    console.error('Errore caricamento bici:', error);
  } finally {
    setBikeInfoLoaded(true);
  }
}, []);

useEffect(() => {
  if (!bikeInfoLoaded) return;
  localStorage.setItem('veloiq-my-bike', JSON.stringify(myBike));
}, [myBike, bikeInfoLoaded]);

useEffect(() => {
  try {
    const saved = localStorage.getItem('veloiq-garage');

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.every(
          x =>
            typeof x.name === 'string' &&
            typeof x.km === 'number' &&
            Number.isFinite(x.km) &&
            typeof x.limit === 'number' &&
            Number.isFinite(x.limit) &&
            x.limit > 0
        )
      ) {
        setBike(parsed);
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento del garage:', error);
  } finally {
    setGarageLoaded(true);
  }
}, []);

useEffect(() => {
  if (!garageLoaded) return;

  try {
    localStorage.setItem('veloiq-garage', JSON.stringify(bike));
  } catch (error) {
    console.error('Errore nel salvataggio del garage:', error);
  }
}, [bike, garageLoaded]);
 const [done,setDone]=useState(false);
 const plan=useMemo(()=>estimateRide({km,elevation,type,level}),[km,elevation,type,level]);
 const advice=clothingAdvice(temp,wind,rain);
 const progress=(v:number,l:number)=>Math.min(100,Math.round(v/l*100));
 const deleteMaintenance = (maintenanceId: string) => {
  if (!selectedBike) return;

  if (!window.confirm('Vuoi eliminare questa manutenzione dallo storico?')) {
    return;
  }

  setBikes(previous =>
    previous.map(b =>
      b.id === selectedBike.id
        ? {
            ...b,
            maintenanceHistory: (b.maintenanceHistory ?? []).filter(
              item => item.id !== maintenanceId
            )
          }
        : b
    )
  );
};
 const resetBikeComponent = (index: number) => {
  if (!selectedBike) return;

  const component = selectedBike.components[index];
  if (!component) return;

  if (!window.confirm(
    `Confermi la manutenzione di ${component.name}?`
  )) {
    return;
  }

  const costInput = window.prompt(
    'Quanto hai speso per questa manutenzione? (€)',
    '0'
  );

  if (costInput === null) return;

  const cost = Number(costInput.trim().replace(',', '.'));

  if (!Number.isFinite(cost) || cost < 0) {
    window.alert('Inserisci un costo valido.');
    return;
  }

  const intervention = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    component: component.name,
    totalKm: selectedBike.totalKm,
    cost
  };

  setBikes(previous =>
    previous.map(b =>
      b.id === selectedBike.id
        ? {
            ...b,
            components: b.components.map((item, i) =>
              i === index
  ? {
      ...item,
      km: 0,
      lastResetAt: intervention.date
    }
  : item
            ),
            maintenanceHistory: [
              ...(b.maintenanceHistory ?? []),
              intervention
            ]
          }
        : b
    )
  );
};
 const updateBikeComponent = (
  index: number,
  field: 'km' | 'limit',
  value: number
) => {
  if (!selectedBike) return;
  if (!Number.isFinite(value) || value < 0) return;
  if (field === 'limit' && value === 0) return;

  setBikes(previous =>
    previous.map(b =>
      b.id === selectedBike.id
        ? {
            ...b,
            components: b.components.map((component, i) =>
              i === index
                ? { ...component, [field]: value }
                : component
            )
          }
        : b
    )
  );
};

 const updateComponent = (
  index: number,
  field: 'km' | 'limit',
  value: number
) => {
  if (!Number.isFinite(value) || value < 0) return;
  if (field === 'limit' && value === 0) return;

  setBike(previous =>
    previous.map((component, i) =>
      i === index
        ? { ...component, [field]: value }
        : component
    )
  );
};

const resetComponent = (index: number) => {
  if (!window.confirm('Hai effettuato la manutenzione o sostituito il componente?')) {
    return;
  }

  setBike(previous =>
    previous.map((component, i) =>
      i === index ? { ...component, km: 0 } : component
    )
  );
};
 const title = tab === 'Panoramica' ? 'La tua prossima uscita, preparata meglio.' : tab;
 return <main className="min-h-screen">
  <div className="mx-auto flex max-w-[1440px]">
   <aside className="hidden min-h-screen w-64 shrink-0 border-r border-line bg-[#0C1218] p-6 lg:flex lg:flex-col">
    <div className="mb-12 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-ink"><Bike size={23}/></div><div><div className="text-xl font-black tracking-[.18em]">VELOIQ</div><div className="text-[10px] tracking-[.25em] text-slate-500">RIDE SMARTER</div></div></div>
    <div className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Workspace</div>
<nav className="space-y-1">
  {tabs.map(({ name, icon: Icon }) => (
    <button
      key={name}
      onClick={() => setTab(name)}
      className={
        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ' +
        (tab === name
          ? 'bg-lime text-ink font-semibold'
          : 'text-slate-400 hover:bg-white/5 hover:text-white')
      }
    >
      <Icon size={18} />
      {name}
    </button>
  ))}
</nav>

    <div className="mt-auto rounded-2xl border border-line bg-[#111A20] p-4"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Zap size={16} className="text-lime"/> VELOIQ Premium</div><p className="mb-4 text-xs leading-5 text-slate-400">Sblocca piani adattivi, analisi avanzate e storico completo.</p><button className="w-full rounded-lg bg-lime px-3 py-2 text-xs font-bold text-ink">Scopri Premium</button></div>
    <div className="mt-5 flex items-center gap-3 border-t border-line pt-5"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#26343B] text-sm font-bold">AC</div><div><div className="text-sm font-semibold">Ciclista</div><div className="text-xs text-slate-500">Profilo personale</div></div><Settings2 size={17} className="ml-auto text-slate-500"/></div>
   </aside>
   <div className="min-w-0 flex-1">
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-[#090D12]/90 px-5 py-4 backdrop-blur-xl md:px-8">
     <div className="flex items-center gap-3 lg:hidden"><div className="grid h-9 w-9 place-items-center rounded-lg bg-lime text-ink"><Bike size={20}/></div><b className="tracking-[.16em]">VELOIQ</b></div>
     <div className="hidden text-sm text-slate-400 lg:block">Giovedì, 5 novembre <span className="mx-2 text-slate-700">/</span> Buona serata, pronto a pedalare?</div>
     <div className="flex items-center gap-3"><span className="hidden rounded-full border border-line px-3 py-1.5 text-xs text-slate-400 sm:block">● Sistema operativo</span><button className="grid h-9 w-9 place-items-center rounded-full border border-line text-slate-400"><CircleHelp size={17}/></button><div className="grid h-9 w-9 place-items-center rounded-full bg-[#26343B] text-xs font-bold">AC</div></div>
    </header>
    <div className="border-b border-line px-4 py-2 lg:hidden"><div className="flex gap-2 overflow-x-auto">{tabs.map(({name,icon:Icon})=><button key={name} onClick={()=>setTab(name)} className={'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs '+(tab===name?'bg-lime text-ink':'bg-panel text-slate-400')}><Icon size={15}/>{name}</button>)}</div></div>
    <div className="mx-auto max-w-6xl p-5 md:p-8">
     <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-lime">IL TUO HUB CICLISTICO</div><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1><p className="mt-2 text-sm text-slate-400">{tab==='Panoramica'?'Pianifica, prepara e migliora ogni pedalata.':`Tutti gli strumenti VELOIQ per ${tab.toLowerCase()}.`}</p></div><button onClick={()=>setTab('Percorsi')} className="flex items-center gap-2 rounded-xl bg-lime px-4 py-3 text-sm font-bold text-ink"><Plus size={17}/> Pianifica uscita</button></div>
     {tab==='Panoramica'&&<div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Distanza questo mese" value="428" unit="km" icon={Route}/><Stat label="Dislivello positivo" value="6.240" unit="m" icon={Mountain}/><Stat label="Tempo in sella" value="18,5" unit="ore" icon={Timer}/><Stat label="Carico allenamento" value="In crescita" unit="" icon={TrendingUp}/></div>
      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">Visualizza percorsi <ChevronRight size={15}/>
       <Card><div className="mb-5 flex items-center justify-between"><div><div className="text-sm font-semibold">Prossima uscita</div><div className="mt-1 text-xs text-slate-500">Piano suggerito · da personalizzare</div></div><span className="rounded-full bg-lime/10 px-3 py-1 text-xs text-lime">Pronto</span></div><div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1b3035] via-[#17252d] to-[#111820] p-5"><div className="absolute -right-5 -top-8 h-44 w-44 rounded-full border-[24px] border-white/5"/><div className="relative"><div className="text-xs uppercase tracking-widest text-slate-400">Percorso consigliato</div><div className="mt-2 text-2xl font-semibold">Colline & panorami</div><div className="mt-1 text-sm text-slate-400">Strada · Intermedio</div><div className="mt-7 grid grid-cols-3 gap-3"><div><div className="text-2xl font-bold">65<span className="text-xs font-normal text-slate-400"> km</span></div><div className="text-xs text-slate-500">Distanza</div></div><div><div className="text-2xl font-bold">900<span className="text-xs font-normal text-slate-400"> m</span></div><div className="text-xs text-slate-500">Dislivello</div></div><div><div className="text-2xl font-bold">2h 55</div><div className="text-xs text-slate-500">Durata stimata</div></div></div></div></div><div className="mt-4 flex items-center justify-between"><div className="text-xs text-slate-400">Nutrizione consigliata: <b className="text-white">175 g carboidrati</b></div><button onClick={()=>setTab('Percorsi')} className="flex items-center gap-1 text-xs font-semibold text-lime"></button></div></Card>
       <Card><div className="mb-4 flex items-center justify-between"><div className="text-sm font-semibold">Meteo per pedalare</div><CloudSun className="text-lime" size={19}/></div><div className="flex items-center gap-4"><div className="text-5xl font-light">16°</div><div><div className="text-sm font-medium">Parzialmente nuvoloso</div><div className="mt-1 text-xs text-slate-500">Condizioni indicative</div></div></div><div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-4"><div><Wind size={16} className="mb-2 text-slate-400"/><div className="text-sm font-semibold">14 km/h</div><div className="text-xs text-slate-500">Vento</div></div><div><Droplets size={16} className="mb-2 text-slate-400"/><div className="text-sm font-semibold">65%</div><div className="text-xs text-slate-500">Umidità</div></div><div><CloudRain size={16} className="mb-2 text-slate-400"/><div className="text-sm font-semibold">10%</div><div className="text-xs text-slate-500">Pioggia</div></div></div><button onClick={()=>setTab('Meteo')} className="mt-5 text-xs font-semibold text-lime">Apri previsioni dettagliate →</button></Card>
      </div>
      <div className="grid gap-5 md:grid-cols-2"><Card><div className="mb-4 flex items-center justify-between"><div className="text-sm font-semibold">Garage · Manutenzione</div><button onClick={()=>setTab('Garage')} className="text-xs text-lime">Apri garage →</button></div>{(selectedBike?.components ?? []).slice(0,3).map(x=><div key={x.name} className="mb-4"><div className="mb-2 flex justify-between text-xs"><span>{x.name}</span><span className="text-slate-400">{x.km.toLocaleString('it-IT')} / {x.limit.toLocaleString('it-IT')} km<span
  className={
    'ml-2 font-semibold ' +
    (x.km >= x.limit
      ? 'text-red-500'
      : x.km >= x.limit * 0.8
      ? 'text-yellow-400'
      : 'text-lime')
  }
>
  {x.km >= x.limit
    ? 'Manutenzione necessaria'
    : x.km >= x.limit * 0.8
    ? 'In scadenza'
    : 'OK'}
</span></span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#26313A]"><div
  className={
    'h-full rounded-full ' +
    (x.km >= x.limit
      ? 'bg-red-500'
      : x.km >= x.limit * 0.8
      ? 'bg-yellow-400'
      : 'bg-lime')
  }
  style={{width:progress(x.km,x.limit)+'%'}}
/></div></div>)}</Card></div>
     </div>}
     {tab==='Percorsi'&&<div className="grid gap-5 lg:grid-cols-[1fr_1fr]"><Card><h2 className="text-lg font-semibold">Crea il tuo percorso</h2><p className="mt-1 text-sm text-slate-400">Definisci l'uscita ideale: VELOIQ calcola un profilo indicativo.</p><label className="mt-6 block text-xs text-slate-400">Distanza · {km} km</label><input type="range" min="10" max="180" step="5" value={km} onChange={e=>setKm(+e.target.value)} className="mt-3 w-full accent-[#C7F36B]"/><div className="mt-5 flex justify-between text-xs text-slate-400"><span>Dislivello</span><b className="text-white">{elevation} m</b></div><input type="range" min="0" max="3000" step="100" value={elevation} onChange={e=>setElevation(+e.target.value)} className="mt-3 w-full accent-[#C7F36B]"/><div className="mt-6 grid grid-cols-2 gap-3"><div><label className="mb-2 block text-xs text-slate-400">Disciplina</label><select value={type} onChange={e=>setType(e.target.value as any)} className="w-full rounded-lg border border-line bg-[#0B1117] p-3 text-sm"><option>Strada</option><option>MTB</option></select></div><div><label className="mb-2 block text-xs text-slate-400">Livello</label><select value={level} onChange={e=>setLevel(e.target.value as any)} className="w-full rounded-lg border border-line bg-[#0B1117] p-3 text-sm"><option>Base</option><option>Intermedio</option><option>Avanzato</option></select></div></div><button className="mt-6 w-full rounded-xl bg-lime p-3 text-sm font-bold text-ink" onClick={()=>setDone(true)}>Genera proposta</button>{done&&<p className="mt-3 text-xs text-lime">Proposta aggiornata. Collega un provider di routing per ottenere un itinerario cartografico reale.</p>}</Card><Card><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">La tua uscita stimata</h2><Route className="text-lime"/></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#0B1117] p-4"><div className="text-xs text-slate-500">Durata</div><div className="mt-1 text-2xl font-semibold">{Math.floor(plan.hours)}h {Math.round((plan.hours%1)*60)}m</div></div><div className="rounded-xl bg-[#0B1117] p-4"><div className="text-xs text-slate-500">Calorie stimate</div><div className="mt-1 text-2xl font-semibold">{plan.calories}</div></div><div className="rounded-xl bg-[#0B1117] p-4"><div className="text-xs text-slate-500">Acqua indicativa</div><div className="mt-1 text-2xl font-semibold">{plan.water} L</div></div><div className="rounded-xl bg-[#0B1117] p-4"><div className="text-xs text-slate-500">Carboidrati indicativi</div><div className="mt-1 text-2xl font-semibold">{plan.carbs} g</div></div></div><div className="mt-5 rounded-xl border border-dashed border-line p-5 text-center"><Mountain size={25} className="mx-auto text-lime"/><div className="mt-3 font-semibold">Mappa e altimetria</div><p className="mt-1 text-xs leading-5 text-slate-500">La generazione di tracce GPX e l'anteprima mappa verranno collegate al servizio di routing nella fase d'integrazione.</p></div></Card></div>}
     {tab==='Meteo'&&<Card><h2 className="text-lg font-semibold">Meteo per ciclisti</h2><p className="mt-1 text-sm text-slate-400">Simula le condizioni per visualizzare i consigli. Il collegamento meteo live richiede la posizione dell'uscita.</p><div className="mt-6 grid gap-5 sm:grid-cols-3"><label className="text-sm">Temperatura <b className="float-right">{temp}°C</b><input className="mt-3 w-full accent-[#C7F36B]" type="range" min="-5" max="38" value={temp} onChange={e=>setTemp(+e.target.value)}/></label><label className="text-sm">Vento <b className="float-right">{wind} km/h</b><input className="mt-3 w-full accent-[#C7F36B]" type="range" min="0" max="70" value={wind} onChange={e=>setWind(+e.target.value)}/></label><label className="text-sm">Probabilità pioggia <b className="float-right">{rain}%</b><input className="mt-3 w-full accent-[#C7F36B]" type="range" min="0" max="100" value={rain} onChange={e=>setRain(+e.target.value)}/></label></div><div className="mt-6 rounded-xl bg-[#0B1117] p-5"><div className="flex items-center gap-2 text-sm font-semibold"><CloudSun className="text-lime"/> Consiglio VELOIQ</div><p className="mt-2 text-sm leading-6 text-slate-300">{advice}</p><p className="mt-3 text-xs text-slate-500">Controlla sempre le condizioni aggiornate prima della partenza.</p></div></Card>}
     {tab==='Garage'&&<Card>
        <div className="mb-6">
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="text-lg font-semibold">Le mie biciclette</h2>
      <p className="mt-1 text-sm text-slate-400">
        Seleziona una bici oppure aggiungine una nuova.
      </p>
    </div>

    <button
      onClick={() => {
  setNewBikeForm({
    brand: '',
    model: '',
    type: 'Strada',
    totalKm: '0'
  });
  setShowAddBikeForm(true);
}}
      className="flex items-center gap-2 rounded-lg bg-lime px-4 py-3 text-sm font-bold text-ink"
    >
      <Plus size={17} />
      Aggiungi bicicletta
    </button>
    <button
  onClick={deleteSelectedBike}
  disabled={!selectedBike}
  className="rounded-lg border border-red-500/50 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-40"
>
  Elimina bicicletta
</button>
  </div>

  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {bikes.map(b => (
      <button
        key={b.id}
        onClick={() => setSelectedBikeId(b.id)}
        className={
          'rounded-xl border p-4 text-left transition ' +
          (selectedBike?.id === b.id
            ? 'border-lime bg-lime/10'
            : 'border-line bg-[#0B1117] hover:border-lime/50')
        }
      >
        <Bike size={24} className="mb-3 text-lime" />

        <div className="font-semibold">
          {b.brand || 'Nuova bici'} {b.model}
        </div>

        <div className="mt-2 text-xs text-slate-400">
          {b.type}
        </div>

        <div className="mt-3 text-sm text-lime">
          {b.totalKm.toLocaleString('it-IT')} km
        </div>
      </button>
    ))}
  </div>

{showAddBikeForm && (
  <div className="mb-6 rounded-2xl border border-lime/50 bg-[#111A20] p-5">
    <h3 className="mb-4 text-lg font-semibold">
      Registra una nuova bicicletta
    </h3>

    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm">
        Marca
        <input
          type="text"
          value={newBikeForm.brand}
          onChange={e =>
            setNewBikeForm(prev => ({
              ...prev,
              brand: e.target.value
            }))
          }
          placeholder="Es. Trek"
          className="mt-2 w-full rounded-lg border border-line bg-[#0B1117] p-3"
        />
      </label>

      <label className="text-sm">
        Modello
        <input
          type="text"
          value={newBikeForm.model}
          onChange={e =>
            setNewBikeForm(prev => ({
              ...prev,
              model: e.target.value
            }))
          }
          placeholder="Es. Procaliber"
          className="mt-2 w-full rounded-lg border border-line bg-[#0B1117] p-3"
        />
      </label>

      <label className="text-sm">
        Tipologia
        <select
          value={newBikeForm.type}
          onChange={e =>
            setNewBikeForm(prev => ({
              ...prev,
              type: e.target.value
            }))
          }
          className="mt-2 w-full rounded-lg border border-line bg-[#0B1117] p-3"
        >
          <option>Strada</option>
          <option>MTB</option>
          <option>Gravel</option>
          <option>E-bike</option>
        </select>
      </label>

      <label className="text-sm">
        Chilometri attuali
        <input
          type="number"
          min="0"
          value={newBikeForm.totalKm}
          onChange={e =>
            setNewBikeForm(prev => ({
              ...prev,
              totalKm: e.target.value
            }))
          }
          className="mt-2 w-full rounded-lg border border-line bg-[#0B1117] p-3"
        />
      </label>
    </div>

    <div className="mt-5 flex gap-3">
      <button
        type="button"
        onClick={() => {
          const totalKm = Number(newBikeForm.totalKm);

          if (
            !newBikeForm.brand.trim() ||
            !newBikeForm.model.trim() ||
            newBikeForm.totalKm.trim() === '' ||
            !Number.isFinite(totalKm) ||
            totalKm < 0
          ) {
            window.alert('Compila correttamente tutti i campi.');
            return;
          }

          const bike: GarageBike = {
            id: crypto.randomUUID(),
            brand: newBikeForm.brand.trim(),
            model: newBikeForm.model.trim(),
            type: newBikeForm.type,
            totalKm,
            components: []
          };

          setBikes(prev => [...prev, bike]);
          setSelectedBikeId(bike.id);
          setShowAddBikeForm(false);
        }}
        className="rounded-lg bg-lime px-4 py-3 text-sm font-bold text-ink"
      >
        Salva bicicletta
      </button>

      <button
        type="button"
        onClick={() => setShowAddBikeForm(false)}
        className="rounded-lg border border-line px-4 py-3 text-sm"
      >
        Annulla
      </button>
    </div>
  </div>
)}

  {bikes.length === 0 && (
    <p className="mt-4 text-sm text-slate-400">
      Nessuna bicicletta registrata. Premi Aggiungi bicicletta.
    </p>
  )}
</div>

{selectedBike && (
  <div className="mb-6 rounded-2xl border border-line bg-[#0B1117] p-5">
    <h2 className="text-lg font-semibold">Le mie uscite</h2>

    <p className="mt-1 text-sm text-slate-400">
      Storico delle uscite della bicicletta selezionata.
    </p>

    {(selectedBike.rideHistory ?? []).length === 0 ? (
      <p className="mt-4 text-sm text-slate-500">
        Nessuna uscita registrata.
      </p>
    ) : (
      <div className="mt-4 space-y-3">
        {[...(selectedBike.rideHistory ?? [])]
          .reverse()
          .map(ride => (
            <div
              key={ride.id}
              className="flex items-center justify-between rounded-xl border border-line p-3"
            >
              <div>
                <p className="text-sm font-semibold">
                  {new Date(ride.date).toLocaleDateString('it-IT')}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {ride.source === 'strava' ? 'Strava' : 'Manuale'}
                </p>
              </div>

              <span className="font-bold text-lime">
                {ride.distance.toLocaleString('it-IT')} km
              </span>


<button
  type="button"
  onClick={() => {
    if (!selectedBike) return;

    if (!window.confirm(
      `Vuoi eliminare l'uscita di ${ride.distance} km? Verranno corretti anche i chilometri della bicicletta e, quando possibile, dei componenti.`
    )) return;

    setBikes(previous =>
      previous.map(b => {
        if (b.id !== selectedBike.id) return b;

        const history = b.rideHistory ?? [];

        if (!history.some(item => item.id === ride.id)) {
          return b;
        }

        return {
          ...b,
          totalKm: Math.max(0, b.totalKm - ride.distance),

          components: b.components.map(component => {
            const resetDate = component.lastResetAt;

            if (!resetDate) {
              return component;
            }

            const rideAfterReset =
              new Date(ride.date).getTime() >
              new Date(resetDate).getTime();

            return {
              ...component,
              km: rideAfterReset
                ? Math.max(0, component.km - ride.distance)
                : component.km
            };
          }),

          rideHistory: history.filter(
            item => item.id !== ride.id
          )
        };
      })
    );
  }}
  className="ml-3 text-xs font-semibold text-red-400 hover:text-red-300"
>
  Elimina
</button>


            </div>
          ))}
      </div>
    )}
  </div>
)}

{bikes.length > 1 && (
  <div className="mb-6 rounded-2xl border border-line bg-[#0B1117] p-5">
    <h2 className="mb-4 text-lg font-semibold">
      Confronto costi biciclette
    </h2>

    <div className="grid gap-3 sm:grid-cols-2">
      {bikes.map(b => {
        const totalCost = (b.maintenanceHistory ?? []).reduce(
          (total, item) => total + item.cost,
          0
        );

        const costPer100Km =
          b.totalKm > 0 ? (totalCost / b.totalKm) * 100 : null;

        return (
          <div
            key={b.id}
            className="rounded-xl border border-line bg-[#111A20] p-4"
          >
            <p className="font-semibold">
              {b.brand || 'Marca'} {b.model || 'Modello'}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {b.totalKm.toLocaleString('it-IT')} km percorsi
            </p>

            <div className="mt-4 flex justify-between gap-3 text-sm">
              <span className="text-slate-400">Totale speso</span>
              <span className="font-semibold">
                {totalCost.toLocaleString('it-IT', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-3 text-sm">
              <span className="text-slate-400">Costo / 100 km</span>
              <span className="font-bold text-lime">
                {costPer100Km === null
                  ? '—'
                  : costPer100Km.toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
              </span>
            </div>
          </div>
        );
      })}
    </div>

    <p className="mt-4 text-xs text-slate-400">
      Il confronto considera soltanto le manutenzioni registrate
      in VELOIQ.
    </p>
  </div>
)}
        <div className="mb-6 rounded-2xl border border-line bg-[#0B1117] p-5">
  <div className="mb-5 flex items-center gap-3">
    <Bike size={24} className="text-lime" />
    <div>
      <h2 className="text-lg font-semibold">La mia bicicletta</h2>
      <p className="text-xs text-slate-400">
        Registra e gestisci la tua bici
      </p>
    </div>
  </div>

  <div className="grid gap-4 sm:grid-cols-2">
    <label className="text-sm text-slate-400">
      Marca
      <input
        type="text"
        placeholder="Es. Specialized"
        value={selectedBike?.brand ?? ''}
        onChange={e => updateSelectedBike('brand', e.target.value)}
        disabled={!selectedBike}
        className="mt-2 w-full rounded-lg border border-line bg-[#111A20] p-3 text-white"
      />
    </label>

    <label className="text-sm text-slate-400">
      Modello
      <input
        type="text"
        placeholder="Es. Tarmac SL8"
        value={selectedBike?.model ?? ''}
        onChange={e => updateSelectedBike('model', e.target.value)}
        disabled={!selectedBike}
        className="mt-2 w-full rounded-lg border border-line bg-[#111A20] p-3 text-white"
      />
    </label>

    <label className="text-sm text-slate-400">
      Tipologia
      <select
        value={selectedBike?.type ?? 'Strada'}
        onChange={e => updateSelectedBike('type', e.target.value)}
        disabled={!selectedBike}
        className="mt-2 w-full rounded-lg border border-line bg-[#111A20] p-3 text-white"
      >
        <option>Strada</option>
        <option>MTB</option>
        <option>Gravel</option>
        <option>E-bike</option>
      </select>
    </label>

    <label className="text-sm text-slate-400">
      Chilometri totali
      <input
        type="number"
        min="0"
        value={selectedBike?.totalKm ?? 0}
        onChange={e => {
          const value = Number(e.target.value);

          if (Number.isFinite(value) && value >= 0) {
            updateSelectedBike('totalKm', value);
          }
        }}
        disabled={!selectedBike}
        className="mt-2 w-full rounded-lg border border-line bg-[#111A20] p-3 text-white"
      />
    </label>

<button
  type="button"
  disabled={!selectedBike}
  onClick={() => {
    if (!selectedBike) return;

    const input = window.prompt(
      'Quanti chilometri hai percorso?'
    );

    if (input === null) return;

    const distance = Number(input.trim().replace(',', '.'));

    if (!Number.isFinite(distance) || distance <= 0) {
      window.alert('Inserisci un numero di chilometri valido.');
      return;
    }

    setBikes(previous =>
      previous.map(b =>
        b.id === selectedBike.id
          ? {
              ...b,
              totalKm: b.totalKm + distance,
              components: b.components.map(c => ({
                ...c,
                km: c.km + distance
              })),

rideHistory: [
  ...(b.rideHistory ?? []),
  {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    distance: distance,
    source: 'manual' as const
  }
]

            }
          : b
      )
    );
  }}
  className="rounded-lg bg-lime px-4 py-3 text-sm font-bold text-ink disabled:opacity-40"
>
  + Registra uscita
</button>

  </div>

  <div className="mt-5 rounded-xl bg-lime/10 p-4">
    <p className="text-xs text-slate-400">Bicicletta registrata</p>
    <h3 className="mt-1 text-xl font-semibold">
      {selectedBike?.brand || 'Marca'} {selectedBike?.model || 'Modello'}
    </h3>
    <p className="mt-2 text-sm text-lime">
      {selectedBike?.type ?? 'Strada'} · {(selectedBike?.totalKm ?? 0).toLocaleString('it-IT')} km
    </p>
  </div>

  <p className="mt-3 text-xs text-slate-500">
    Le modifiche vengono salvate automaticamente su questo browser.
  </p>
</div><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Il tuo garage</h2><p className="mt-1 text-sm text-slate-400">Chilometraggio componenti e manutenzione preventiva.</p></div>
<button onClick={() => {
  if (!selectedBike) return;

  const name = window.prompt('Inserisci il nome del componente:');

  if (!name || !name.trim()) return;

  setBikes(previous =>

    previous.map(b =>
      b.id === selectedBike.id
        ? {
            ...b,
            components: [
              ...b.components,
              {
              name: name.trim(),
              km: 0,
              limit: 1000,
              lastResetAt:  new Date().toISOString()
              }
            ]
          }
        : b
    )
  );
}}
disabled={!selectedBike} className="flex items-center gap-2 rounded-lg bg-lime px-3 py-2 text-xs font-bold text-ink"><Plus size={15}/> Aggiungi componente</button>{selectedBike && (
  <div className="mt-8 rounded-2xl border border-line bg-[#0B1117] p-5">
    <h2 className="mb-4 text-lg font-semibold">
      Storico manutenzioni
    </h2>

    <div className="mb-5 rounded-xl bg-lime/10 p-4">
      <p className="text-sm text-slate-400">
        Totale speso per questa bicicletta
      </p>

      <p className="mt-2 text-2xl font-bold text-lime">
        {new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: 'EUR'
        }).format(
          (selectedBike.maintenanceHistory ?? []).reduce(
            (total, item) => total + item.cost,
            0
          )
        )}
      </p>
    </div>
    <div className="mb-5 rounded-xl border border-line bg-[#111A20] p-4">
  <p className="text-sm text-slate-400">
    Costo manutenzione ogni 100 km
  </p>

  <p className="mt-2 text-2xl font-bold text-lime">
    {selectedBike.totalKm > 0
      ? (
          (selectedBike.maintenanceHistory ?? []).reduce(
            (total, item) => total + item.cost,
            0
          ) / selectedBike.totalKm * 100
        ).toLocaleString('it-IT', {
          style: 'currency',
          currency: 'EUR'
        })
      : '—'}
  </p>

  <p className="mt-2 text-xs text-slate-400">
    Calcolato sulle manutenzioni registrate e sui km totali della bici.
  </p>
</div>

    {(selectedBike.maintenanceHistory ?? []).length === 0 ? (
      <p className="text-sm text-slate-400">
        Nessuna manutenzione registrata.
      </p>
    ) : (
      <div className="space-y-3">
        {[...(selectedBike.maintenanceHistory ?? [])]
          .reverse()
          .map(item => (
            <div
              key={item.id}
              className="rounded-xl border border-line p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {item.component}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(item.date).toLocaleDateString('it-IT')}
                    {' · '}
                    {item.totalKm.toLocaleString('it-IT')} km
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
  <p className="font-bold text-lime">
    {item.cost.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'EUR'
    })}
  </p>

  <button
    onClick={() => deleteMaintenance(item.id)}
    className="text-xs text-red-400 hover:text-red-300"
  >
    Elimina
  </button>
</div>
              </div>
            </div>
          ))}
      </div>
    )}
  </div>
)}
</div>

{selectedBike && (
  <div className="mt-6 grid grid-cols-3 gap-3">
    {[
      {
        label: 'OK',
        count: selectedBike.components.filter(x => x.km < x.limit * 0.8).length,
        color: 'text-lime'
      },
      {
        label: 'In scadenza',
        count: selectedBike.components.filter(x => x.km >= x.limit * 0.8 && x.km < x.limit).length,
        color: 'text-yellow-400'
      },
      {
        label: 'Da controllare',
        count: selectedBike.components.filter(x => x.km >= x.limit).length,
        color: 'text-red-500'
      }
    ].map(item => (
      <div key={item.label} className="rounded-xl border border-line bg-[#0B1117] p-3 text-center">
        <div className={`text-2xl font-bold ${item.color}`}>
          {item.count}
        </div>
        <div className="mt-1 text-xs text-slate-400">
          {item.label}
        </div>
      </div>
    ))}
  </div>
)}

<div className="mt-6 space-y-5">
{selectedBike?.components.map((x,i)=><div key={i}><div className="flex justify-between gap-3"><div className="font-medium">{x.name}</div><div className="text-xs text-slate-400">{x.km} / {x.limit} km</div></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#26313A]"><div
  className={
    'h-full rounded-full ' +
    (x.km >= x.limit
      ? 'bg-red-500'
      : x.km >= x.limit * 0.8
      ? 'bg-yellow-400'
      : 'bg-lime')
  }
  style={{width:progress(x.km,x.limit)+'%'}}
/></div><div className="mt-1 text-xs text-slate-500">{progress(x.km,x.limit)}% del ciclo di manutenzione</div>

<div
  className={
    'mt-1 text-xs font-semibold ' +
    (x.km >= x.limit
      ? 'text-red-500'
      : x.km >= x.limit * 0.8
      ? 'text-yellow-400'
      : 'text-lime')
  }
>
  {x.km >= x.limit
    ? '🔴 Manutenzione necessaria'
    : x.km >= x.limit * 0.8
    ? '🟡 In scadenza'
    : '🟢 OK'}
</div>

     <div className="mt-3 flex flex-wrap items-end gap-3">
  <label className="text-xs text-slate-400">
    Km percorsi
    <input
      type="number"
      min="0"
      value={x.km}
      onChange={e => updateBikeComponent(i, 'km', Number(e.target.value))}
      className="mt-1 block w-28 rounded-lg border border-line bg-[#0B1117] p-2 text-white"
    />
  </label>

  <label className="text-xs text-slate-400">
    Soglia manutenzione (km)
    <input
      type="number"
      min="1"
      value={x.limit}
      onChange={e => updateBikeComponent(i, 'limit', Number(e.target.value))}
      className="mt-1 block w-28 rounded-lg border border-line bg-[#0B1117] p-2 text-white"
    />
  </label>

  <button
    onClick={() => resetBikeComponent(i)}
    className="rounded-lg border border-lime px-3 py-2 text-xs font-semibold text-lime"
  >
    Manutenzione eseguita
  </button>

<button
  onClick={() => {
    if (!selectedBike) return;

    const confirmed = window.confirm(
      `Vuoi eliminare il componente "${x.name}"?`
    );

    if (!confirmed) return;

    setBikes(previous =>
      previous.map(b =>
        b.id === selectedBike.id
          ? {
              ...b,
              components: b.components.filter((_, index) => index !== i)
            }
          : b
      )
    );
  }}
  className="rounded-lg border border-red-500/50 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10"
>
  Elimina componente
</button>

</div></div>)}</div><p className="mt-6 text-xs text-slate-500">Intervalli dimostrativi: impostare i valori secondo componenti, condizioni d'uso e indicazioni del produttore.</p></Card>}
     <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5 text-[11px] text-slate-600"><span>VELOIQ © 2026 · Ride smarter. Train better.</span><span>Versione MVP · Dati dimostrativi dove indicato</span></footer>
    </div>
   </div>
  </div>
 </main>;
}
