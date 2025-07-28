// Cached elements
const clothingUpload = document.getElementById("clothingUpload");
const API_KEY = "5p1BdvsYdsJefG488nLpFwgs";
const myOutfitsButton = document.getElementById("viewOutfitsButton");
const outfitsModal = document.getElementById("outfitsModal");
const outfitsGallery = document.getElementById("outfitsGallery");
const saveButtonContainer = document.getElementById("saveButtonContainer");

// Create Save Outfit button inside the container
const saveButton = document.createElement("button");
saveButton.textContent = "Save Outfit";
saveButton.id = "saveOutfitButton";
saveButtonContainer.appendChild(saveButton);

//clear all button
const clearButton = document.createElement("button");
clearButton.id = "clearBodyButton";
clearButton.title = "Clear All";
clearButton.innerHTML = "🧹"; // or use a font icon later
saveButtonContainer.appendChild(clearButton);

window.addEventListener("DOMContentLoaded", () => {
  const savedLibrary = JSON.parse(localStorage.getItem("clothingLibrary") || "{}");
  for (const [cat, items] of Object.entries(savedLibrary)) {
    items.forEach(({ src, name }) => addClothingToLibrary(cat, src, name));
  }
});

// Category tab switching
const tabs = document.querySelectorAll(".category-button");
const categories = document.querySelectorAll(".category");
let openCategory = null;

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    const selected = btn.dataset.cat;
    if (openCategory === selected) {
      document.getElementById(selected).classList.add("hidden");
      openCategory = null;
    } else {
      categories.forEach(cat => cat.classList.add("hidden"));
      document.getElementById(selected).classList.remove("hidden");
      openCategory = selected;
    }
  });
});

// Convert Blob to Base64 string
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

// Clothing upload
clothingUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const name = prompt("Enter a name for this item:");
  if (!name) return;

  const category = prompt("Which category? (tops, bottoms, shoes, accessories, dresses, bags)").toLowerCase();
  if (!["tops", "bottoms", "shoes", "accessories", "dresses", "bags"].includes(category)) {
  alert("Invalid category.");
  return;
}

  const formData = new FormData();
  formData.append("image_file", file);
  formData.append("size", "auto");

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": API_KEY },
      body: formData
    });

    if (!response.ok) throw new Error("Remove.bg failed");

    const blob = await response.blob();
    const base64URL = await blobToBase64(blob);

    addClothingToLibrary(category, base64URL, name);
    saveToLocalStorage(category, base64URL, name);
  } catch (err) {
    alert("Background removal failed.");
    console.error(err);
  }
});

// Add clothing image with delete button to library
function addClothingToLibrary(category, src, name = "") {
  const container = document.createElement("div");
  container.classList.add("clothing-item");
  container.style.position = "relative";
  container.style.display = "inline-block";

  const img = document.createElement("img");
  img.src = src;
  img.title = name;
  img.draggable = true;
  img.style.cursor = "move";
  img.style.display = "block";

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "×";
  deleteBtn.title = "Delete this item";
  deleteBtn.classList.add("delete-button");
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    container.remove();
    removeFromLocalStorage(category, src);
  });

  container.appendChild(img);
  container.appendChild(deleteBtn);
  document.getElementById(category).appendChild(container);

  img.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ src }));
  });
}

// Remove item from localStorage
function removeFromLocalStorage(category, src) {
  const lib = JSON.parse(localStorage.getItem("clothingLibrary") || "{}");
  if (!lib[category]) return;
  lib[category] = lib[category].filter(item => item.src !== src);
  localStorage.setItem("clothingLibrary", JSON.stringify(lib));
}

// Drag and drop on main area
const bodyArea = document.getElementById("bodyArea");
bodyArea.addEventListener("dragover", (e) => e.preventDefault());
bodyArea.addEventListener("drop", (e) => {
  e.preventDefault();
  const data = JSON.parse(e.dataTransfer.getData("text/plain"));
  const x = e.offsetX;
  const y = e.offsetY;
  placeClothingAnywhere(data.src, x, y);
});

