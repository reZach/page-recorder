# Page Recorder Extension
![](./README%20images/Menu%20icon.png)

# Installation
1. Clone the repo 

`git clone https://github.com/reZach/page-recorder.git`

2. Open up Chrome
3. Run `npm run build`
4. Navigate to **chrome://extensions/**
5. Flick on Developer mode (top right corner)
6. Click **Load unpacked** (top left corner), select the `build` folder that was created after doing step 3
6. Enable the extension by toggling it. Click the refresh button to load the extension

![](./README%20images/Extension%20card.png)

# Usage
1. Navigate to any webpage
2. Click on the extension's icon and click "Clear" to clear any previously selected elements
3. Begin navigating through any website
4. When you are finished navigating pages on the website, click the extension's icon again and click "Save" to download a file of the user-clicked elements

# Development
1. Make changes to the repo
2. Reload the extension as in step 6 of **Installation**
3. Notice your changes that took place
4. If you need to debug the background thread, click this link

![](./README%20images/Debug%20background%20thread.png)
