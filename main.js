document
  .getElementById("generateButton")
  .addEventListener("click", async () => {
    const fileInput = document.getElementById("fileInput");
    const outputElement = document.getElementById("output");

    if (fileInput.files.length === 0) {
      alert("Please upload an OpenAPI JSON file.");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const openApiSpec = JSON.parse(event.target.result);
        const tsCode = generateClientCode(openApiSpec);
        outputElement.textContent = tsCode;
      } catch (error) {
        console.error("Error generating TypeScript code:", error);
        outputElement.textContent =
          "Error generating TypeScript code. See console for details.";
      }
    };

    reader.onerror = function () {
      console.error("Error reading file:", reader.error);
      outputElement.textContent =
        "Error reading file. See console for details.";
    };

    reader.readAsText(file);
  });
