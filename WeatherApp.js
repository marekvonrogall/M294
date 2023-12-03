const apiURL = "http://localhost:2940/api/v1/entities";

function fetchData(apiURL, options = {}) {
  return fetch(apiURL, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function displayTemperature(location) {
  console.log("Displaying temperature for:", location.name);
  
  document.getElementById("city").innerText = location.name || "--";
  document.getElementById("kanton, country").innerText =
    `${location.region}, ${location.country}` || "--, --";
  document.getElementById("temperature_today").innerText =
    `${location.temperature.monday}°C` || "--°C";
  document.getElementById("day-temperature-monday").innerText =
    `${location.temperature.monday}°C` || "--°C";
  document.getElementById("day-temperature-tuesday").innerText =
    `${location.temperature.tuesday}°C` || "--°C";
}

function modifyEntry(location) {
  console.log("Modifying entry:", location.name);
  const id = location.id;

  var addForm = document.getElementById("add_form");
  addForm.style.display = "none";
  var editForm = document.getElementById("edit_form");
  editForm.style.display = "block";

  // Fetch details of the selected location
  fetchData(`${apiURL}/${encodeURIComponent(id)}`)
    .then((data) => {
      // Open the modal or navigate to the edit page
      document.getElementById("editName").value = data.name;
      document.getElementById("editRegion").value = data.region;
      document.getElementById("editCountry").value = data.country;
      document.getElementById("editMondayTemperature").value =
        data.temperature.monday;
      document.getElementById("editTuesdayTemperature").value =
        data.temperature.tuesday;
      document.getElementById("dataID").value = data.id;
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function cancelAddForm() {
  var editForm = document.getElementById("edit_form");
  editForm.style.display = "none";
  var addForm = document.getElementById("add_form");
  addForm.style.display = "block";
  console.log("Entry modification canceled.");
}

function submitEditForm() {
  const updatedFormData = {
    name: document.getElementById("editName").value,
    region: document.getElementById("editRegion").value,
    country: document.getElementById("editCountry").value,
    temperature: {
      monday: parseInt(document.getElementById("editMondayTemperature").value),
      tuesday: parseInt(
        document.getElementById("editTuesdayTemperature").value
      ),
    },
  };

  id = document.getElementById("dataID").value;
  // Send a PUT request to update the location details
  fetch(`${apiURL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedFormData),
  })
    .then((response) => response.json())
    .then((data) => {
      fetchAndCreateButtons(); // Update the UI with the modified data
      console.log("Entry modified successfully:", data);

      var editForm = document.getElementById("edit_form");
      editForm.style.display = "none";
      var addForm = document.getElementById("add_form");
      addForm.style.display = "block";
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });

  // Close the modal or navigate back to the main page
}

function deleteEntry(location) {
  const id = location.id;

  fetchData(`${apiURL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(() => {
      console.log("Entry deleted successfully:", id);
      fetchAndCreateButtons();
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function createLocationButtons(locations) {
  const locationButtonsContainer = document.getElementById("locationButtons");
  locationButtonsContainer.innerHTML = "";

  locations.forEach((location) => {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    const mainButton = createButton(location.name, () => {
      displayTemperature(location);
    });

    const editButton = createIconButton("edit", "blue", () => {
      modifyEntry(location);
    });

    const deleteButton = createIconButton("delete", "red", () => {
      deleteEntry(location);
    });

    buttonContainer.appendChild(mainButton);
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);
    locationButtonsContainer.appendChild(buttonContainer);
  });
}

function createButton(text, onClick) {
  const button = document.createElement("div");
  button.className = "location-button";
  button.innerText = text;
  button.addEventListener("click", onClick);
  return button;
}

function createIconButton(icon, color, onClick) {
  const button = document.createElement("button");
  button.className = `icon-button ${color}`;
  button.innerHTML = `<img src="${icon}.png" alt="${icon}">`;
  button.addEventListener("click", onClick);
  return button;
}

function fetchAndCreateButtons() {
  const accessToken = sessionStorage.getItem("accessToken");

  if (!accessToken) {
    console.error("User not authenticated.");
    return;
  }

  // Fetch weather data using the access token
  fetchData(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then(createLocationButtons)
    .catch((error) => {
      console.error("Error fetching and creating buttons:", error);
    });
}

function submitAddForm() {
  const accessToken = sessionStorage.getItem("accessToken");

  if (!accessToken) {
    console.error("User not authenticated.");
    return;
  }

  const formData = {
    name: document.getElementById("name").value,
    region: document.getElementById("region").value,
    country: document.getElementById("country").value,
    temperature: {
      monday: parseInt(document.getElementById("mondayTemperature").value),
      tuesday: parseInt(document.getElementById("tuesdayTemperature").value),
    },
  };

  // Send a POST request to add a new location
  fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      fetchAndCreateButtons();
      console.log("New entry created:", data);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}
