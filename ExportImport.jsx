function myScript(thisObj) {
  function myScript_buildUI(thisObj) {
    var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "ExportImport", undefined, {resizable: true, closeButton: false});

    var res = "group{orientation:'column',\
          groupOne: Group{orientation:'row',\
          exportButton: Button{text:'Export Text'},\
          exportOptions: Checkbox{text:'Current Composition Only', value:true},\
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
    myPanel.grp.groupOne.exportButton.onClick = function () {
      exportText(!myPanel.grp.groupOne.exportOptions.value); // Invert the checkbox value
    };

    myPanel.grp.groupTwo.importButton.onClick = function () {
      importText();
    };

    myPanel.grp.groupThree.closeButton.onClick = function () {
      myPanel.close();
    };

    myPanel.layout.layout(true);
    return myPanel;
  }

  function exportText(exportWholeProject) {
    var project = app.project;

    if (project) {
      var exportFile = File.saveDialog("Save CSV File", "Tab-separated Values:*.tsv");

      if (!exportFile) {
        alert("Export canceled by the user.");
      } else {
        exportFile.open("w");

        // Use tabs as delimiters
        exportFile.writeln("Composition\tLayer Name\tText");

        function collectTextFromCompositions(comp) {
          for (var i = 1; i <= comp.layers.length; i++) {
            var layer = comp.layers[i];
            if (layer instanceof TextLayer) {
              var compositionName = comp.name;
              var layerName = layer.name;
              var textContent = layer.text.sourceText.value.text;

              if (typeof textContent === "string") {
                textContent = textContent.replace(/\r?\n/g, "\\n");
                // Use tabs as delimiters
                exportFile.writeln(compositionName + "\t" + layerName + "\t" + textContent);
              } else {
                // Use tabs as delimiters
                exportFile.writeln(compositionName + "\t" + layerName + "\t");
              }
            } else if (exportWholeProject && layer instanceof AVLayer && layer.source instanceof CompItem) {
              collectTextFromCompositions(layer.source);
            }
          }
        }

        if (exportWholeProject) {
          for (var i = 1; i <= project.rootFolder.items.length; i++) {
            var item = project.rootFolder.items[i];
            if (item instanceof CompItem) {
              collectTextFromCompositions(item);
            }
          }
        } else {
          // Export from the active composition only
          var activeComp = app.project.activeItem;
          if (activeComp instanceof CompItem) {
            collectTextFromCompositions(activeComp);
          }
        }

        exportFile.close();
        alert("TSV export complete!\nFile saved to: " + exportFile.fsName);
      }
    } else {
      alert("Open a project to run this export script.");
    }
  }

  function importText() {
    var comp = app.project.activeItem;

    if (comp && comp instanceof CompItem) {
      var importFile = File.openDialog("Import TSV File", "Tab-separated Values:*.tsv");

      if (!importFile) {
        alert("Import canceled by the user.");
      } else {
        importFile.open("r");

        importFile.readln(); // Skip the header line

        while (!importFile.eof) {
          var line = importFile.readln();
          if (line !== "") {
            // Use tabs as delimiters
            var data = line.split("\t");
            var layerName = data[1];
            var newText = data[2];

            var textLayer = comp.layer(layerName);

            if (textLayer instanceof TextLayer) {
              newText = newText.replace(/\\n/g, "\r\n");
              textLayer.text.sourceText.setValue(newText);
            }
          }
        }

        importFile.close();
        alert("Text replacement complete!\nFile imported from: " + importFile.fsName);
      }
    } else {
      alert("Open a composition to run this import script.");
    }
  }

  var myScriptPal = myScript_buildUI(thisObj);
  if (myScriptPal != null && myScriptPal instanceof Window) {
    myScriptPal.center();
    myScriptPal.show();
  }
}

myScript(this);