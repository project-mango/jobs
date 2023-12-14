const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadResume(fileUrl, downloadFolder) {
    const fileName = path.basename(fileUrl);
    const localFilePath = path.resolve(downloadFolder, fileName);

    try {
        const response = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream',
        });

        const writer = response.data.pipe(fs.createWriteStream(localFilePath));
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        return localFilePath;
    } catch (error) {
        console.error("Error downloading the resume:", error);
        throw error;
    }
}

export default downloadResume;
