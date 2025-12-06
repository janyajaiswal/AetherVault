import axios from "axios";

const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwYTkzMThjNi0zNTM4LTQ0NzQtODk5NC05ZWFiOTUyNmZlNjUiLCJlbWFpbCI6ImphaXN3YWxqYW55YUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTFhMzBjZDNiYThjMTVjMjYzMTMiLCJzY29wZWRLZXlTZWNyZXQiOiI0MmJhMzJkMThiOTVjZDk5NDY0OWQ2MWE1MWZiNWZmZWE0NmMwZmMwMDU4MGVlMDJjNWM4NDcxMGVjOWYwY2UxIiwiZXhwIjoxNzk2NDI5Mzc2fQ.Qop4a0fVaTq9giEbdFg6kha9-8mK9jui3ge7q-w-IJk";

const key = "11a30cd3ba8c15c26313";
const secret = "42ba32d18b95cd994649d61a51fb5ffea46c0fc00580ee02c5c84710ec9f0ce1";

export const uploadJSONToIPFS = async(JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    
    try {
        const response = await axios.post(url, JSONBody, {
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': key,
                'pinata_secret_api_key': secret,
            }
        });
        
        return {
            success: true,
            pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
        };
    } catch (error) {
        console.log("Error uploading JSON to IPFS:", error.response?.data || error.message);
        return {
            success: false,
            message: error.message,
        };
    }
};

export const uploadFileToIPFS = async(file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    
    // Use native browser FormData (not the npm package)
    let data = new FormData();
    data.append('file', file);

    const metadata = JSON.stringify({
        name: file.name,
    });
    data.append('pinataMetadata', metadata);

    try {
        const response = await axios.post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'pinata_api_key': key,
                'pinata_secret_api_key': secret,
            }
        });
        
        console.log("Image uploaded to IPFS:", response.data.IpfsHash);
        return {
            success: true,
            pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
        };
    } catch (error) {
        console.error("Error uploading file to IPFS:");
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        console.error("Headers sent:", { key, secret: secret.substring(0, 10) + '...' });
        return {
            success: false,
            message: error.response?.data?.error || error.message,
        };
    }
};

