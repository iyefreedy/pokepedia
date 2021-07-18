const API_URL = "https://pokeapi.co/api/v2/pokemon";
const API_URL2 = `${API_URL}?offset=0&limit=1118`;
let nextUrl = "";
const pokemonsWrapper = document.getElementById("pokemons-wrapper");
const loadMore = document.getElementById("load-more");
const spinner = document.getElementById("spinner");
const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");
const cardWrapper = document.getElementById("card");

document.addEventListener("DOMContentLoaded", function (e) {
    fetchPokemons("");

    loadMore.addEventListener("click", (e) => {
        spinner.style.display = "block";
        loadMore.style.display = "none";
        fetchPokemons(nextUrl);
    });

    searchButton.addEventListener("click", (e) => {
        pokemonsWrapper.innerHTML = "";
        loadMore.style.display = "none";
        handleSearchButton(searchBar.value);
    });

    searchBar.addEventListener("input", (e) => {
        setTimeout(() => {
            if (e.target.value) {
                handleSearchButton(e.target.value);
            }
        }, 500);
    });
});

// Fetching data from API and return array of object
async function fetchPokemons(url) {
    await fetch(url ? url : API_URL)
        .then((response) => response.json())
        .then((result) => {
            nextUrl = result.next;
            return result.results;
        })
        .then((items) => handlePokemonArray(items));
}

// Handling array of object that will fetch pokemon info by every url
function handlePokemonArray(items) {
    items.forEach(async (item) => {
        await fetch(item.url)
            .then((response) => response.json())
            .then((result) => loadCard(result));
    });
}

// Handle search button
async function handleSearchButton(value) {
    pokemonsWrapper.innerHTML = "";
    loadMore.style.display = "none";
    await fetch(API_URL2)
        .then((response) => response.json())
        .then((result) => result.results)
        .then((items) => handleFiltering(items, value));
}

function handleFiltering(items, value) {
    const newItems = items.filter((item) => item.name.includes(value));
    newItems.forEach(async (item) => {
        await fetch(item.url)
            .then((response) => response.json())
            .then((result) => loadCard(result));
    });
}

// Handle card clicked
function fetchPokemon(id) {
    const endpoint = `${API_URL}/${id}`;
    fetch(endpoint)
        .then((response) => response.json())
        .then((results) => openModal(results));
}

