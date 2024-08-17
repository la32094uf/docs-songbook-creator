function createSongBook() {
  const docId = 'YOUR-GOOGLE-DOC-ID'; // Replace this with your Google Document ID
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();

  // Clear the existing content in the document
  body.clear();

  // Collect the rows that meet the criteria
  const rows = data.filter(row => row[2] && row[2].toLowerCase() === 'yes')
                   .map(row => ({
                     heading: row[0] ? row[0].trim() : '', // Trim leading/trailing spaces
                     text: row[1] ? row[1].trim() : '', // Trim leading/trailing spaces
                     isBroad: row[3] && row[3].toLowerCase() === 'broad',
                     isLong: row[4] && row[4].toString().trim().toLowerCase() === 'long',
                     isNewPage: row[10] && row[10].toString().trim().toLowerCase() === 'new page'
                     
                   }));

  // Add a separate table for each row
  for (let i = 0; i < rows.length; i++) {
    const { heading, text, isBroad, isLong, isNewPage } = rows[i];
    Logger.log(`Processing row ${i}: heading="${heading}", isLong=${isLong}, isNewPage="${isNewPage}"`);

    // Check if the next row is also long
    const nextRowIsLong = (i + 1 < rows.length) && rows[i + 1].isLong;

    // Calculate the number of lines in the text
    const lineCount = text.split('\n').length;

    if(isNewPage){
      Logger.log("New Page!!");
      body.appendPageBreak();
    }

    if (isLong) {
      if (lineCount > 35) {
        body.appendPageBreak(); // Add a page break
       // body.appendParagraph(" ");
      } else{

        if (!isNewPage){

        body.appendHorizontalRule();
        }
      }

      const table = body.appendTable();
      
      // Add a row for the heading
      const headingRow = table.appendTableRow();
      const headingCell = headingRow.appendTableCell();
      headingCell.appendParagraph(heading).setHeading(DocumentApp.ParagraphHeading.HEADING1);
      headingRow.appendTableCell();
      // Add a row for the left and right cells
      const row = table.appendTableRow();
      const leftCell = row.appendTableCell();
      const rightCell = row.appendTableCell();

      // Split the text into lines and determine the middle line
      const lines = text.split('\n');
      const mid = Math.floor(lines.length / 2);
      const leftText = lines.slice(0, mid).join('\n').trim();
      const rightText = lines.slice(mid).join('\n').trim();

      if (leftText) {
        leftCell.appendParagraph(leftText);
      }
      if (rightText) {
        rightCell.appendParagraph(rightText);
      }

      if (!nextRowIsLong) {
        // Add a blank line if no long text follows
        //body.appendParagraph('');
      }

    } else if (isBroad) {
      if (lineCount > 35) {
        body.appendPageBreak(); // Add a page break
       // body.appendParagraph(" ");
      } else {

        if (!isNewPage){

        body.appendHorizontalRule();
        }

      }

      const table = body.appendTable();
      const row = table.appendTableRow();
      const cell = row.appendTableCell();

      if (heading) {
        cell.appendParagraph(heading).setHeading(DocumentApp.ParagraphHeading.HEADING1);
      }
      if (text) {
        cell.appendParagraph(text);
      }

    } else {
      if (lineCount > 35) {
        body.appendPageBreak(); // Add a page break
      } else {
        if (!isNewPage){

        body.appendHorizontalRule();
        }

      }

      const table = body.appendTable();
      const row = table.appendTableRow();
      const leftCell = row.appendTableCell();
      const rightCell = row.appendTableCell();

      if (heading) {
        leftCell.appendParagraph(heading).setHeading(DocumentApp.ParagraphHeading.HEADING1);
      }
      if (text) {
        leftCell.appendParagraph(text);
      }

      if (i + 1 < rows.length) {
        const next = rows[i + 1];
        if (next.heading) {
          rightCell.appendParagraph(next.heading).setHeading(DocumentApp.ParagraphHeading.HEADING1);
        }
        if (next.text) {
          rightCell.appendParagraph(next.text);
        }
        i++; // Increment index after adding the right cell
      } else {
        rightCell.setText(''); // Add an empty right cell if there is no next row
      }
    }
  }

  // Remove empty paragraphs above headings in tables
//  removeEmptyParagraphsAboveHeadingsInTables(docId);
  hideTableBorders(docId);
  removeMarginsFromTables(docId);
  removeEmptyParagraphInAllCellsOfAllTables(docId);
  deleteTopLevelElementBeforeHorizontalRule(docId);
  //removeEmptyParagraphBeforeTablePreserveHorizontalRules(docId);
}

