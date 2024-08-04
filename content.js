//chrome.storage.local.get("Weekly399",function(result){console.log(result["Weekly399"])})
//chrome.storage.local.clear();

function getContestNumber() {
    const num = document.getElementById("Contest-Number").value;
    return num;
}
function getContestType() {
    const radios = document.getElementsByName("ContestType");
    for (const radio of radios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return null;
}

function removeExpiredData() {
    return new Promise((resolve, reject) => {
        const now = Date.now();
        console.log("checking....");
        chrome.storage.local.get(null, async (items) => {
            try {
                let flag=0;
                for (const key in items) {
                    if (items[key].expiry && items[key].expiry < now) {
                        await new Promise((resolve, reject) => {
                            chrome.storage.local.remove(key, () => {
                                if (chrome.runtime.lastError) {
                                    return reject(chrome.runtime.lastError);
                                }
                                flag=1;
                                console.log(`Data with key: ${key} has been removed due to expiry.`);
                                resolve();
                            });
                        });
                    }
                }
                if (flag) resolve(1);
                else resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
}

function getLocalStorageData(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve(result[key]);
        });
    });
}
async function searchUser(username, contest_type, contestNumber) {
    const key = `${contest_type}${contestNumber}`;
    let text = await getLocalStorageData(key);
    
    if (!text) return 0;
    text = text.value;
    let obj = JSON.parse(text);
    const user = obj.find(pair => pair.username === username);
    return user || null;
}
chrome.runtime.onMessage.addListener((request) => {
    if (request.className) {
        const displayError = document.getElementById(request.className);
        displayError.textContent = `Error fetching data: ${error.message}`;
    }
});

const baseUrl = 'https://leetcode.com/contest/api/ranking/';

document.addEventListener('DOMContentLoaded', async function () {
    const fetchDataBtn = document.getElementById('fetchDataBtn');
    const resultDiv = document.getElementById('result');
    const searchBtn = document.getElementById('searchBtn');
    const usernameInput = document.getElementById('usernameInput');
    const displayError = document.getElementById('error');

    fetchDataBtn.addEventListener('click', async function () {
        fetchDataBtn.disabled = true;
        try {
            const contest_type  =  getContestType();
            const contestNumber =  getContestNumber();

            if(!contestNumber){
                displayError.textContent = "Invalid contest number";
                return;
            }

            const url = `${baseUrl}${contest_type}-contest-${contestNumber}/`;

            displayError.textContent = "Loading...It may take 2-3 mins for the first-time data load. Mean while you can switch to another tab.";
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept-Language': 'en-US,en;q=0.8',
                    'content-type': 'application/json',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                displayError.textContent = "Contest Not Found";
                return;
            }

            await removeExpiredData();
            
            let text = await getLocalStorageData(`${contest_type}${contestNumber}`);
            console.log(text);
            if(!text){
                chrome.runtime.sendMessage({ action: 'fetchAllData', contest_type, contestNumber }, response => {
                    if (response.status === 'Data loaded successfully') {
                        displayError.textContent = response.status;
                    } else if(response.status === 'Error fetching data. Network issue'){
                        displayError.textContent = response.status;
                    } else {
                        displayError.textContent = response.status;
                    }
                });
            }else{
                displayError.textContent = "Data loaded successfully";
            }
        } catch (error) {
            console.log('Error fetching data. Network issue');
            displayError.textContent = `Error fetching data: ${error.message}`;
        } finally {
            fetchDataBtn.disabled = false;
        }
    });

    searchBtn.addEventListener('click', async function () {
        const contest_type = getContestType();
        const contestNumber = getContestNumber();
        const username = usernameInput.value.trim();
        if (!username) {
            resultDiv.textContent = 'Please enter a username.';
            return;
        }
        const isremoved = await removeExpiredData();
        
        let User = await searchUser(username, contest_type, contestNumber);
        if (User == null) {
            resultDiv.textContent = 'User not found';
        } else if (User == 0) {
            if(isremoved) resultDiv.textContent = 'Previous data load Expired. Please load again';
            else resultDiv.textContent = 'Please load the data first';
        } else {
            let pos;
            if (User.rank == 1) pos = "st";
            else if (User.rank == 2) pos = "nd";
            else if (User.rank == 3) pos = "rd";
            else pos = "th";
            
            let pageNumber = Math.ceil((User.rank) / 25);
            resultDiv.innerHTML = `Username: ${User.username}<br>Standing: ${User.rank}${pos}<br> You can find user on Pg-${pageNumber}`;
        }
    });

});
