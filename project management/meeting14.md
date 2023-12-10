Meeting: [10/7/2023 @ 5:30 PM; Days until Sprint # is due: 17 ]
-----
Summary:
Max- coded but ran into issues with setting up the service files for the transition to environment variables
Michael- user authentication still being worked on (token creation (should be done by monday) / management); interceptor / middleware will be worked on once done (will be worked on throughtout the week)
Angel- Working on his old components to the new standard made with Kenry and Kevin (angular material focus then bootstrap grid after) 
Kenry- Working on converting input fields and buttons to angular material form to make sure they work in future sprints; will work on making other pages with bootstrap; has not started the research for the chart/graph api for the generation
Kevin- Made some css components with Kenry to set up so all pages can reuse the css styling; working on cards that work for other portions, studying up on bootstrap stuff 
Karen- working on sendbird (frontend chat application); working on connecting the frontend to sendbird so that the frontend gets the messages; working on Karen's github repo and add it in a branch; been looking into user creation with sendbird from main app (fitness app)
Katherine- working on sendbird (frontend chat application); working on connecting the frontend to sendbird so that the frontend gets the messages; working on Karen's github repo and add it in a branch

**Code review list:**
Max- issue with validation of creation function on service page compared to raw html on the component itself
Michael- (Theoretical; what is on the repo): what is pushed is what is working; uses mongoose function to check duplicate users, else save data; similar to token creation; will replace code with JWT code so it can authenticate user and create a token with the payload, signature, expiration time (reusable so user can input data and for security); middleware for verification/interception
Angel- changing all elements to use mat form field and angular materials for consistency; tedious (must change everything from label to mat label without breaking things); typescript changes to utilize NgOnInit and got rid of refresh page
Kenry- changing all elements to use mat form field and angular materials for consistency; tedious (must change everything from label to mat label without breaking things); typescript changes to utilize NgOnInit and got rid of refresh page
Kevin- changing all elements to use mat form field and angular materials for consistency; tedious (must change everything from label to mat label without breaking things); typescript changes to utilize NgOnInit and got rid of refresh page
Karen- will copy-and-paste to merge over stuff (need to cover dependencies between senior project and chat github)
Katherine- chat-frontend not finished yet, but channels from SendBird (all backend features included (chat history)) are working; will try to implement the branch onto senior project repo 
-----
Max
-looking into basic node environment variables to see if we need it (still not sure yet)
-setting up frontend files to prepare for the environment files change on workouts
-Some frontend issues with angular materials are making some values not  consistent with what they are (numbers are being resorted as undefined | null in typescript)
Michael
What did you do yesterday? 
Yesterday I spent time working on token creation as well as researching middleware/interceptors
What will you do today?
-Today I was going to finish most or all of token creation and get started on working on middleware.
What is blocking your progress? 
-Proper implementation of the tokens and how they would work with the interceptor
Angel
What did you do yesterday? 
-Yesterday, I changed some html to utilize angular material.
What will you do today?
-Today I will continue changing raw html elements to utilize angular material with Kevin and Kenry., also I will change some unfinished typescript files so that there are actual form groups and make the submit buttons work.
What is blocking your progress? 
-The thing currently blocking my progress is studying for other classes. 
Kenry
I worked on converting the parts in login/registration/initial goal pages to use Angular Material components
I will start creating other pages using Bootstrap
No obstacle so far
Kevin
I created a css asset that can be applied to all pages that use the same mat-card and mat-card-header (like the food entry page). I also cleaned up some of the food entry page so it looks nicer.
Create and start working on the Group Finder page
I still need to figure out how to add the Bootstrap grid into the the CSS so I don't have to add it to every HTML file.
Karen
-rebuilding functions to make multiple functions run upon entering page
-look more into user creation on sendbird upon our signup
-midterms
Katherine 
What did you do yesterday? 
Connecting and creating the front end of the chat page using angular material and connecting the data and users with sendbird
What will you do today?
improve the front end
What is blocking your progress?
time