function removeEmptyParagraphInAllCellsOfAllTables(docId) {
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();
  const tables = findAllTables(body);

  tables.forEach((table, tableIndex) => {
    const numRows = table.getNumRows();
    
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const row = table.getRow(rowIndex);
      const numCells = row.getNumCells();
      
      for (let cellIndex = 0; cellIndex < numCells; cellIndex++) {
        const cell = row.getCell(cellIndex);
        
        if (cell.getNumChildren() > 0) {
          const firstChild = cell.getChild(0);
          if (firstChild.getType() === DocumentApp.ElementType.PARAGRAPH) {
            if (isEmptyParagraph(firstChild)) {
              Logger.log(`Removing empty paragraph in cell (${rowIndex + 1}, ${cellIndex + 1}) of table ${tableIndex + 1}.`);
              cell.removeChild(firstChild);
            } else {
              Logger.log(`First paragraph in cell (${rowIndex + 1}, ${cellIndex + 1}) of table ${tableIndex + 1} is not empty.`);
            }
          } else {
            Logger.log(`First child in cell (${rowIndex + 1}, ${cellIndex + 1}) of table ${tableIndex + 1} is not a paragraph.`);
          }
        } else {
          Logger.log(`Cell (${rowIndex + 1}, ${cellIndex + 1}) in table ${tableIndex + 1} is empty.`);
        }
      }
    }
  });
}

function findAllTables(container) {
  const tables = [];
  for (let i = 0; i < container.getNumChildren(); i++) {
    const child = container.getChild(i);
    if (child.getType() === DocumentApp.ElementType.TABLE) {
      tables.push(child);
    } else if (child.getNumChildren) {
      // Recursively search for tables in nested elements
      tables.push(...findAllTables(child));
    }
  }
  return tables;
}

function isEmptyParagraph(paragraph) {
  const text = paragraph.getText();
  return text.trim().length === 0;
}

/////

function deleteTopLevelElementBeforeHorizontalRule(docId) {
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();
  let totalElements = body.getNumChildren();  // Use let here

  Logger.log('Total top-level elements in the document: ' + totalElements);

  // Iterate through each top-level element from the beginning to the end
  for (let i = 0; i < totalElements; i++) {
    const element = body.getChild(i);
    Logger.log('Checking top-level element at index ' + i + ' of type: ' + element.getType());

    // Check if the next element exists and contains a horizontal rule
    if (i + 1 < totalElements) {
      const nextElement = body.getChild(i + 1);
      Logger.log('Next element at index ' + (i + 1) + ' is of type: ' + nextElement.getType());

      if (containsHorizontalRule(nextElement)) {
        if (element.getType() !== DocumentApp.ElementType.PAGE_BREAK) {
          Logger.log('Deleting top-level element at index ' + i + ' because the next element contains a horizontal rule.');
          body.removeChild(element);

          // Adjust the index and total number of elements after removal
          i--;  // Move index back to recheck the new element at the same position
          totalElements--;  // Decrease the count of total elements
        } else {
          Logger.log('Skipping deletion of page break at index ' + i);
        }
      }
    }
  }
}

function containsHorizontalRule(element) {
  if (element.getNumChildren) {
    for (let i = 0; i < element.getNumChildren(); i++) {
      const child = element.getChild(i);
      if (child.getType() === DocumentApp.ElementType.HORIZONTAL_RULE) {
        return true;
      }
    }
  }
 
