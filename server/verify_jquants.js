const axios = require('axios');

const API_KEY = process.argv[2];

if (!API_KEY) {
    console.error('Please provide an API Key as an argument.');
    process.exit(1);
}

async function verifyJQuantsV2() {
    try {
        console.log('Testing J-Quants V2 API with API Key...');

        // V2 Endpoint for daily quotes
        // https://api.jquants.com/v2/equities/bars/daily
        const response = await axios.get('https://api.jquants.com/v2/equities/bars/daily', {
            headers: {
                'x-api-key': API_KEY
            },
            params: {
                code: '7203', // Toyota
                // date: '20230101' // Optional, if omitted it might return range or latest?
                // V2 docs say code or date is required. 
                // Let's try getting recent data by not specifying date (if allowed) or specifying a recent range.
                // Or just code. 
            }
        });

        console.log('Success! API responded.');
        // console.log(JSON.stringify(response.data, null, 2));

        const data = response.data;
        if (data && data.data && data.data.length > 0) {
            const latest = data.data[data.data.length - 1];
            console.log('Latest Data:', latest);
        } else {
            console.log('Response received but no data found (market might be closed or premium only?):', data);
        }

    } catch (error) {
        console.error('Error during V2 verification:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

verifyJQuantsV2();
