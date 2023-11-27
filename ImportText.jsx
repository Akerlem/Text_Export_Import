// After Effects Script to Import Text from CSV and Replace Text Layers

// Get the active composition
var comp = app.project.activeItem;

// Check if a composition is open
if (comp && comp instanceof CompItem) {
  // Prompt the user to choose a file to import the CSV data
  var importFile = File.openDialog("Import CSV File", "Comma-separated Values:*.csv");

  // Check if the user canceled the dialog
  if (!importFile) {
    alert("Import canceled by the user.");
  } else {
    importFile.open("r");

    // Skip the header line
    importFile.readln();

    // Loop through the CSV data
    while (!importFile.eof) {
      var line = importFile.readln();
      if (line !== "") {
        var data = line.split(",");
        var layerName = data[0];
        var newText = data[1];

        // Find the text layer by name
        var textLayer = comp.layer(layerName);

        // Check if the layer is a text layer
        if (textLayer instanceof TextLayer) {
          // Update the text content
          textLayer.text.sourceText.setValue(newText);
        }
      }
    }

    // Close the import file
    importFile.close();
    alert("Text replacement complete!\nFile imported from: " + importFile.fsName);
  }
} else {
  alert("Open a composition to run this import script.");
}