// Real Players Database - Top 5 European Leagues
export const PLAYERS_DATABASE = {
  // Premier League - England
  premierLeague: [
    // Manchester City
    { id: 'haaland', name: 'Erling Haaland', position: 'ST', club: 'Manchester City', rating: 91, pace: 89, shooting: 94, passing: 65, value: 180000, nationality: 'Norway', age: 23 },
    { id: 'debruyne', name: 'Kevin De Bruyne', position: 'CAM', club: 'Manchester City', rating: 91, pace: 76, shooting: 88, passing: 93, value: 90000, nationality: 'Belgium', age: 32 },
    { id: 'rodri', name: 'Rodri', position: 'CDM', club: 'Manchester City', rating: 87, pace: 60, shooting: 75, passing: 89, value: 70000, nationality: 'Spain', age: 27 },

    // Arsenal
    { id: 'saka', name: 'Bukayo Saka', position: 'RW', club: 'Arsenal', rating: 87, pace: 85, shooting: 80, passing: 81, value: 90000, nationality: 'England', age: 22 },
    { id: 'odegaard', name: 'Martin Ødegaard', position: 'CAM', club: 'Arsenal', rating: 86, pace: 75, shooting: 82, passing: 89, value: 85000, nationality: 'Norway', age: 25 },
    { id: 'saliba', name: 'William Saliba', position: 'CB', club: 'Arsenal', rating: 84, pace: 77, shooting: 38, passing: 83, value: 65000, nationality: 'France', age: 23 },

    // Manchester United
    { id: 'rashford', name: 'Marcus Rashford', position: 'LW', club: 'Manchester United', rating: 85, pace: 90, shooting: 84, passing: 78, value: 75000, nationality: 'England', age: 26 },
    { id: 'bruno', name: 'Bruno Fernandes', position: 'CAM', club: 'Manchester United', rating: 86, pace: 68, shooting: 85, passing: 91, value: 70000, nationality: 'Portugal', age: 29 },
    { id: 'casemiro', name: 'Casemiro', position: 'CDM', club: 'Manchester United', rating: 85, pace: 55, shooting: 72, passing: 75, value: 40000, nationality: 'Brazil', age: 31 },

    // Liverpool
    { id: 'salah', name: 'Mohamed Salah', position: 'RW', club: 'Liverpool', rating: 89, pace: 90, shooting: 87, passing: 81, value: 65000, nationality: 'Egypt', age: 31 },
    { id: 'vandijk', name: 'Virgil van Dijk', position: 'CB', club: 'Liverpool', rating: 90, pace: 77, shooting: 60, passing: 91, value: 50000, nationality: 'Netherlands', age: 32 },
    { id: 'alexander', name: 'Trent Alexander-Arnold', position: 'RB', club: 'Liverpool', rating: 84, pace: 76, shooting: 66, passing: 89, value: 70000, nationality: 'England', age: 25 },

    // Chelsea
    { id: 'palmer', name: 'Cole Palmer', position: 'CAM', club: 'Chelsea', rating: 82, pace: 75, shooting: 82, passing: 85, value: 75000, nationality: 'England', age: 22 },
    { id: 'jackson', name: 'Nicolas Jackson', position: 'ST', club: 'Chelsea', rating: 77, pace: 88, shooting: 78, passing: 70, value: 45000, nationality: 'Senegal', age: 22 },
  ],

  // La Liga - Spain
  laLiga: [
    // Real Madrid
    { id: 'mbappe', name: 'Kylian Mbappé', position: 'LW', club: 'Real Madrid', rating: 91, pace: 97, shooting: 89, passing: 80, value: 180000, nationality: 'France', age: 25 },
    { id: 'vinicius', name: 'Vinícius Jr.', position: 'LW', club: 'Real Madrid', rating: 89, pace: 95, shooting: 83, passing: 78, value: 150000, nationality: 'Brazil', age: 24 },
    { id: 'bellingham', name: 'Jude Bellingham', position: 'CM', club: 'Real Madrid', rating: 87, pace: 75, shooting: 83, passing: 86, value: 150000, nationality: 'England', age: 21 },
    { id: 'modric', name: 'Luka Modrić', position: 'CM', club: 'Real Madrid', rating: 85, pace: 74, shooting: 76, passing: 90, value: 15000, nationality: 'Croatia', age: 38 },

    // Barcelona
    { id: 'yamal', name: 'Lamine Yamal', position: 'RW', club: 'Barcelona', rating: 81, pace: 85, shooting: 74, passing: 80, value: 90000, nationality: 'Spain', age: 17 },
    { id: 'pedri', name: 'Pedri', position: 'CM', club: 'Barcelona', rating: 85, pace: 68, shooting: 70, passing: 88, value: 100000, nationality: 'Spain', age: 21 },
    { id: 'gavi', name: 'Gavi', position: 'CM', club: 'Barcelona', rating: 82, pace: 76, shooting: 66, passing: 83, value: 90000, nationality: 'Spain', age: 20 },

    // Atletico Madrid
    { id: 'griezmann', name: 'Antoine Griezmann', position: 'CAM', club: 'Atletico Madrid', rating: 85, pace: 77, shooting: 84, passing: 82, value: 35000, nationality: 'France', age: 33 },
    { id: 'alvarez', name: 'Julián Álvarez', position: 'ST', club: 'Atletico Madrid', rating: 82, pace: 88, shooting: 82, passing: 75, value: 90000, nationality: 'Argentina', age: 24 },
  ],

  // Serie A - Italy
  serieA: [
    // Inter Milan
    { id: 'lautaro', name: 'Lautaro Martínez', position: 'ST', club: 'Inter Milan', rating: 87, pace: 86, shooting: 88, passing: 75, value: 110000, nationality: 'Argentina', age: 27 },
    { id: 'barella', name: 'Nicolò Barella', position: 'CM', club: 'Inter Milan', rating: 85, pace: 78, shooting: 77, passing: 84, value: 80000, nationality: 'Italy', age: 27 },

    // AC Milan
    { id: 'leao', name: 'Rafael Leão', position: 'LW', club: 'AC Milan', rating: 86, pace: 94, shooting: 81, passing: 75, value: 90000, nationality: 'Portugal', age: 25 },
    { id: 'pulisic', name: 'Christian Pulisic', position: 'RW', club: 'AC Milan', rating: 82, pace: 88, shooting: 76, passing: 73, value: 55000, nationality: 'USA', age: 26 },

    // Juventus
    { id: 'vlahovic', name: 'Dušan Vlahović', position: 'ST', club: 'Juventus', rating: 83, pace: 75, shooting: 87, passing: 64, value: 70000, nationality: 'Serbia', age: 24 },
    { id: 'chiesa', name: 'Federico Chiesa', position: 'RW', club: 'Juventus', rating: 83, pace: 90, shooting: 79, passing: 74, value: 65000, nationality: 'Italy', age: 27 },

    // Napoli
    { id: 'osimhen', name: 'Victor Osimhen', position: 'ST', club: 'Napoli', rating: 86, pace: 90, shooting: 87, passing: 68, value: 120000, nationality: 'Nigeria', age: 25 },
    { id: 'kvaratskhelia', name: 'Khvicha Kvaratskhelia', position: 'LW', club: 'Napoli', rating: 85, pace: 91, shooting: 78, passing: 81, value: 85000, nationality: 'Georgia', age: 23 },
  ],

  // Bundesliga - Germany
  bundesliga: [
    // Bayern Munich
    { id: 'kane', name: 'Harry Kane', position: 'ST', club: 'Bayern Munich', rating: 90, pace: 68, shooting: 93, passing: 83, value: 90000, nationality: 'England', age: 31 },
    { id: 'musiala', name: 'Jamal Musiala', position: 'CAM', club: 'Bayern Munich', rating: 86, pace: 85, shooting: 78, passing: 87, value: 130000, nationality: 'Germany', age: 21 },
    { id: 'davies', name: 'Alphonso Davies', position: 'LB', club: 'Bayern Munich', rating: 84, pace: 96, shooting: 62, passing: 77, value: 70000, nationality: 'Canada', age: 24 },

    // Borussia Dortmund
    { id: 'bellingham_old', name: 'Jude Bellingham', position: 'CM', club: 'Borussia Dortmund', rating: 84, pace: 75, shooting: 77, passing: 83, value: 100000, nationality: 'England', age: 21 },
    { id: 'haaland_old', name: 'Erling Haaland', position: 'ST', club: 'Borussia Dortmund', rating: 88, pace: 89, shooting: 91, passing: 65, value: 150000, nationality: 'Norway', age: 23 },

    // RB Leipzig
    { id: 'openda', name: 'Loïs Openda', position: 'ST', club: 'RB Leipzig', rating: 81, pace: 92, shooting: 80, passing: 72, value: 60000, nationality: 'Belgium', age: 24 },
    { id: 'sesko', name: 'Benjamin Šeško', position: 'ST', club: 'RB Leipzig', rating: 79, pace: 85, shooting: 83, passing: 70, value: 50000, nationality: 'Slovenia', age: 21 },
  ],

  // Ligue 1 - France
  ligue1: [
    // Paris Saint-Germain
    { id: 'mbappe_psg', name: 'Kylian Mbappé', position: 'ST', club: 'Paris Saint-Germain', rating: 91, pace: 97, shooting: 89, passing: 80, value: 200000, nationality: 'France', age: 25 },
    { id: 'dembele', name: 'Ousmane Dembélé', position: 'RW', club: 'Paris Saint-Germain', rating: 85, pace: 93, shooting: 79, passing: 83, value: 60000, nationality: 'France', age: 27 },
    { id: 'vitinha', name: 'Vitinha', position: 'CM', club: 'Paris Saint-Germain', rating: 83, pace: 70, shooting: 75, passing: 87, value: 70000, nationality: 'Portugal', age: 24 },

    // AS Monaco
    { id: 'wahi', name: 'Elye Wahi', position: 'ST', club: 'AS Monaco', rating: 76, pace: 89, shooting: 78, passing: 65, value: 35000, nationality: 'France', age: 21 },
    { id: 'akliouche', name: 'Maghnes Akliouche', position: 'RW', club: 'AS Monaco', rating: 75, pace: 83, shooting: 74, passing: 78, value: 30000, nationality: 'France', age: 22 },
  ]
};

