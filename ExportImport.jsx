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

  function exportText() {
    var project = app.project;

    if (project) {
      var exportFile = File.saveDialog("Save CSV File", "Comma-separated Values:*.csv");

      if (!exportFile) {
        alert("Export canceled by the user.");
      } else {
        exportFile.open("w");

        exportFile.writeln("Composition,Layer Name,Text");

        function collectTextFromCompositions(comp) {
          for (var i = 1; i <= comp.layers.length; i++) {
            var layer = comp.layers[i];
            if (layer instanceof TextLayer) {
              var compositionName = comp.name;
              var layerName = layer.name;
              var textContent = layer.text.sourceText.value.text;

              if (typeof textContent === "string") {
                // Replace line breaks with a placeholder
                textContent = textContent.replace(/\r?\n/g, "\\n");

                exportFile.writeln(compositionName + "," + layerName + ',"' + textContent + '"');
              } else {
                exportFile.writeln(compositionName + "," + layerName + ",");
              }
            } else if (layer instanceof AVLayer && layer.source instanceof CompItem) {
              collectTextFromCompositions(layer.source);
            }
          }
        }

        for (var i = 1; i <= project.rootFolder.items.length; i++) {
          var item = project.rootFolder.items[i];
          if (item instanceof CompItem) {
            collectTextFromCompositions(item);
          }
        }

        exportFile.close();
        alert("CSV export complete!\nFile saved to: " + exportFile.fsName);
      }
    } else {
      alert("Open a project to run this export script.");
    }
  }

  function importText() {
    var comp = app.project.activeItem;

    if (comp && comp instanceof CompItem) {
      var importFile = File.openDialog("Import CSV File", "Comma-separated Values:*.csv");

      if (!importFile) {
        alert("Import canceled by the user.");
      } else {
        importFile.open("r");

        importFile.readln(); // Skip the header line

        while (!importFile.eof) {
          var line = importFile.readln();
          if (line !== "") {
            var data = line.split(",");
            var layerName = data[1];
            var newText = data[2];

            var textLayer = comp.layer(layerName);

            if (textLayer instanceof TextLayer) {
              // Replace the placeholder with line breaks
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
