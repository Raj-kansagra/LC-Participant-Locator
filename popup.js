const baseUrl = 'https://leetcode.com/contest/api/ranking/';
const pagination = 650;
const batchSize = 7;
const maxRetries = 4;
const initialBackoffTime = 1000;
let endofpage = 0;
let isFetchingData = false; // Flag to check if fetchAllData is running
let terminate = 0;

async function fetchData(url) {
    let retryCount = 0;
    let backoffTime = initialBackoffTime;

    while (retryCount < maxRetries) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Accept-Language': 'en-US,en;q=0.8',
                    'content-type': 'application/json',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                if(response.status == 503){
                    return [];
                }
                console.log(`Rate limited - ${backoffTime / 1000}s`, 'HTTP-Error: ' + response.status);
                await sleep(backoffTime);
                backoffTime += 500;
                retryCount++;
                continue;
            }

            const data = await response.json();
            if (data.total_rank.length == 0) {
                endofpage = 1;
                return [{rank : "Not in this universe", username : "@@"}];
            }

            if (Array.isArray(data.total_rank) && data.total_rank.length > 0) {
                const pairs = data.total_rank.map(item => ({
                    rank: item.rank,
                    username: item.username
                }));
                return pairs;

            } else {
                console.log(`No total_rank data available or it is not in expected format for ${url}`);
                return [];
            }
        } catch (error) {
            console.log(`Error fetching data. Network issue`);
            return [];
        }
    }
    return [];
}
let isFetching_contest_type,isFetching_contestNumber;

async function fetchAllData(contest_type, contestNumber) {
    isFetching_contest_type = contest_type;
    isFetching_contestNumber = contestNumber;

    isFetchingData = true;
    let allPairs = [];
    let promises = [];
    endofpage=0;terminate=0;
    for (let page = 1; page <= pagination; page++) {
        const url = `${baseUrl}${contest_type}-contest-${contestNumber}/?pagination=${page}`;
        
        if (endofpage == 1) break;
        promises.push(fetchData(url));
        
        if (promises.length >= batchSize || page === pagination) {
            try {
                
                const results = await Promise.all(promises);
                results.forEach(pairs => {
                    if(pairs.length==0){
                        console.log('Error fetching data. Network issue');
                        sendClassNameToContent('error');
                        terminate=1;
                        allPairs=[];
                        return;
                    }
                    allPairs.push(...pairs);
                });
                
                promises = [];
                console.log(`Fetched data for pages ${page - batchSize + 1} to ${page}`);
                
                await sleep(250);
                
            } catch (error) {
                console.log('Error in Promise.all:', error);
                promises = [];
            }
        }
        if(terminate==1) break;
    }
    try {
        if(terminate!=1){
            const myJSON = JSON.stringify(allPairs);
            storeDataWithExpiry(`${contest_type}${contestNumber}`, myJSON);
        }
    } catch (error) {
        console.log("Error in storing file in local storage", error);
    } finally {
        isFetchingData = false;
        if(terminate==1) return;
    }
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function storeDataWithExpiry(key, value) {
    const now = Date.now();
    const expiryTime = now + 7 * 1000; // 5 hours in milliseconds
    const data = {
        value: value,
        expiry: expiryTime
    };
    chrome.storage.local.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) {
            console.log('Error storing data:', chrome.runtime.lastError.message);
        } else {
            console.log(`Data stored with key: ${key} and will expire in 5 hours.`);
        }
    });
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchAllData') {
        if (isFetchingData) {
            sendResponse({ status: `It may take 2-3 mins to load ${isFetching_contest_type}-Contest ${isFetching_contestNumber}. Mean while you can switch to another tab.` });
        } else {
            fetchAllData(request.contest_type, request.contestNumber).then(() => {
                if(terminate==1) sendResponse({ status: 'Error fetching data. Network issue' });
                else sendResponse({ status: 'Data loaded successfully' });
            })
        }
        return true;
    }
});

function sendClassNameToContent(className) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { className: className });
        }
    });
}
