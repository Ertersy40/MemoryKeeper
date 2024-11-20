// IndexedDB Setup
const dbRequest = indexedDB.open("MemoryKeeperDB", 1);
let db;

dbRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore("memories", { keyPath: "id" });
};

dbRequest.onsuccess = (event) => {
    db = event.target.result;
    loadMemories();
};

function saveToIndexedDB(memory) {
    const transaction = db.transaction("memories", "readwrite");
    const store = transaction.objectStore("memories");
    store.put(memory);
}

// Save to localStorage
function saveToLocalStorage(memory) {
    const memories = JSON.parse(localStorage.getItem("memories")) || [];
    memories.push(memory);
    localStorage.setItem("memories", JSON.stringify(memories));
}

// Load from IndexedDB
function loadMemories() {
    const transaction = db.transaction("memories", "readonly");
    const store = transaction.objectStore("memories");
    const request = store.getAll();

    request.onsuccess = () => {
        const memories = request.result;
        memories.forEach(renderMemory);
    };
}

// Render Memory
function renderMemory(memory) {
    const list = document.getElementById("memoryList");
    const li = document.createElement("li");

    // Convert links in text to clickable links
    const textWithLinks = memory.text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank">$1</a>'
    );

    li.innerHTML = `
        <div class="memory-content">
            ${memory.image ? `<img src="${memory.image}" alt="Memory Image" onclick="showImageFullScreen('${memory.image}')">` : ""}
            <span>${textWithLinks}</span>
            <div class="memory-timestamp">${memory.timestamp}</div>
        </div>
        <button onclick="deleteMemory('${memory.id}')">✔️</button>
    `;
    list.appendChild(li);
}



// Delete Memory
function deleteMemory(id) {

    const transaction = db.transaction("memories", "readwrite");
    const store = transaction.objectStore("memories");
    store.delete(id);

    // Remove from localStorage
    const memories = JSON.parse(localStorage.getItem("memories")) || [];
    const updatedMemories = memories.filter(memory => memory.id !== id);
    localStorage.setItem("memories", JSON.stringify(updatedMemories));

    // Refresh list
    document.getElementById("memoryList").innerHTML = "";
    loadMemories();
    burstHearts();
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("memoryForm");
    form.addEventListener("submit", SubmitMemory);
});

// Form submission handler
function SubmitMemory(event) {
    burstHearts();
    event.preventDefault(); // Prevent form submission

    console.log("SubmitMemory function triggered");

    const text = document.getElementById("memoryText").value.trim();
    const imageInput = document.getElementById("memoryImage");

    if (!text) {
        alert("Please enter some text for the memory.");
        return;
    }

    const id = Date.now().toString();
    const timestamp = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Optional: Use 24-hour time format. Remove this line for AM/PM.
    });
     // Get the current date and time
    const memory = { id, text, image: null, timestamp };

    // Handle image upload
    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
            memory.image = reader.result;
            saveMemory(memory);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveMemory(memory);
    }

    // Reset the form
    document.getElementById("memoryForm").reset();

    // Reset image preview
    resetImagePreview();
}

// Reset the image preview to the camera icon
function resetImagePreview() {
    const previewContainer = document.getElementById("imagePreview");
    previewContainer.innerHTML = `<label for="memoryImage" class="image-icon">📷</label>`;
}


function saveMemory(memory) {
    console.log("Saving memory:", memory);
    saveToIndexedDB(memory);
    saveToLocalStorage(memory);
    renderMemory(memory);
}

function previewImage(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById("imagePreview");

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Clear existing content
            previewContainer.innerHTML = "";

            // Create image element
            const img = document.createElement("img");
            img.src = e.target.result;
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else {
        // Reset to camera icon if no file is selected
        previewContainer.innerHTML = `<label for="memoryImage" class="image-icon">📷</label>`;
    }
}





// Show Image in Full-Screen Modal
function showImageFullScreen(imageSrc) {
    const modal = document.createElement("div");
    modal.id = "imageModal";
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <img src="${imageSrc}" alt="Memory Image">
            <button class="close-modal">✖️</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Add event listeners for closing the modal
    document.querySelector(".modal-overlay").addEventListener("click", closeModal);
    document.querySelector(".close-modal").addEventListener("click", closeModal);

    function closeModal() {
        document.getElementById("imageModal").remove();
    }
}
