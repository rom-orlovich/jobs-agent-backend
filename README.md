# Jobs Agent Backend:

- **Link to my app's UI overview**: :point_left: 
- **Link to my app's code overview**: :point_left:

## About my project:
The Jobs Agent is a web application designed to help job seekers efficiently search for their next job across multiple online sources that provide job listings. 
Traditional job searches can be time-consuming and involve sifting through hundreds of irrelevant job listings. 

The Jobs Agent addresses this issue by allowing users to fill out their profiles with relevant search queries and using them to scan various job listing sites 
to retrieve all relevant job listings in one place.
The system enables users to filter job listings that match their requirements, making the job search process more streamlined and efficient.

This repository contains the backend part of the project, which is responsible for the logic behind job scanning and matching.



## Main Features:
- **Job Listings from Multiple Sites** - The Jobs Agent app scans many job listing sites for new job postings, including Linkedin, GotFriends, Drushim, and AllJobs.
- **Smart Job Filtering** - The app includes a requirements reader algorithm that scans job titles and text to filter out jobs that don't match the user's search criteria, and to provide a reason for each job that doesn't fit the user's profile.
- **Universal Database** - All jobs are saved in a MongoDB database that is shared among all users of the app, so that users can search for existing jobs with the same query hash and receive results more quickly.
- **CSV Export** -  Users can export all jobs related to a specific query hash to a CSV file for easy analysis and sharing.


## Main components:

### User:
A instance of user manage the the following data:

#### User Profile: 
For the first time the user uses the app he create his own unqiue profile that include the follow by these paramters:
- His overall years experince - what is the max year experince he want to disqualify a job.  
- His jobs requirements - which domains he wants to incluede in each job post.
- His exclueded requirement -  A list of domains that he doesn't want to include in the jobs post.

#### User query:
The user fills a search query that its paramters can be shared by other users queries.
These search parameters are hashed uniquely together to locate similar previous queries of other users that relate to spespifc jobs.
 
### Scanner:
A instance of scrapper that scanning the content of the jobs listing sites.
Each scanner is composed of an instance of GeneralQuery that calculates the scanner parameters from the site filters,
and includes methods for fetching jobs, mapping them to objects, and saving them in the database. 
The parameters of all the scanners are normalized together by using their similar parameters to create a shared search process. 
Each scanner works asynchronously to efficiently gather job listings from multiple sources.

### Translateor:
The scanner uses Google Translate API to translate Hebrew text into English. 
This helps to overcome the challenges posed by the many inflections and nuances of the Hebrew language.

### Requirements Reader:
After retrieving the data from the database, the requirements reader algorithm scans the 
job titles and descriptions to determine their suitability for the user. 
The algorithm first disqualifies jobs that violate the user's overall experience, including any excluded keywords. 
Then, it checks if the job includes any of the keywords specified in the user's search requirements. 
Finally, the algorithm verifies that there are no year ranges or digits in the text that fall outside the minimum and maximum values specified by the user.
If a job fails any of these checks, it is disqualified from matching. 
Otherwise, it is considered a potential match for the user's job search requirements.

### Server:
Helps to response the user reqeust and active the scanner, the jobs filter and downloads the jobs csv file.  

### Universal Database with hash system:
To address issues with redundant job documents, scanning efficiency, and data quality,
I implemented a universal database that is shared by all users while maintaining the ability for users to find their matching jobs.

Rather than saving jobs for each user's profile, the universal database saves jobs for everyone with the same query to save on storage costs. 
Each time a user makes a new query, it is hashed by its parameters,
and the hash is inserted into a list of hashQueries that includes all previous queries with the same jobs.

This approach reduces the need to activate new scanners and increases efficiency for users executing the same query.
Additionally, the matching mechanism is performed outside of the database, allowing the job document content to remain unchanged, 
so other users can also use the same jobs.

After the two-day mark, the same query may bring new jobs as a new scanner will be activated if there are a low number of jobs for that particular query. 
This ensures that the data is kept fresh and up to date.




## How it works:

### **Scanning:** 
When a user makes a new query for a job search, the scanner check the number of current jobs the exist with the same hash.
If there are fewer than spseifc number of jobs with that hash in DB, the scanner starts to scan various job listing sites to gather new job postings, retrieve their details, 
and save them to the MongoDB database with the new hash for future similar queries. If there are already more than spsefic 
jobs with the same hash, the scanner skips the scanning process and updates the user's profile with existing job postings for that hash.

### **Job Matching:**
Users can also request a list of jobs that fit their search parameters and display them in the client-side application.
Each time the user makes a GET request for job listings, the server fetches the jobs from the MongoDB database using the current active hash of the user.
The jobs are then processed by my requirements reader algorithm, 
which scans the job titles and descriptions and inserts a reason field into each job that tells the user why the job does not match their requirements.
If a job does match their requirements, the reason field is set to "match".
This proccess help the user on the client identify which job is fit to him.


## Technologies:

- [Node](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Docker](): Containerize the app and deploy into Digtal Ocean cloud. 
- [MongoDB](): A NoSQL database that is used to store job listings and user data.


## Packages:

- [Express] (https://www.npmjs.com/package/express) -A web framework for Node.js that is used to create the backend API.
- [Puppeteer]() -  For scraping the jobs date listings from various websites.
- [Cheerio]() - For parsing the HTML as result of http request and extracting job listing data.
- [Axios]() - A promise-based HTTP client for the browser and Node.js, which is used to make HTTP requests to various job listing sites.
- [json-2-csv]() - A Node.js package for converting JSON data to CSV format, which is used to generate the CSV export file.
- [throat](https://www.npmjs.com/package/throat) - A concurrency limiter for Node.js that is used to control the number of concurrent requests made to job listing sites.
- [Jest]() - A JavaScript testing framework that is used to write unit and integration tests for the app.
  
  
## Installation

1. **Clone the repo**
   ```
   git clone git@github.com:rom-orlovich/jobs-agent-backend.git
   ```
2. **Install all the dependencies**
   ```
   npm run ci
   ```
   
3. **Create .env and your mongoDB URI into it**
   ```
   MONGO_DB_URI= <Your URI>
   ```
   
4. **Run Server**

   ```
   npm run start
   ```

5. **Go to http://localhost:5000 and have fun**!


## Running Docker:

1. **Clone the repo**
   ```
   git clone git@github.com:rom-orlovich/jobs-agent-backend.git
   ```
2. **Run build command**
   ```
   docker build -t jobs-agent-backend .
   ```
   
3. **Create .env and your mongoDB URI into it**
   ```
   MONGO_DB_URI= <Your URI>
   ```
4. **Run the Docker container with the .env file**
   ```
   docker run --env-file .env -p 5000:5000 -d jobs-agent-backend
   ```

## What's next?:



## Images:

### Home Page

<img alt="Home page" src="./readme-images/home-page.png" width="600" hight="600">

### Search Posts

<img alt="Autocomplete suggesting" src="./readme-images/autocomplete-suggesting.png" width="600" hight="600">
<img alt="Search results" src="./readme-images/search-results.png" width="600" hight="600">

### Mobile Display

<img alt="Mobile display" src="./readme-images/mobile.png" width="600" hight="600">
<img alt="Mobile sideBar" src="./readme-images/mobile-sideBar.png" width="600" hight="600">

### App's Tests

<img alt="Feed test" src="./readme-images/feed-test.png" width="600" hight="600">
<img alt="Search input tests" src="./readme-images/search-input-tests.png" width="600" hight="600">
<img alt="Tests coverage" src="./readme-images/tests-coverage.png" width="600" hight="600">