// Open modal
function openModal(results) {
    // Overlay
    const overlay = document.getElementById("modal");
    overlay.style.display = "block";
    overlay.style.animation = "modalFadeIn 0.3s";

    // Modal
    const modal = document.getElementById("modal-content");
    modal.innerHTML = "";

    // modal content left
    const contentLeft = document.createElement("div");
    contentLeft.classList.add("content-left");

    // modal content right
    const contentRight = document.createElement("div");
    contentRight.classList.add("content-right");

    // Close button
    const closeBtn = document.createElement("div");
    closeBtn.innerHTML = "&times;";
    closeBtn.classList.add("close-btn");
    addEventListener("click", (e) => {
        if (e.target.classList.contains("close-btn")) {
            document.getElementById("modal").style.display = "none";
        }
    });

    // Content left
    // Image
    const image = document.createElement("img");
    image.src = results.sprites.front_default;

    // Pokemon name
    const name = document.createElement("h2");
    name.textContent = strToUpperCaseFirst(results.name);

    // create div element for types wrapper
    const typesWrapper = document.createElement("div");
    typesWrapper.classList.add("types-wrapper");

    const types = results.types;
    types.forEach((type) => {
        const typeText = document.createElement("span");
        typeText.classList.add("pill", type.type.name);
        typeText.textContent = strToUpperCaseFirst(type.type.name);
        typesWrapper.appendChild(typeText);
    });

    // Create div elements for sprites wrapper
    const spritesWrapper = document.createElement("div");
    spritesWrapper.classList.add("sprites-wrapper");

    // Reordering object
    const items = [];

    for (const sprite in results.sprites) {
        if (sprite == "front_default") {
            items.push(results.sprites[sprite]);
        }
    }

    const arrObject = Object.values(results.sprites);
    items.push(...arrObject);
    const uniqueArr = new Set(items);
    const sprites = [...uniqueArr];
    let newSprites = sprites.filter((val) => val != null);
    newSprites = newSprites.slice(0, newSprites.length - 2);
    console.log(newSprites);

    newSprites.forEach((val, index, array) => {
        const thumb = document.createElement("img");
        thumb.classList.add("thumb");
        if (val == image.src) {
            thumb.classList.add("selected");
        }
        thumb.src = val;
        spritesWrapper.appendChild(thumb);
    });

    modal.addEventListener("click", (e) => {
        if (e.target.classList.contains("thumb")) {
            image.src = e.target.src;
            const children = document.querySelectorAll(".thumb");
            const nodeArr = Array.from(children);
            const oldChild = nodeArr.filter((val) =>
                val.classList.contains("selected")
            );

            oldChild[0].classList.remove("selected");

            e.target.classList.add("selected");
        }
    });

    // Pokemon index
    const index = document.createElement("span");
    index.textContent = giveHashtagToId(results.id);

    // Content right
    // Weight
    const weightWrapper = document.createElement("div");
    const weightText = document.createElement("h4");
    const weightNode = document.createElement("h3");
    weightText.textContent = "Weight";
    weightNode.textContent = calcWeight(results.weight);
    weightWrapper.appendChild(weightText);
    weightWrapper.appendChild(weightNode);

    // Height
    const heightWrapper = document.createElement("div");
    const heightText = document.createElement("h4");
    const heightNode = document.createElement("h3");
    heightText.textContent = "Height";
    heightNode.textContent = results.height;
    heightWrapper.appendChild(heightText);
    heightWrapper.appendChild(heightNode);

    // abilities
    const abilityWrapper = document.createElement("div");
    const abilityText = document.createElement("h4");
    const abilityNode = document.createElement("h3");
    abilityText.textContent = "Ability";
    abilityNode.textContent = strToUpperCaseFirst(
        results.abilities[0].ability.name
    );
    abilityWrapper.appendChild(abilityText);
    abilityWrapper.appendChild(abilityNode);

    // Apending all child to wrapper
    modal.appendChild(closeBtn);
    contentLeft.appendChild(image);
    name.appendChild(index);
    contentLeft.appendChild(name);
    contentLeft.appendChild(typesWrapper);
    contentLeft.appendChild(spritesWrapper);
    // Content right
    contentRight.appendChild(weightWrapper);
    contentRight.appendChild(heightWrapper);
    contentRight.appendChild(abilityWrapper);
    modal.appendChild(contentLeft);
    modal.appendChild(contentRight);
    overlay.appendChild(modal);
}

// Handle loading all element needed for showing pokemon info
function loadCard(pokemon) {
    // create div element for card that contain pokemon info
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("pokemon-id", pokemon.id);
    card.addEventListener("click", (e) => {
        fetchPokemon(card.getAttribute("pokemon-id"));
    });
    // card.setAttribute('pokemon-id', pokemon)

    // create div element that contain pokemon info
    const content = document.createElement("div");
    content.classList.add("pokemon-about");

    // create img element for pokemon image
    const image = document.createElement("img");
    image.src = pokemon.sprites.front_default;

    // create h3 element for pokemon name
    const name = document.createElement("h3");
    name.textContent = strToUpperCaseFirst(pokemon.name);

    // create p element for pokemon index
    const index = document.createElement("p");
    index.classList.add("text-muted");
    index.textContent = giveHashtagToId(pokemon.id);

    // create div element for types wrapper
    const typesWrapper = document.createElement("div");
    typesWrapper.classList.add("types-wrapper");

    const types = pokemon.types;
    types.forEach((type) => {
        const typeText = document.createElement("span");
        typeText.classList.add("pill", type.type.name);
        typeText.textContent = strToUpperCaseFirst(type.type.name);
        typesWrapper.appendChild(typeText);
    });

    // Append all created element to body
    content.appendChild(name);
    content.appendChild(typesWrapper);
    content.appendChild(index);
    card.appendChild(image);
    card.appendChild(content);
    card.style.order = pokemon.id;

    pokemonsWrapper.appendChild(card);

    spinner.style.display = "none";
    loadMore.style.display = "block";
}

// Helpers
function strToUpperCaseFirst(str) {
    const newStr = str.replace("-", " ");
    return newStr.charAt(0).toUpperCase() + newStr.slice(1);
}

function giveHashtagToId(number) {
    return number > 99
        ? `#${number}`
        : number > 9
        ? `#0${number}`
        : `#00${number}`;
}

function calcWeight(weight) {
    return weight / 10 + " kg";
}
