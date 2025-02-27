// Variables globales
let restaurants = [];
let currentRoundMatches = [];
let tournamentByes = [];
let tournamentStage = ""; // "prelim" o "main"
let currentWinners = [];
let currentMatchIndex = 0;
let selectedFilters = [">10", "10-20", "20+"];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.style.display = 'none';
  });
  const screenToShow = document.getElementById(id);
  screenToShow.style.display = 'flex';
  // Reiniciar animación
  screenToShow.classList.remove('fade-in');
  void screenToShow.offsetWidth;
  screenToShow.classList.add('fade-in');
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createMatches(arr) {
  let matches = [];
  for (let i = 0; i < arr.length; i += 2) {
    matches.push([arr[i], arr[i+1]]);
  }
  return matches;
}

function startTournament() {
  // Obtener la lista de restaurantes desde ajustes.
  const container = document.getElementById("restaurantList");
  restaurants = [];
  if (container.children.length > 0) {
    for (let item of container.children) {
      const nameInput = item.querySelector('input');
      const select = item.querySelector('select');
      if (nameInput.value.trim() !== "") {
        restaurants.push({ name: nameInput.value.trim(), price: select.value });
      }
    }
  } else {
    // Si no se configuró, usar 10 restaurantes default con precio "10-20"
    const defaultNames = ["UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ"];
    defaultNames.forEach(n => restaurants.push({ name: n, price: "10-20" }));
  }
  
  // Filtrar según los botones de presupuesto seleccionados
  restaurants = restaurants.filter(r => selectedFilters.includes(r.price));
  
  if (restaurants.length < 2) {
    alert("Se necesitan al menos dos restaurantes que cumplan el presupuesto seleccionado.");
    return;
  }
  
  // Mezclar aleatoriamente y preparar el torneo
  restaurants = shuffle(restaurants.slice());
  const n = restaurants.length;
  const power = Math.pow(2, Math.floor(Math.log2(n)));
  if (n === power) {
    tournamentStage = "main";
    currentRoundMatches = createMatches(restaurants);
  } else {
    tournamentStage = "prelim";
    const numPrelimMatches = n - power; // partidos preliminares necesarios
    let prelimCompetitors = restaurants.slice(0, 2 * numPrelimMatches);
    tournamentByes = restaurants.slice(2 * numPrelimMatches);
    currentRoundMatches = createMatches(prelimCompetitors);
  }
  currentWinners = [];
  currentMatchIndex = 0;
  showScreen("matchScreen");
  showNextMatch();
}

function showNextMatch() {
  if (currentMatchIndex < currentRoundMatches.length) {
    const match = currentRoundMatches[currentMatchIndex];
    document.getElementById("card1").textContent = match[0].name;
    document.getElementById("card2").textContent = match[1].name;
  } else {
    // Final de ronda actual.
    let nextRoundCompetitors;
    if (tournamentStage === "prelim") {
      nextRoundCompetitors = tournamentByes.concat(currentWinners);
      tournamentStage = "main";
    } else {
      nextRoundCompetitors = currentWinners;
    }
    if (nextRoundCompetitors.length === 1) {
      showWinner(nextRoundCompetitors[0].name);
      return;
    }
    currentRoundMatches = createMatches(nextRoundCompetitors);
    currentWinners = [];
    currentMatchIndex = 0;
    showNextMatch();
  }
}

function handleMatchSelection(index) {
  const match = currentRoundMatches[currentMatchIndex];
  const winner = match[index];
  currentWinners.push(winner);
  currentMatchIndex++;
  showNextMatch();
}

function showWinner(winner) {
  document.getElementById("winnerName").textContent = winner;
  showScreen("winnerScreen");
}

function populateRestaurants() {
  const container = document.getElementById("restaurantList");
  container.innerHTML = "";
  // Si ya existen valores, úsalos; de lo contrario, default de 10.
  if (restaurants.length === 0) {
    const defaultNames = ["UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ"];
    defaultNames.forEach(n => restaurants.push({ name: n, price: "10-20" }));
  }
  restaurants.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("restaurant-item");
    const input = document.createElement("input");
    input.type = "text";
    input.value = item.name;
    const select = document.createElement("select");
    const option1 = document.createElement("option");
    option1.value = ">10";
    option1.textContent = ">$10";
    const option2 = document.createElement("option");
    option2.value = "10-20";
    option2.textContent = "$10‑20";
    const option3 = document.createElement("option");
    option3.value = "20+";
    option3.textContent = "$20+";
    select.appendChild(option1);
    select.appendChild(option2);
    select.appendChild(option3);
    select.value = item.price;
    div.appendChild(input);
    div.appendChild(select);
    container.appendChild(div);
  });
}

// Eventos para los botones de filtro de presupuesto
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const filter = this.getAttribute('data-filter');
    if (this.classList.contains('selected')) {
      if (selectedFilters.length === 1) {
        alert("Debe haber al menos un filtro seleccionado.");
      } else {
        this.classList.remove('selected');
        selectedFilters = selectedFilters.filter(f => f !== filter);
      }
    } else {
      this.classList.add('selected');
      if (!selectedFilters.includes(filter)) {
        selectedFilters.push(filter);
      }
    }
  });
});

// Eventos de navegación y botones
document.getElementById("opcionesBtn").addEventListener("click", function() {
  populateRestaurants();
  showScreen("opcionesScreen");
});
document.getElementById("opcionesBackBtn").addEventListener("click", function() {
  showScreen("mainScreen");
});
document.getElementById("elegirBtn").addEventListener("click", function() {
  startTournament();
});
document.getElementById("resetBtn").addEventListener("click", function() {
  showScreen("mainScreen");
});

// Botones para agregar o eliminar restaurantes en ajustes.
document.getElementById("addRestaurantBtn").addEventListener("click", function() {
  const container = document.getElementById("restaurantList");
  const div = document.createElement("div");
  div.classList.add("restaurant-item");
  const input = document.createElement("input");
  input.type = "text";
  input.value = "NUEVO";
  const select = document.createElement("select");
  const option1 = document.createElement("option");
  option1.value = ">10";
  option1.textContent = ">$10";
  const option2 = document.createElement("option");
  option2.value = "10-20";
  option2.textContent = "$10‑20";
  const option3 = document.createElement("option");
  option3.value = "20+";
  option3.textContent = "$20+";
  select.appendChild(option1);
  select.appendChild(option2);
  select.appendChild(option3);
  select.value = "10-20";
  div.appendChild(input);
  div.appendChild(select);
  container.appendChild(div);
});
document.getElementById("removeRestaurantBtn").addEventListener("click", function() {
  const container = document.getElementById("restaurantList");
  if (container.children.length > 1) {
    container.removeChild(container.lastChild);
  } else {
    alert("Debe haber al menos un restaurante.");
  }
});

// Eventos para la selección de cartas en el torneo.
document.getElementById("card1").addEventListener("click", function() {
  handleMatchSelection(0);
});
document.getElementById("card2").addEventListener("click", function() {
  handleMatchSelection(1);
});
