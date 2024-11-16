const axios = require('axios');

require('dotenv').config();

const fetchData = async () => {
  const jsonBody = {
    attestationType:
      '0x44617461736574496e666f417069000000000000000000000000000000000000',
    sourceId:
      '0x5745423200000000000000000000000000000000000000000000000000000000',
    messageIntegrityCode:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    requestBody: {
      url: 'https://api.freeapi.app/api/v1/public/randomusers/user/random',
      abi_signature:
        '{"struct DataContribution":{"id":"bytes32","contributor":"address","datasetId":"bytes32","dataHash":"bytes32","contributionAmount":"uint256","variance":"uint256"},"struct DatasetInfo":{"id":"bytes32","dataContributions":"DataContribution[]"}}',
    },
  };

  const response = await axios
    .post('http://localhost:8000/IDatasetInfoApi/prepareResponse', jsonBody, {
      headers: {
        'X-Api-Key': '12345',
        'Content-Type': 'application/json',
      },
    })
    .catch((e) => console.log(e));

  return response.data;
};

async function main() {
  console.log(await fetchData());
}

main();
