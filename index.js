const express = require('express');
const app = express();
const { google } = require('googleapis');
require('dotenv').config(); // Load environment variables

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use('/images', express.static(__dirname + '/public/images/', {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.ico')) {
            res.set('Content-Type', 'image/x-icon');
        }
    }
}));


// Use environment variables
const sheetId = process.env.SHEET_ID;
const tabName = process.env.TAB_NAME;
const ipTabList = process.env.IP_TAB_LIST;
const range = process.env.RANGE;
const ipRange = process.env.IP_RANGE;

async function _getGoogleSheetClient() {
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure correct formatting of the private key
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
}

async function _readGoogleSheet(googleSheetClient, sheetId, tabName, range) {
    const res = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${tabName}!${range}`,
    });
    return res.data.values;
}

async function _writeGoogleSheet(googleSheetClient, sheetId, tabName, range, data) {
    await googleSheetClient.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${tabName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            "majorDimension": "ROWS",
            "values": data
        },
    })
}

async function getRowCount(googleSheetClient, sheetId, tabName, range) {
    const response = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${tabName}!${range}`,
    });

    const rows = response.data.values; // This gives you all the data in the range
    return rows ? rows.length : 0; // Count the number of rows, return 0 if no rows
}

app.get('/information/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const gSheetClient = await _getGoogleSheetClient();
        const sheetData = await _readGoogleSheet(gSheetClient, sheetId, tabName, range);
        const rowIndex = sheetData.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            return res.status(404).send('ID not found');
        }

        return res.send(sheetData[rowIndex]);
    } catch (error) {
        console.error('Error retrieving Google Sheet:', error);
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/iplist', async (req, res) => {
    try {
        const gSheetClient = await _getGoogleSheetClient();
        const sheetData = await _readGoogleSheet(gSheetClient, sheetId, ipTabList, ipRange);
        let result = []; // Declare result properly with `let`
        sheetData.forEach(element => {
            result.push(element[0]); 
        });
        return res.send(result);
    } catch (error) {
        console.error('Error retrieving Google Sheet:', error);
        return res.status(500).send('Internal Server Error');
    }
});

app.post('/iplist', async (req, res) => {
    const requestData = Object.values(req.body)
    const gSheetClient = await _getGoogleSheetClient()
    const formResult = requestData
    await _writeGoogleSheet(gSheetClient, sheetId, ipTabList, ipRange, [formResult])
    return res.send("")
});

app.post('/complete/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const gSheetClient = await _getGoogleSheetClient();
        const sheetData = await _readGoogleSheet(gSheetClient, sheetId, tabName, range);
        const rowIndex = sheetData.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            return res.status(404).send('ID not found');
        }
        
        sheetData[rowIndex][4] = "TRUE";

        await gSheetClient.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `${tabName}!A${rowIndex + 1}:F${rowIndex + 1}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [sheetData[rowIndex]],
            },
        });

        return res.send('Update successful');
    } catch (error) {
        console.error('Error updating Google Sheet:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/data', async (req, res) => {
    try {
        const gSheetClient = await _getGoogleSheetClient();
        const response = await _readGoogleSheet(gSheetClient, sheetId, tabName, range); // No need for `new Promise`

        let result = []; // Declare result properly with `let`
        response.forEach(element => {
            if (element[4] === 'FALSE') { // Use `===` for strict comparison
                result.push(element); // Use `push` instead of `append`
            }
        });

        res.send(result); // Send filtered result
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/create', async (req, res) => {
    const requestData = Object.values(req.body)
    const gSheetClient = await _getGoogleSheetClient()
    rowCount = await getRowCount(gSheetClient, sheetId, tabName, range)
    const formResult = [rowCount, requestData[0], requestData[1], requestData[3], 'FALSE', requestData[2]]
    await _writeGoogleSheet(gSheetClient, sheetId, tabName, range, [formResult])
    return res.send("")
});

app.get('/', async (req, res) => {
    res.render('home');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

module.exports = app;