// Helper function to get all players
export const getAllPlayers = () => {
  return [
    ...PLAYERS_DATABASE.premierLeague,
    ...PLAYERS_DATABASE.laLiga,
    ...PLAYERS_DATABASE.serieA,
    ...PLAYERS_DATABASE.bundesliga,
    ...PLAYERS_DATABASE.ligue1
  ];
};

// Helper function to get players by league
export const getPlayersByLeague = (league) => {
  return PLAYERS_DATABASE[league] || [];
};

// Additional generated players to reach 200+
const generateAdditionalPlayers = () => {
  const firstNames = ['Luka', 'Marco', 'David', 'Andrea', 'Roberto', 'Alex', 'João', 'Miguel', 'Carlos', 'Luis', 'Gabriel', 'Diego', 'Fernando', 'Antonio', 'Pablo', 'Pedro', 'Rafael', 'Eduardo', 'Sergio', 'Manuel', 'Mateo', 'Enzo', 'Lucas', 'Nicolas', 'Ivan', 'Maxim', 'Viktor', 'Dmitri', 'Aleksandr', 'Nikola', 'Stefan', 'Milan', 'Marcin', 'Jakub', 'Tomasz', 'Ahmed', 'Omar', 'Hassan', 'Karim', 'Youssef'];
  const lastNames = ['Silva', 'Santos', 'Rodriguez', 'Garcia', 'Martinez', 'Lopez', 'Hernandez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Cruz', 'Flores', 'Gutierrez', 'Morales', 'Ortiz', 'Jimenez', 'Ruiz', 'Herrera', 'Medina', 'Castillo', 'Ramos', 'Vargas', 'Romero', 'Soto', 'Contreras', 'Guerrero', 'Mendoza', 'Rojas', 'Delgado', 'Petrov', 'Volkov', 'Smirnov', 'Kuznetsov', 'Popov', 'Novak', 'Kozlov', 'Ivanov', 'Fedorov', 'Dimitrov'];
  const clubs = ['Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'Bayern Munich', 'Paris Saint-Germain', 'Chelsea', 'Arsenal', 'Manchester United', 'Juventus', 'AC Milan', 'Inter Milan', 'Atletico Madrid', 'Borussia Dortmund', 'Napoli', 'Tottenham', 'Newcastle', 'Brighton', 'West Ham', 'Aston Villa', 'Crystal Palace', 'Wolves', 'Sevilla', 'Valencia', 'Athletic Bilbao', 'Real Sociedad', 'Villarreal', 'Atalanta', 'Roma', 'Lazio', 'Fiorentina', 'Bologna', 'RB Leipzig', 'Bayer Leverkusen', 'Eintracht Frankfurt', 'VfB Stuttgart', 'AS Monaco', 'Marseille', 'Lyon', 'Lille', 'Nice', 'Rennes', 'Montpellier', 'Lens', 'Strasbourg'];
  const positions = ['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'];
  const nationalities = ['Spain', 'France', 'England', 'Germany', 'Italy', 'Portugal', 'Brazil', 'Argentina', 'Netherlands', 'Belgium', 'Croatia', 'Poland', 'Serbia', 'Denmark', 'Sweden', 'Norway', 'Austria', 'Switzerland', 'Ukraine', 'Turkey', 'Morocco', 'Senegal', 'Nigeria', 'Ghana', 'Ivory Coast', 'Colombia', 'Uruguay', 'Chile', 'Mexico', 'USA', 'Canada', 'Japan', 'South Korea'];

  const generatedPlayers = [];

  for (let i = 0; i < 170; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const club = clubs[Math.floor(Math.random() * clubs.length)];
    const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];

    // Generate realistic stats based on position
    let baseRating = 70 + Math.floor(Math.random() * 20); // 70-89
    let pace = 60 + Math.floor(Math.random() * 35); // 60-94
    let shooting = 50 + Math.floor(Math.random() * 40); // 50-89
    let passing = 60 + Math.floor(Math.random() * 30); // 60-89

    // Adjust stats based on position
    if (position === 'ST' || position === 'CF') {
      shooting += 10;
      pace += 5;
    } else if (position === 'LW' || position === 'RW') {
      pace += 10;
      shooting += 5;
    } else if (position === 'CAM' || position === 'CM') {
      passing += 10;
      shooting += 5;
    } else if (position === 'CDM') {
      passing += 8;
      pace -= 10;
    } else if (position === 'CB') {
      pace -= 15;
      passing += 5;
      shooting -= 20;
    } else if (position === 'LB' || position === 'RB') {
      pace += 8;
      shooting -= 10;
      passing += 5;
    } else if (position === 'GK') {
      pace -= 20;
      shooting -= 30;
      passing -= 10;
      baseRating = 75 + Math.floor(Math.random() * 15);
    }

    // Cap stats at reasonable levels
    pace = Math.max(30, Math.min(99, pace));
    shooting = Math.max(20, Math.min(95, shooting));
    passing = Math.max(40, Math.min(95, passing));
    baseRating = Math.max(65, Math.min(92, baseRating));

    const value = Math.floor((baseRating - 60) * 3000 + Math.random() * 20000 + 15000);
    const age = 17 + Math.floor(Math.random() * 18); // 17-34

    generatedPlayers.push({
      id: `generated_${i}`,
      name: `${firstName} ${lastName}`,
      position,
      club,
      rating: baseRating,
      pace,
      shooting,
      passing,
      value,
      nationality,
      age
    });
  }

  return generatedPlayers;
};

// Helper function to get random transfer market players
export const getTransferMarketPlayers = (count = 20) => {
  const realPlayers = getAllPlayers();
  const generatedPlayers = generateAdditionalPlayers();
  const allPlayers = [...realPlayers, ...generatedPlayers];
  const shuffled = allPlayers.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to get players by position
export const getPlayersByPosition = (position) => {
  const allPlayers = getAllPlayers();
  return allPlayers.filter(player => player.position === position);
};

// Default starting balance for new users
export const DEFAULT_BALANCE = 500000; // 500k for realistic transfers