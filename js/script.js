const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let nextUrl = "";
const pokemonsWrapper = document.getElementById("pokemons-wrapper");
const loadMore = document.getElementById("load-more");
const spinner = document.getElementById("spinner");
const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");
const cardWrapper = document.getElementById("card");

document.addEventListener("DOMContentLoaded", async (e) => {
    await loadPokemons("");
});

// Loading more pokemons
loadMore.addEventListener("click", (e) => {
    loadMore.style.display = "none";
    spinner.style.display = "block";
    loadPokemons(nextUrl);
});

// Fetching data from APIs
async function loadPokemons(next) {
    await fetch(next ? next : BASE_URL)
        .then((response) => response.json())
        .then((results) => {
            nextUrl = results.next;
            handlingArrayObject(results.results);
        });
}

// Fetching array of URL
function handlingArrayObject(results) {
    results.forEach((result) => {
        fetch(result.url)
            .then((response) => response.json())
            .then((result) => loadUI(result))
            .then(() => {
                spinner.style.display = "none";
                loadMore.style.display = "block";
            });
    });
}

// Handling Modal
function handleModal(pokemonId) {
    fetch(`${BASE_URL}/${pokemonId}`)
        .then((response) => response.json())
        .then((results) => loadModal(results));
}

// Load modals
function loadModal(result) {
    const modalWrapper = document.getElementById("modal");
    const modalContent = document.getElementById("modal-content");
    modalContent.innerHTML = "";

    // Create close button
    const closeBtn = document.createElement("div");
    closeBtn.innerHTML = "&times;";
    closeBtn.classList.add("close-btn");

    // Handle close btn
    closeBtn.addEventListener("click", (e) => {
        modalWrapper.style.display = "none";
    });
    modalContent.appendChild(closeBtn);
    const contentLeft = document.createElement("div");
    contentLeft.classList.add("content-left");

    // Create img element for pokemon image
    const pImage = document.createElement("img");
    pImage.src = result.sprites.front_default;

    // Create h2 element for pokemon name
    const pName = document.createElement("h2");
    pName.textContent = strToUpperCaseFirst(result.name);

    // create span element for pokemon index
    const pId = document.createElement("span");
    pId.textContent = giveHashtagToId(result.id);
    pName.appendChild(pId);

    // create types wrapper
    const typesWrapper = document.createElement("div");
    typesWrapper.classList.add("types-wrapper");

    result.types.forEach((t) => {
        const pType = document.createElement("span");
        pType.classList.add("pill");
        pType.classList.add(t.type.name);
        pType.textContent = strToUpperCaseFirst(t.type.name);
        typesWrapper.appendChild(pType);
    });

    // create sprites wrapper
    const spritesWrapper = document.createElement("div");
    spritesWrapper.classList.add("sprites-wrapper");
    const items = [];

    for (const sprite in result.sprites) {
        if (sprite == "front_default") {
            items.push(result.sprites[sprite]);
        }
    }

    const arrObject = Object.values(result.sprites);
    items.push(...arrObject);
    const uniqueArr = new Set(items);
    const sprites = [...uniqueArr];
    let newSprites = sprites.filter((val) => val != null);
    newSprites = newSprites.slice(0, newSprites.length - 2);

    newSprites.forEach((val) => {
        const thumb = document.createElement("img");
        thumb.classList.add("thumb");
        if (val == pImage.src) {
            thumb.classList.add("selected");
        }
        thumb.src = val;
        spritesWrapper.appendChild(thumb);
    });

    // Append child for content left
    contentLeft.appendChild(pImage);
    contentLeft.appendChild(pName);
    contentLeft.appendChild(typesWrapper);
    contentLeft.appendChild(spritesWrapper);

    modal.addEventListener("click", (e) => {
        if (e.target.classList.contains("thumb")) {
            pImage.src = e.target.src;
            const children = document.querySelectorAll(".thumb");
            const nodeArr = Array.from(children);
            const oldChild = nodeArr.filter((val) =>
                val.classList.contains("selected")
            );

            oldChild[0].classList.remove("selected");

            e.target.classList.add("selected");
        }
    });

    // create content right wrapper
    const contentRight = document.createElement("div");
    contentRight.classList.add("content-right");

    // Weight
    const weightWrapper = document.createElement("div");
    const weightText = document.createElement("h4");
    const weightNode = document.createElement("h3");
    weightText.textContent = "Weight";
    weightNode.textContent = calcWeight(result.weight);
    weightWrapper.appendChild(weightText);
    weightWrapper.appendChild(weightNode);

    // Height
    const heightWrapper = document.createElement("div");
    const heightText = document.createElement("h4");
    const heightNode = document.createElement("h3");
    heightText.textContent = "Height";
    heightNode.textContent = result.height;
    heightWrapper.appendChild(heightText);
    heightWrapper.appendChild(heightNode);

    // abilities
    const abilityWrapper = document.createElement("div");
    const abilityText = document.createElement("h4");
    const abilityNode = document.createElement("h3");
    abilityText.textContent = "Ability";
    abilityNode.textContent = strToUpperCaseFirst(
        result.abilities[0].ability.name
    );
    abilityWrapper.appendChild(abilityText);
    abilityWrapper.appendChild(abilityNode);

    contentRight.appendChild(weightWrapper);
    contentRight.appendChild(heightWrapper);
    contentRight.appendChild(abilityWrapper);

    // Append content to modal
    modalContent.appendChild(contentLeft);
    modalContent.appendChild(contentRight);

    modalWrapper.style.display = "block";
}

// Loading UI
function loadUI(result) {
    // Create card element
    const card = document.createElement("div");
    card.classList.add("card");
    card.style.order = result.id;
    card.setAttribute("pokemonId", result.id);
    card.addEventListener("click", (e) => {
        handleModal(card.getAttribute("pokemonId"));
    });

    // create img element
    const image = document.createElement("img");
    image.src = result.sprites.front_default;
    card.appendChild(image);

    // Create info wrapper
    const aboutWrapper = document.createElement("div");
    aboutWrapper.classList.add("pokemon-about");

    // Create h3 element for pokemon name
    const pokemonName = document.createElement("h3");
    pokemonName.textContent = strToUpperCaseFirst(result.name);
    aboutWrapper.appendChild(pokemonName);

    // Create types/attributes wrapper
    const typesWrapper = document.createElement("div");
    typesWrapper.classList.add("types-wrapper");
    result.types.forEach((type) => {
        const pokemonType = document.createElement("span");

        pokemonType.classList.add(type.type.name, "pill");
        pokemonType.textContent = strToUpperCaseFirst(type.type.name);
        typesWrapper.appendChild(pokemonType);
    });
    aboutWrapper.appendChild(typesWrapper);

    // Create p element for pokemon index
    const pokemonIndex = document.createElement("p");
    pokemonIndex.classList.add("text-muted");
    pokemonIndex.textContent = giveHashtagToId(result.id);
    aboutWrapper.appendChild(pokemonIndex);

    // Wrapping all element into body
    card.appendChild(aboutWrapper);
    pokemonsWrapper.appendChild(card);
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
