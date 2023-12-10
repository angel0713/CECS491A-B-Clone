//variables have to exist anywhere in the project
export const environment = 
{
    production: true,
    //Workout environment files

    //base URL for diet, workout, registration; Replace this with AWS instance instance link on port 9992; maybe remove the / at the end to determine between domain vs URI
    //old domain: ec2-50-18-72-169.us-west-1.compute.amazonaws.com
    //oldest domain: localhost
    //working domain on localhost: ec2-13-56-4-81.us-west-1.compute.amazonaws.com
    //old port 9992
    domain: 'http://ec2-13-56-4-81.us-west-1.compute.amazonaws.com:9992/',
    //API Domain + Token (for workout)
    domainAPI: 'https://api.api-ninjas.com/v1/exercises?muscle=',
    apiToken: '+DtUIWAFl6kdh41FiLozdQ==epM2bhbS68zeaVX2',
    
    //Login 
    

    //Chat Environment Files
    APP_ID:'9B459E6F-CF6B-4D73-923C-374810E27CF1', 
    API_TOKEN: '610661abcffe855757fb1901c1ad0581f3864100',
    baseSBURL: 'https://api-' 
};
