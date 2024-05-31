**LeetCode Participant Locator**
---------------------------------

**Overview**
--------

The LeetCode Participant Locator is a Chrome extension designed to help you easily find your position in the LeetCode contest list. This extension simplifies the process of locating and viewing other users' codes, enhancing your ability to analyze and learn from different solutions.

**What the Extension Solves**
--------------------------

When participating in LeetCode contests, finding your rank and viewing other users' solutions can be cumbersome. The LeetCode Participant Locator addresses this issue by providing a straightforward way to locate your position and explore other participants' codes without manually searching through the entire list.

**Features**
--------

- Quickly find your position in the contest list.
- Easily view other users' codes.
- Seamlessly integrates with LeetCode's contest page.
- Can find users up to standing 16k in any contest.

**Installation**
------------

To use the LeetCode Participant Locator extension, follow these steps:

**Clone the Repository**
---------------------

First, clone the repository to your local machine using the following command:

```bash
git clone https://github.com/yourusername/leetcode-participant-locator.git
```

**Load the Extension in Chrome**
----------------------------

1. Open Google Chrome and navigate to chrome://extensions/.
2. Enable "Developer mode" by toggling the switch in the top right corner.
3. Click on the "Load unpacked" button.
4. Select the directory where you cloned the repository.

The extension should now be loaded and ready to use.

**Usage**
-----


1. Activate the extension by clicking on the LeetCode Participant Locator icon in the Chrome toolbar.
2. Select the type and number of contest. Eg - Weekly 355.
3. On first use and every 5 hours thereafter, the extension will fetch and update the latest contest data. This initial load can take 2-3 minutes.
4. Enter a username, and the extension will provide the page number where the user can be found in the LeetCode contest standings.
5. View and analyze other users' codes directly from the contest page by editing the URL with the desired page Number and contest type.

Example:
```bash
# Open LeetCode contest ranking page for page no.5
# and weekly contest 398
https://leetcode.com/contest/weekly-contest-398/ranking/5/

# Open LeetCode contest ranking page for page no.51
# and Bi-weekly contest 112
https://leetcode.com/contest/Biweekly-contest-112/ranking/51/
```

**Contributing**
------------

We welcome contributions to improve the LeetCode Participant Locator. If you'd like to contribute, please fork the repository and submit a pull request with your changes.

**License**
-------

This project is licensed under the MIT License. See the LICENSE file for more details.

---

For any issues or feature requests, please open an issue on the GitHub repository: https://github.com/yourusername/leetcode-participant-locator

Happy Coding!
