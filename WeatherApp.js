const apiURL = "http://localhost:2940/api/v1/entities";

function displayTemperature(data) {
  document.getElementById("city").innerText = data.location.name || "--";
  document.getElementById("kanton, country").innerText =
    `${data.location.region}, ${data.location.country}` || "--, --";
  document.getElementById("display-temperature").innerText =
    `${data.location.temperature}°C` || "--°C";
  document.getElementById("condition-rain").innerText =
    `Regen: ${data.location.isRainy}` || "Regen: --";
}

function modifyEntry(data) {
  console.log("Modifying entry:", data.location.name);
  const id = data.id;
  const accessToken = sessionStorage.getItem("accessToken");

  var addForm = document.getElementById("add_form");
  addForm.style.display = "none";
  var editForm = document.getElementById("edit_form");
  editForm.style.display = "block";

  fetch(`${apiURL}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("editName").value = data.location.name;
      document.getElementById("editRegion").value = data.location.region;
      document.getElementById("editCountry").value = data.location.country;
      document.getElementById("editTemperature").value = data.location.temperature;
      document.getElementById("editRainy").checked = data.location.isRainy;
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
    location:{
      name: document.getElementById("editName").value,
      region: document.getElementById("editRegion").value,
      country: document.getElementById("editCountry").value,
      temperature: parseInt(document.getElementById("editTemperature").value),
      isRainy: document.getElementById("editRainy").checked,
    }
  };

  id = document.getElementById("dataID").value;
  const accessToken = sessionStorage.getItem("accessToken");

  fetch(`${apiURL}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedFormData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      fetchAndCreateButtons();
      console.log("Entry modified successfully:", data);

      var editForm = document.getElementById("edit_form");
      editForm.style.display = "none";
      var addForm = document.getElementById("add_form");
      addForm.style.display = "block";
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function deleteEntry(location) {
  const id = location.id;
  const accessToken = sessionStorage.getItem("accessToken");

  fetch(`${apiURL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
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

  locations.forEach((data) => {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    const mainButton = createButton(data.location.name, () => {
      displayTemperature(data);
    });

    const editButton = createIconButton("edit", "blue", () => {
      modifyEntry(data);
    });

    const deleteButton = createIconButton("delete", "red", () => {
      deleteEntry(data);
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

  fetch(apiURL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then(createLocationButtons)
    .catch((error) => {
      console.error("Error fetching and creating buttons:", error);
    });
}

function submitAddForm() {
  const accessToken = sessionStorage.getItem("accessToken");

  const formData = {
    location: {
      name: document.getElementById("name").value,
      region: document.getElementById("region").value,
      country: document.getElementById("country").value,
      temperature: parseInt(document.getElementById("temperature").value),
      isRainy: document.getElementById("rainy").checked,
    },
  };

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

function showPage(pageId) {
  // Hide all pages
  var pages = document.querySelectorAll('.page');
  pages.forEach(function(page) {
    page.style.display = 'none';
  });

  // Show the selected page
  var selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.style.display = 'block';
  }
}