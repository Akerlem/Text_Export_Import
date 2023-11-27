// After Effects Script to Export Text from Text Layers to CSV

// Get the active composition
var comp = app.project.activeItem;

// Check if a composition is open
if (comp && comp instanceof CompItem) {
  // Prompt the user to choose a location to save the CSV data
  var exportFile = File.saveDialog("Save CSV File", "Comma-separated Values:*.csv");
  
  // Check if the user canceled the dialog
  if (!exportFile) {
    alert("Export canceled by the user.");
  } else {
    exportFile.open("w");

    // Write CSV header
    exportFile.writeln("Layer Name,Text");

    // Loop through all layers in the composition
    for (var i = 1; i <= comp.numLayers; i++) {
      var layer = comp.layer(i);

      // Check if the layer is a text layer
      if (layer instanceof TextLayer) {
        // Get the layer name and text content
        var layerName = layer.name;
        var textContent = layer.text.sourceText.value.text; // Fix here

        // Check if textContent is a string
        if (typeof textContent === "string") {
          // Replace commas with a different character to avoid CSV conflicts
          textContent = textContent.replace(/,/g, ";");

          // Write layer data to the CSV file without quotes around text
          exportFile.writeln(layerName + "," + textContent);
        } else {
          // If textContent is not a string, write an empty value to the CSV file
          exportFile.writeln(layerName + ",");
        }
      }
    }

    // Close the export file
    exportFile.close();
    alert("CSV export complete!\nFile saved to: " + exportFile.fsName);
  }
} else {
  alert("Open a composition to run this export script.");
}