function placeClothingAnywhere(src, x, y) {
  const img = document.createElement("img");
  img.src = src;
  img.style.width = "100px";
  img.style.position = "absolute";
  img.style.left = `${x - 50}px`;
  img.style.top = `${y - 50}px`;
  img.style.cursor = "move";
  img.style.zIndex = 5;
  img.setAttribute("data-rotation", "0");

  img.addEventListener("wheel", (e) => {
    e.preventDefault();
    let currentWidth = parseFloat(img.style.width);
    currentWidth += (e.deltaY < 0 ? 10 : -10);
    if (currentWidth > 30) img.style.width = currentWidth + "px";
  });

  img.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    let rotation = parseFloat(img.getAttribute("data-rotation")) || 0;
    rotation = (rotation + 15) % 360;
    img.setAttribute("data-rotation", rotation);
    img.style.transform = `rotate(${rotation}deg)`;
  });

  img.addEventListener("dblclick", () => img.remove());

  let offsetX, offsetY;
  img.addEventListener("mousedown", (e) => {
    e.preventDefault();
    offsetX = e.offsetX;
    offsetY = e.offsetY;

    function move(eMove) {
      img.style.left = `${eMove.clientX - bodyArea.offsetLeft - offsetX}px`;
      img.style.top = `${eMove.clientY - bodyArea.offsetTop - offsetY}px`;
    }
    function stop() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
    }

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
  });

  bodyArea.appendChild(img);
}

// Save clothing item to localStorage
function saveToLocalStorage(category, src, name = "") {
  const lib = JSON.parse(localStorage.getItem("clothingLibrary") || "{}");
  if (!lib[category]) lib[category] = [];
  lib[category].push({ src, name });
  localStorage.setItem("clothingLibrary", JSON.stringify(lib));
}

// Save outfit as image when Save button clicked
saveButton.addEventListener("click", async () => {
  const bodyImg = document.getElementById("bodyImage");
  if (!bodyImg.complete) {
    await new Promise((resolve) => {
      bodyImg.onload = () => resolve();
    });
  }
  const canvas = await html2canvas(bodyArea);
  const dataURL = canvas.toDataURL("image/png");

  const outfits = JSON.parse(localStorage.getItem("savedOutfits") || "[]");
  outfits.push(dataURL);
  localStorage.setItem("savedOutfits", JSON.stringify(outfits));

  alert("Outfit saved!");
});

// View saved outfits modal
myOutfitsButton.addEventListener("click", () => {
  outfitsGallery.innerHTML = "";
  const outfits = JSON.parse(localStorage.getItem("savedOutfits") || "[]");

  outfits.forEach((url, index) => {
    const container = document.createElement("div");
    container.classList.add("outfit-container");
    container.style.position = "relative";
    container.style.marginBottom = "10px";
    container.style.display = "inline-block";

    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    img.style.display = "block";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.title = "Delete this outfit";
    deleteBtn.style.position = "absolute";
    deleteBtn.style.top = "5px";
    deleteBtn.style.right = "5px";
    deleteBtn.style.backgroundColor = "red";
    deleteBtn.style.color = "white";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "50%";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.width = "24px";
    deleteBtn.style.height = "24px";
    deleteBtn.style.fontSize = "18px";
    deleteBtn.style.lineHeight = "24px";
    deleteBtn.style.textAlign = "center";
    deleteBtn.style.padding = "0";
    deleteBtn.style.userSelect = "none";

    deleteBtn.addEventListener("click", () => {
      // Remove from localStorage first
      const savedOutfits = JSON.parse(localStorage.getItem("savedOutfits") || "[]");
      savedOutfits.splice(index, 1);
      localStorage.setItem("savedOutfits", JSON.stringify(savedOutfits));

      // Remove from DOM
      container.remove();
    });

    container.appendChild(img);
    container.appendChild(deleteBtn);
    outfitsGallery.appendChild(container);
  });

  outfitsModal.style.display = "block";
  saveButton.style.display = "none";  // Hide save button when modal open
});

// Close saved outfits modal
document.getElementById("closeOutfitsModal").addEventListener("click", () => {
  outfitsModal.style.display = "none";
  saveButton.style.display = "inline-block"; // Show save button again when modal closed
});

//clear all button
document.getElementById("clearBodyButton").addEventListener("click", () => {
  const bodyArea = document.getElementById("bodyArea");
  const allClothing = bodyArea.querySelectorAll("img:not(#bodyImage)");
  allClothing.forEach(img => img.remove());
});
