// After Effects Script with Dockable UI for Exporting and Importing Text

//////Dockable UI
{
  function myScript(thisObj){
    function myScript_buildUI(thisObj){
      var myPanel = (thisObj instanceof Panel) ? thisObj: new Window("palette", "ExportImport", undefined, {resizable: true, closeButton:false});
  
      var res = "group{orientation:'column',\
            groupOne: Group{orientation:'row',\
            exportButton: Button{text:'Export Text'},\
          },\
          groupTwo: Group{orientation:'row',\
          importButton: Button {text:'Import Text'},\
        },\
          groupThree: Group{orientation:'row',\
          closeButton: Button{text:'Close'},\
        },\
      }";
  
      myPanel.grp = myPanel.add(res);
  
      // Default / Functionality
      myPanel.grp.groupOne.exportButton.onClick = function(){
        exportText();
      };

      myPanel.grp.groupTwo.importButton.onClick = function(){
        importText();
      };

      myPanel.grp.groupThree.closeButton.onClick = function(){
        myPanel.close();
      };
  
      myPanel.layout.layout(true);
      return myPanel;
    }
  
    var myScriptPal = myScript_buildUI(thisObj);
    if(myScriptPal != null && myScriptPal instanceof Window){
      myScriptPal.center();
      myScriptPal.show();
    }
  }
  
  myScript(this);
  
}

//////
// Function to export text to CSV
function exportText() {
  // Get the active project
  var project = app.project;

  // Check if a project is open
  if (project) {
    // Prompt the user to choose a location to save the CSV data
    var exportFile = File.saveDialog("Save CSV File", "Comma-separated Values:*.csv");

    // Check if the user canceled the dialog
    if (!exportFile) {
      alert("Export canceled by the user.");
    } else {
      exportFile.open("w");

      // Write CSV header
      exportFile.writeln("Composition,Layer Name,Text");

      // Loop through all compositions in the project
      for (var i = 1; i <= project.rootFolder.items.length; i++) {
        var item = project.rootFolder.items[i];

        // Check if the item is a composition
        if (item instanceof CompItem) {
          // Loop through all layers in the composition
          for (var j = 1; j <= item.numLayers; j++) {
            var layer = item.layer(j);

            // Check if the layer is a text layer
            if (layer instanceof TextLayer) {
              // Get the composition name, layer name, and text content
              var compositionName = item.name;
              var layerName = layer.name;
              var textContent = layer.text.sourceText.value.text;

              // Check if textContent is a string
              if (typeof textContent === "string") {
                // Replace commas with a different character to avoid CSV conflicts
                textContent = textContent.replace(/,/g, ";");

                // Write layer data to the CSV file without quotes around text
                exportFile.writeln(compositionName + "," + layerName + "," + textContent);
              } else {
                // If textContent is not a string, write an empty value to the CSV file
                exportFile.writeln(compositionName + "," + layerName + ",");
              }
            }
          }
        }
      }

      // Close the export file
      exportFile.close();
      alert("CSV export complete!\nFile saved to: " + exportFile.fsName);
    }
  } else {
    alert("Open a project to run this export script.");
  }
}

// Function to import text from CSV
function importText() {
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
          var layerName = data[1];
          var newText = data[2];

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
}

/*
// Function to create dockable panel
function createDockablePanel() {
  var scriptPanel = new Window("palette", "Text Export/Import");

  scriptPanel.orientation = "column";
  scriptPanel.alignChildren = ["center", "top"];

  var exportButton = scriptPanel.add("button", undefined, "Export Text");
  exportButton.onClick = exportText;

  var importButton = scriptPanel.add("button", undefined, "Import Text");
  importButton.onClick = importText;

  return scriptPanel;
}

// Try to create and show the dockable panel
try {
  var dockablePanel = createDockablePanel();
  dockablePanel.show();
} catch (e) {
  alert("Error creating the dockable panel: " + e.toString());
}
*/